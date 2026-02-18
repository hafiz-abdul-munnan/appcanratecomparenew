
export enum StepType {
    BUTTON_SELECTION = 'BUTTON_SELECTION',
    SELECT_DROPDOWN = 'SELECT_DROPDOWN',
    SIMPLE_INPUT = 'SIMPLE_INPUT',
    CONTACT_FORM = 'CONTACT_FORM',
    OTP_VERIFICATION = 'OTP_VERIFICATION'
}

export interface FunnelStep {
    id: string;
    question: string;
    subtext?: string;
    type: StepType;
    options?: string[];
    placeholder?: string;
}

export interface FormData {
    tobaccoUse?: string;
    coverageType?: string;
    policyGoal?: string;
    coverageAmount?: string;
    province?: string;
    ageRange?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    otp?: string;
    [key: string]: string | undefined;
}

export type VerificationState = 'idle' | 'sending' | 'pending_otp' | 'verifying' | 'verified' | 'error';
