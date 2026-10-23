import type {Errors} from './OnyxCommon';

/** The Wise business onboarding's Submit from the terms page. The key is RAM only, so an app closed mid-request does not leave Confirm loading. */
type WiseBusinessOnboardingSubmit = {
    /** Whether the request is running */
    isLoading?: boolean;

    errors?: Errors;
};

export default WiseBusinessOnboardingSubmit;
