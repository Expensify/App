import type {Card} from '@src/types/onyx';
import type {CompanyCardFeedWithDomainID} from '@src/types/onyx/CardFeeds';

type CardErrors = {
    errors: Card['errors'];
    errorFields: Card['errorFields'];
    pendingAction: Card['pendingAction'];
};

type CardFeedErrors = {
    shouldShowRBR: boolean;
    hasFailedCardAssignments: boolean;
    hasFeedError: boolean;
    isFeedConnectionBroken: boolean;
    cardErrors: Map<string, CardErrors>;
};

type AllCardFeedErrors = Map<number, Map<CompanyCardFeedWithDomainID, CardFeedErrors>>;

export type {CardFeedErrors, AllCardFeedErrors, CardErrors};
