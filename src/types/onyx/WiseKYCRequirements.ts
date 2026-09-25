import type {DynamicFormField} from './DynamicFormField';

/** One outstanding Wise KYC requirement, flattened by Auth from the review's AND/OR requirement groups */
type WiseKYCRequirement = {
    /** Wise's requirement key, e.g. BUSINESS_ULTIMATE_BENEFICIAL_OWNER_ID */
    key: string;

    /** NOT_PROVIDED until submitted */
    state: string;

    /** Opens Wise's embedded page instead of a form */
    hostedOnly: boolean;

    fields: DynamicFormField[];
};

/** Wise's outstanding onboarding requirements; replaced after every submission because satisfying one can expose another */
type WiseKYCRequirements = WiseKYCRequirement[];

export type {WiseKYCRequirement, WiseKYCRequirements};
