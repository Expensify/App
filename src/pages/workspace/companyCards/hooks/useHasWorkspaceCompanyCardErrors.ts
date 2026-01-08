import type {CompanyCardFeedWithDomainID} from '@hooks/useCardFeeds';
import useCompanyCards from '@hooks/useCompanyCards';
import useCardFeedErrors from './useCardFeedErrors';

type UseHasWorkspaceCompanyCardErrorsProps = {
    policyID: string | undefined;
};

function useHasWorkspaceCompanyCardErrors({policyID}: UseHasWorkspaceCompanyCardErrorsProps): boolean {
    const {companyCardFeeds} = useCompanyCards({policyID});
    const companyCardFeedNames = Object.keys(companyCardFeeds ?? {}) as CompanyCardFeedWithDomainID[];
    const {getCardFeedErrors} = useCardFeedErrors({policyID});
    const hasCompanyCardFeedError = companyCardFeedNames.some((feed) => getCardFeedErrors(feed).shouldShowRBR);
    return hasCompanyCardFeedError;
}

export default useHasWorkspaceCompanyCardErrors;
