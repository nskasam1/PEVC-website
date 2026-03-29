import { Application, EssayPrompts, RecruitingConfig, StoredFile } from "@/types/application";
import { toast } from "sonner";

const APPLICATIONS_KEY = "pevc_applications";
const FILES_KEY = "pevc_files";
const ESSAY_PROMPTS_KEY = "pevc_essay_prompts";
const RECRUITING_CONFIG_KEY = "pevc_recruiting_config";
const STAGE_OVERRIDES_KEY = "pevc_stage_overrides";

const DEFAULT_ESSAY_PROMPTS: EssayPrompts = {
  essay1:
    "Why are you interested in private equity and venture capital? What specific experiences or insights have shaped this interest?",
  essay2:
    "Describe a company or deal you find compelling. Walk us through your analysis of its business model, competitive position, and key risks.",
};

const DEFAULT_RECRUITING_CONFIG: RecruitingConfig = {
  stages: {
    Application: { deadline: "", hearBackBy: "" },
    "Round 1": { deadline: "", hearBackBy: "", calendlyUrl: "", caseMaterials: [], resources: [] },
    "Round 2": { deadline: "", hearBackBy: "", calendlyUrl: "", caseMaterials: [], resources: [] },
  },
};

// ── Applications ──────────────────────────────────────────────────────────────

export function getApplications(): Application[] {
  try {
    const raw = localStorage.getItem(APPLICATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveApplication(app: Application): boolean {
  const existing = getApplications();
  const duplicate = existing.find(
    (a) => a.email.toLowerCase() === app.email.toLowerCase()
  );
  if (duplicate) {
    toast.error("An application from this email already exists.");
    return false;
  }
  try {
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify([...existing, app]));
    return true;
  } catch (e) {
    if (e instanceof DOMException) {
      toast.error("Storage limit reached. Please clear browser data and try again.");
    } else {
      toast.error("Failed to save application. Please try again.");
    }
    return false;
  }
}

// ── Stage Overrides ───────────────────────────────────────────────────────────

export function getStageOverrides(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STAGE_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getApplicantStage(applicationId: string): string {
  const overrides = getStageOverrides();
  return overrides[applicationId] ?? "Application";
}

// ── Essay Prompts ─────────────────────────────────────────────────────────────

export function getEssayPrompts(): EssayPrompts {
  try {
    const raw = localStorage.getItem(ESSAY_PROMPTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fall through to defaults
  }
  localStorage.setItem(ESSAY_PROMPTS_KEY, JSON.stringify(DEFAULT_ESSAY_PROMPTS));
  return DEFAULT_ESSAY_PROMPTS;
}

export function saveEssayPrompts(prompts: EssayPrompts): void {
  localStorage.setItem(ESSAY_PROMPTS_KEY, JSON.stringify(prompts));
}

// ── Recruiting Config ─────────────────────────────────────────────────────────

export function getRecruitingConfig(): RecruitingConfig {
  try {
    const raw = localStorage.getItem(RECRUITING_CONFIG_KEY);
    if (raw) {
      // Deep merge with defaults so new fields don't break old saved configs
      const saved = JSON.parse(raw) as RecruitingConfig;
      return {
        stages: {
          Application: { ...DEFAULT_RECRUITING_CONFIG.stages.Application, ...saved.stages?.Application },
          "Round 1": { ...DEFAULT_RECRUITING_CONFIG.stages["Round 1"], ...saved.stages?.["Round 1"] },
          "Round 2": { ...DEFAULT_RECRUITING_CONFIG.stages["Round 2"], ...saved.stages?.["Round 2"] },
        },
      };
    }
  } catch {
    // fall through
  }
  return DEFAULT_RECRUITING_CONFIG;
}

export function saveRecruitingConfig(config: RecruitingConfig): void {
  localStorage.setItem(RECRUITING_CONFIG_KEY, JSON.stringify(config));
}

// ── Files ─────────────────────────────────────────────────────────────────────

export function saveResumeFile(file: File, email: string): Promise<StoredFile> {
  return new Promise((resolve, reject) => {
    if (file.type !== "application/pdf") {
      reject(new Error("Only PDF files are accepted."));
      return;
    }
    if (file.size === 0) {
      reject(new Error("The selected file appears to be empty."));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error("Resume must be under 5 MB."));
      return;
    }
    readFileAsBase64(file).then((base64Data) => {
      const entry: StoredFile = {
        id: Date.now().toString(),
        name: file.name.replace(/[^a-zA-Z0-9._\-]/g, "_"),
        size: file.size,
        uploadedBy: email,
        uploadedAt: new Date().toISOString(),
        deliverableId: "resume",
        type: "resume",
        applicantEmail: email,
        base64Data,
      };
      try {
        const existing: StoredFile[] = JSON.parse(localStorage.getItem(FILES_KEY) || "[]");
        localStorage.setItem(FILES_KEY, JSON.stringify([...existing, entry]));
        resolve(entry);
      } catch (err) {
        reject(new Error(err instanceof DOMException ? "Storage limit reached. Try a smaller file." : "Failed to save file."));
      }
    }).catch(() => reject(new Error("Failed to read file. Please try again.")));
  });
}

export function getFileById(id: string): StoredFile | undefined {
  try {
    const files: StoredFile[] = JSON.parse(localStorage.getItem(FILES_KEY) || "[]");
    return files.find((f) => f.id === id);
  } catch {
    return undefined;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}

export function formatDeadline(iso: string): string {
  if (!iso) return "TBD";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
