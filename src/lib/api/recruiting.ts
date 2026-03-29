import { supabase } from "@/lib/supabase";
import type { RoundConfig, InterviewSlot, EssayQuestion, ResourceLink } from "@/lib/database.types";

// ─── Round Config ─────────────────────────────────────────────

export async function getRoundConfigs(): Promise<RoundConfig[]> {
  const { data, error } = await supabase.from("round_config").select("*").order("round");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getRoundConfig(round: "r0" | "r1" | "r2"): Promise<RoundConfig | null> {
  const { data, error } = await supabase
    .from("round_config")
    .select("*")
    .eq("round", round)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateRoundOpen(round: "r0" | "r1" | "r2", isOpen: boolean): Promise<void> {
  const { error } = await supabase
    .from("round_config")
    .update({ is_open: isOpen })
    .eq("round", round);
  if (error) throw new Error(error.message);
}

export async function updateEssayQuestions(questions: EssayQuestion[]): Promise<void> {
  const { error } = await supabase
    .from("round_config")
    .update({ essay_questions: questions as unknown as import("@/lib/database.types").Json })
    .eq("round", "r0");
  if (error) throw new Error(error.message);
}

export async function updateResourceLinks(
  round: "r1" | "r2",
  links: ResourceLink[]
): Promise<void> {
  const { error } = await supabase
    .from("round_config")
    .update({ resource_links: links as unknown as import("@/lib/database.types").Json })
    .eq("round", round);
  if (error) throw new Error(error.message);
}

export async function uploadCaseFile(round: "r1" | "r2", file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${round}/case-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("case-files").upload(path, file, { upsert: true });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("case-files").getPublicUrl(path);
  const url = data.publicUrl;

  // Save URL to round_config
  const { error: updateError } = await supabase
    .from("round_config")
    .update({ case_file_url: url })
    .eq("round", round);
  if (updateError) throw new Error(updateError.message);

  return url;
}

// ─── Interview Slots ──────────────────────────────────────────

export async function getSlots(round: "r1" | "r2"): Promise<InterviewSlot[]> {
  const { data, error } = await supabase
    .from("interview_slots")
    .select("*")
    .eq("round", round)
    .order("slot_datetime");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getAvailableSlots(round: "r1" | "r2"): Promise<InterviewSlot[]> {
  const { data, error } = await supabase
    .from("interview_slots")
    .select("*")
    .eq("round", round)
    .eq("is_booked", false)
    .order("slot_datetime");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createSlot(round: "r1" | "r2", datetime: string): Promise<InterviewSlot> {
  const { data, error } = await supabase
    .from("interview_slots")
    .insert({ round, slot_datetime: datetime })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteSlot(id: string): Promise<void> {
  const { error } = await supabase.from("interview_slots").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function bookSlot(slotId: string, applicantId: string): Promise<void> {
  // Optimistic concurrency: only update if still unbooked
  const { error } = await supabase
    .from("interview_slots")
    .update({ is_booked: true, booked_by: applicantId })
    .eq("id", slotId)
    .eq("is_booked", false);
  if (error) throw new Error(error.message);
}

export async function getBookedSlotForApplicant(applicantId: string): Promise<InterviewSlot | null> {
  const { data, error } = await supabase
    .from("interview_slots")
    .select("*")
    .eq("booked_by", applicantId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}
