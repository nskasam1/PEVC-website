export type Stage = "Application" | "Round 1" | "Round 2";

export interface Application {
  id: string;
  submittedAt: string;
  stage: "Application";
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  school: string;
  major: string;
  gradYear: string;
  linkedinUrl: string;
  resumeFileId: string;
  resumeFileName: string;
  essay1Prompt: string;
  essay1: string;
  essay2Prompt: string;
  essay2: string;
}

export interface StoredFile {
  id: string;
  name: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  deliverableId: string;
  type: "resume" | "deliverable";
  applicantEmail: string;
  base64Data: string;
}

export interface EssayPrompts {
  essay1: string;
  essay2: string;
}

export interface StageResource {
  id: string;
  label: string;
  url: string;
}

export interface CaseMaterial {
  id: string;
  name: string;
  base64Data: string;
  uploadedAt: string;
}

export interface StageConfig {
  deadline: string;       // ISO date string (YYYY-MM-DD)
  hearBackBy: string;     // ISO date string
  calendlyUrl?: string;
  caseMaterials?: CaseMaterial[];
  resources?: StageResource[];
}

export interface RecruitingConfig {
  stages: {
    Application: StageConfig;
    "Round 1": StageConfig;
    "Round 2": StageConfig;
  };
}
