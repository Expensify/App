import type Domain from '@src/types/onyx/Domain';
import type {FileObject} from '@src/types/utils/Attachment';

const MAX_TAX_RETURN_SIZE = 5 * 1024 * 1024;

function isValidLimitIncreaseAmount(value: string): boolean {
    return /^\d+(?:\.\d{1,2})?$/.test(value.trim()) && Number(value) > 0;
}

function isValidTaxReturn(file: FileObject | undefined): boolean {
    return !!file?.name && /\.pdf$/i.test(file.name) && (!file.type || file.type === 'application/pdf') && typeof file.size === 'number' && file.size > 0 && file.size <= MAX_TAX_RETURN_SIZE;
}

function hasLimitRequestInProgress(domain: Pick<Domain, 'private_limitRequestInProgress'> | undefined): boolean {
    return domain?.private_limitRequestInProgress != null;
}

type LimitIncreaseForm = {
    desiredLimit: string;
    annualRevenue: string;
    taxReturnFile?: FileObject;
    hasAuthorized: boolean;
    isOffline: boolean;
    isPending: boolean;
    isSubmissionAvailable: boolean;
};

function canSubmitLimitIncreaseRequest({desiredLimit, annualRevenue, taxReturnFile, hasAuthorized, isOffline, isPending, isSubmissionAvailable}: LimitIncreaseForm): boolean {
    return (
        isSubmissionAvailable &&
        !isOffline &&
        !isPending &&
        isValidLimitIncreaseAmount(desiredLimit) &&
        isValidLimitIncreaseAmount(annualRevenue) &&
        isValidTaxReturn(taxReturnFile) &&
        hasAuthorized
    );
}

export {isValidLimitIncreaseAmount, isValidTaxReturn, hasLimitRequestInProgress, canSubmitLimitIncreaseRequest};
