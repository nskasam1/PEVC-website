import { supabase, supabaseAdmin } from "@/lib/supabase";
import type { Profile } from "@/lib/database.types";

/** Admin only — fetch all profiles (RLS allows this for admin role) */
export async function getAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function updateProfileAdmin(
  id: string,
  updates: {
    name?: string;
    role?: "admin" | "member" | "applicant";
    major?: string;
    grad_year?: string;
    linkedin_url?: string;
  }
): Promise<Profile> {
  // Use admin client so we can update any user's profile regardless of RLS
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}
