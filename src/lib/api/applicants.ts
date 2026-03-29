import { supabase } from "@/lib/supabase";
import type { Applicant, Application, EssayAnswer } from "@/lib/database.types";

/** Get or create an applicant record for the current user */
export async function getOrCreateApplicant(profileId: string, name: string, email: string): Promise<Applicant> {
  const { data: existing, error: selectErr } = await supabase
    .from("applicants")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();
  if (selectErr) throw new Error(selectErr.message);
  if (existing) return existing;

  const { data, error } = await supabase
    .from("applicants")
    .insert({ profile_id: profileId, name, email })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getApplicantByProfileId(profileId: string): Promise<Applicant | null> {
  const { data, error } = await supabase
    .from("applicants")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function getApplicationByApplicantId(applicantId: string): Promise<Application | null> {
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("applicant_id", applicantId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export interface SubmitApplicationPayload {
  applicantId: string;
  name: string;
  email: string;
  phone: string;
  school: string;
  major: string;
  year: string;
  gpa: string;
  linkedinUrl: string;
  resumeUrl: string | null;
  essayAnswers: EssayAnswer[];
}

export async function submitApplication(payload: SubmitApplicationPayload): Promise<Application> {
  const { data, error } = await supabase
    .from("applications")
    .insert({
      applicant_id: payload.applicantId,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      school: payload.school,
      major: payload.major,
      year: payload.year,
      gpa: payload.gpa,
      linkedin_url: payload.linkedinUrl,
      resume_url: payload.resumeUrl,
      essay_answers: payload.essayAnswers as unknown as import("@/lib/database.types").Json,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function uploadResume(applicantId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${applicantId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("resumes").upload(path, file, { upsert: true });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from("resumes").getPublicUrl(path);
  return data.publicUrl;
}

// ─── Admin functions ──────────────────────────────────────────

export async function getAllApplicants(): Promise<Applicant[]> {
  const { data, error } = await supabase
    .from("applicants")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getApplicationsByApplicantIds(ids: string[]): Promise<Application[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .in("applicant_id", ids);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function advanceApplicant(
  id: string,
  nextRound: "r1" | "r2"
): Promise<void> {
  const { error } = await supabase
    .from("applicants")
    .update({ current_round: nextRound })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function setApplicantStatus(
  id: string,
  status: "accepted" | "rejected" | "withdrawn"
): Promise<void> {
  const { error } = await supabase
    .from("applicants")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
}
