export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          role: "admin" | "member" | "applicant";
          avatar_url: string | null;
          major: string | null;
          grad_year: string | null;
          linkedin_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          role?: "admin" | "member" | "applicant";
          avatar_url?: string | null;
          major?: string | null;
          grad_year?: string | null;
          linkedin_url?: string | null;
        };
        Update: {
          name?: string | null;
          role?: "admin" | "member" | "applicant";
          avatar_url?: string | null;
          major?: string | null;
          grad_year?: string | null;
          linkedin_url?: string | null;
        };
      };
      members: {
        Row: {
          id: string;
          profile_id: string | null;
          name: string;
          email: string;
          club_role: string | null;
          dues_status: "paid" | "unpaid" | "waived";
          dues_amount: number;
          payment_date: string | null;
          join_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          profile_id?: string | null;
          name: string;
          email: string;
          club_role?: string | null;
          dues_status?: "paid" | "unpaid" | "waived";
          dues_amount?: number;
          payment_date?: string | null;
          join_date?: string;
        };
        Update: {
          name?: string;
          email?: string;
          club_role?: string | null;
          dues_status?: "paid" | "unpaid" | "waived";
          dues_amount?: number;
          payment_date?: string | null;
        };
      };
      applicants: {
        Row: {
          id: string;
          profile_id: string | null;
          email: string;
          name: string;
          current_round: "r0" | "r1" | "r2";
          status: "pending" | "accepted" | "rejected" | "withdrawn";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          profile_id?: string | null;
          email: string;
          name: string;
          current_round?: "r0" | "r1" | "r2";
          status?: "pending" | "accepted" | "rejected" | "withdrawn";
        };
        Update: {
          current_round?: "r0" | "r1" | "r2";
          status?: "pending" | "accepted" | "rejected" | "withdrawn";
        };
      };
      applications: {
        Row: {
          id: string;
          applicant_id: string;
          name: string;
          email: string;
          phone: string | null;
          school: string | null;
          major: string | null;
          year: string | null;
          gpa: string | null;
          linkedin_url: string | null;
          resume_url: string | null;
          essay_answers: Json;
          submitted_at: string;
          created_at: string;
        };
        Insert: {
          applicant_id: string;
          name: string;
          email: string;
          phone?: string | null;
          school?: string | null;
          major?: string | null;
          year?: string | null;
          gpa?: string | null;
          linkedin_url?: string | null;
          resume_url?: string | null;
          essay_answers?: Json;
        };
        Update: {
          resume_url?: string | null;
          essay_answers?: Json;
        };
      };
      round_config: {
        Row: {
          id: string;
          round: "r0" | "r1" | "r2";
          is_open: boolean;
          essay_questions: Json;
          case_file_url: string | null;
          resource_links: Json;
          updated_at: string;
        };
        Insert: {
          round: "r0" | "r1" | "r2";
          is_open?: boolean;
          essay_questions?: Json;
          case_file_url?: string | null;
          resource_links?: Json;
        };
        Update: {
          is_open?: boolean;
          essay_questions?: Json;
          case_file_url?: string | null;
          resource_links?: Json;
        };
      };
      interview_slots: {
        Row: {
          id: string;
          round: "r1" | "r2";
          slot_datetime: string;
          is_booked: boolean;
          booked_by: string | null;
          created_at: string;
        };
        Insert: {
          round: "r1" | "r2";
          slot_datetime: string;
          is_booked?: boolean;
          booked_by?: string | null;
        };
        Update: {
          is_booked?: boolean;
          booked_by?: string | null;
        };
      };
      dues_records: {
        Row: {
          id: string;
          member_id: string;
          amount: number;
          due_date: string | null;
          paid: boolean;
          paid_at: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          member_id: string;
          amount: number;
          due_date?: string | null;
          paid?: boolean;
          paid_at?: string | null;
          notes?: string | null;
        };
        Update: {
          amount?: number;
          due_date?: string | null;
          paid?: boolean;
          paid_at?: string | null;
          notes?: string | null;
        };
      };
    };
  };
}

// Convenience row types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Member = Database["public"]["Tables"]["members"]["Row"];
export type Applicant = Database["public"]["Tables"]["applicants"]["Row"];
export type Application = Database["public"]["Tables"]["applications"]["Row"];
export type RoundConfig = Database["public"]["Tables"]["round_config"]["Row"];
export type InterviewSlot = Database["public"]["Tables"]["interview_slots"]["Row"];
export type DuesRecord = Database["public"]["Tables"]["dues_records"]["Row"];

export interface EssayQuestion {
  id: string;
  text: string;
}

export interface ResourceLink {
  label: string;
  url: string;
}

export interface EssayAnswer {
  question_id: string;
  question_text: string;
  answer: string;
}
