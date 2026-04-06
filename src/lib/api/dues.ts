import { supabase } from "@/lib/supabase";
import type { DuesRecord } from "@/lib/database.types";

export async function getDuesByMemberId(memberId: string): Promise<DuesRecord[]> {
  const { data, error } = await supabase
    .from("dues_records")
    .select("*")
    .eq("member_id", memberId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getAllDuesRecords(): Promise<DuesRecord[]> {
  const { data, error } = await supabase
    .from("dues_records")
    .select("*, members(name, email)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createDuesRecord(record: {
  memberId: string;
  amount: number;
  dueDate?: string;
  notes?: string;
}): Promise<DuesRecord> {
  const { data, error } = await supabase
    .from("dues_records")
    .insert({
      member_id: record.memberId,
      amount: record.amount,
      due_date: record.dueDate ?? null,
      notes: record.notes ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function markDuesPaid(id: string): Promise<void> {
  const { error } = await supabase
    .from("dues_records")
    .update({ paid: true, paid_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function markDuesUnpaid(id: string): Promise<void> {
  const { error } = await supabase
    .from("dues_records")
    .update({ paid: false, paid_at: null })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteDuesRecord(id: string): Promise<void> {
  const { error } = await supabase.from("dues_records").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Sync the member.dues_status shortcut field after paying/unpaying */
export async function syncMemberDuesStatus(memberId: string): Promise<void> {
  const records = await getDuesByMemberId(memberId);
  const hasUnpaid = records.some((r) => !r.paid);
  await supabase
    .from("members")
    .update({
      dues_status: hasUnpaid ? "unpaid" : "paid",
      payment_date: hasUnpaid ? null : new Date().toISOString(),
    })
    .eq("id", memberId);
}
