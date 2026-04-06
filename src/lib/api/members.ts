import { supabase, supabaseAdmin } from "@/lib/supabase";
import type { Member } from "@/lib/database.types";

export async function getMembers(): Promise<Member[]> {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getMemberByProfileId(profileId: string): Promise<Member | null> {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateMember(
  id: string,
  updates: {
    name?: string;
    email?: string;
    club_role?: string;
    dues_status?: "paid" | "unpaid" | "waived";
    dues_amount?: number;
    payment_date?: string | null;
  }
): Promise<Member> {
  const { data, error } = await supabase
    .from("members")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteMember(id: string): Promise<void> {
  const { error } = await supabase.from("members").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export interface CsvMemberRow {
  name: string;
  email: string;
  role?: string;
  dues_amount?: number;
}

/**
 * Import members from a parsed CSV array.
 * Creates a Supabase invite email for each member and inserts into the members table.
 * Uses the admin client (service role) — move to an Edge Function in production.
 */
export async function importMembersFromCsv(rows: CsvMemberRow[]): Promise<{
  imported: number;
  errors: Array<{ email: string; error: string }>;
}> {
  let imported = 0;
  const errors: Array<{ email: string; error: string }> = [];

  for (const row of rows) {
    if (!row.email || !row.name) {
      errors.push({ email: row.email ?? "(missing)", error: "name and email are required" });
      continue;
    }

    try {
      // Invite user via Supabase Auth (sends invite email)
      const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        row.email,
        { data: { name: row.name, role: "member" } }
      );
      if (inviteError && inviteError.message !== "User already registered") {
        errors.push({ email: row.email, error: inviteError.message });
        continue;
      }

      // Upsert into members table
      const profileId = inviteData?.user?.id ?? null;
      const { error: memberError } = await supabase
        .from("members")
        .upsert(
          {
            profile_id: profileId,
            name: row.name,
            email: row.email,
            club_role: row.role ?? "Analyst",
            dues_amount: row.dues_amount ?? 0,
            dues_status: "unpaid",
          },
          { onConflict: "email" }
        );

      if (memberError) {
        errors.push({ email: row.email, error: memberError.message });
        continue;
      }

      // If profile exists, ensure it has member role
      if (profileId) {
        await supabaseAdmin
          .from("profiles")
          .update({ role: "member" })
          .eq("id", profileId);
      }

      imported++;
    } catch (e) {
      errors.push({ email: row.email, error: String(e) });
    }
  }

  return { imported, errors };
}

/** Parse a CSV string into member rows */
export function parseMemberCsv(csv: string): CsvMemberRow[] {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] ?? ""; });
    return {
      name: row.name ?? row.full_name ?? "",
      email: row.email ?? "",
      role: row.role ?? row.club_role ?? undefined,
      dues_amount: row.dues_amount ? parseFloat(row.dues_amount) : undefined,
    };
  });
}
