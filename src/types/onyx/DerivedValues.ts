import type {OnyxCollection} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {Card} from '.';
import type {CardFeedWithDomainID, CompanyCardFeedWithNumber} from './CardFeeds';
import type {Errors} from './OnyxCommon';
import type Report from './Report';
import type Transaction from './Transaction';
import type TransactionViolations from './TransactionViolation';

/**
 * The attributes of a report.
 */
type ReportAttributes = {
    /**
     * The name of the report.
     */
    reportName: string;
    /**
     * Whether the report is empty (has no visible messages).
     */
    isEmpty: boolean;
    /**
     * The status of the brick road.
     */
    brickRoadStatus: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS> | undefined;
    /**
     * Whether the report requires attention from current user.
     */
    requiresAttention: boolean;
    /**
     * The errors of the report.
     */
    reportErrors: Errors;
};

/**
 * The derived value for report attributes.
 */
type ReportAttributesDerivedValue = {
    /**
     * The report attributes.
     */
    reports: Record<string, ReportAttributes>;
    /**
     * The locale used to compute the report attributes.
     */
    locale: string | null;
};

/**
 * The transactions and violations of a report.
 */
type ReportTransactionsAndViolations = {
    /**
     * The transactions of the report.
     */
    transactions: Record<string, Transaction>;
    /**
     * The violations of the report.
     */
    violations: Record<string, TransactionViolations>;
};

/**
 * The derived value for report transactions.
 */
type ReportTransactionsAndViolationsDerivedValue = Record<string, ReportTransactionsAndViolations>;

/**
 * The derived value for report outstanding reports.
 */
type OutstandingReportsByPolicyIDDerivedValue = Record<string, OnyxCollection<Report>>;

/**
 * The errors of a card.
 */
type CardErrors = {
    /**
     * The errors of the card.
     */
    errors?: Card['errors'];
    /**
     * The form field errors of the card.
     */
    errorFields?: Card['errorFields'];
    /**
     * Whether the card has a pending action.
     */
    pendingAction?: Card['pendingAction'];
};

/**
 * The state of card feed errors.
 */
type CardFeedErrorState = {
    /**
     * Whether to show the RBR for a specific feed within a workspace/domain.
     * This will be true, if any of the below conditions are true:
     * - There are failed card assignments for the feed.
     * - There are errors for the workspace/domain.
     * - There are errors for the feed.
     * - The feed connection is broken.
     */
    shouldShowRBR: boolean;

    /**
     * Whether some failed card assignments.
     */
    hasFailedCardAssignments: boolean;

    /**
     * Whether a specific feed within a workspace/domain has errors.
     */
    hasFeedErrors: boolean;

    /**
     * Whether some workspace has errors.
     */
    // hasWorkspaceErrors: boolean;

    /**
     * Whether some feed connection is broken.
     */
    isFeedConnectionBroken: boolean;
};

/**
 * The errors of a card feed.
 */
type FeedErrors = CardFeedErrorState & {
    /**
     * The errors of the feed.
     */
    feedErrors?: Errors;
    /**
     * The errors of all cards for a specific feed within a workspace/domain.
     */
    cardErrors: Record<string, CardErrors>;
};

/**
 * The ID of a card feed in the errors map/object.
 */
type CardFeedId = CompanyCardFeedWithNumber;

/**
 * The errors of all card feeds by workspace account ID and feed name with domain ID.
 */
type AllCardFeedErrorsMap = Map<number, Map<CardFeedId, FeedErrors>>;

/**
 * The errors of all card feeds.
 */
type CardFeedErrorsObject = Record<CardFeedWithDomainID, FeedErrors>;

/**
 * The errors of card feeds.
 */
type CardFeedErrors = {
    /**
     * The errors of all card feeds by feed name with domain ID.
     */
    cardFeedErrors: CardFeedErrorsObject;

    /**
     * The cards with a broken feed connection.
     */
    cardsWithBrokenFeedConnection: Record<string, Card>;

    /**
     * Whether to show the RBR for each workspace account ID.
     */
    shouldShowRbrForWorkspaceAccountID: Record<number, boolean>;

    /**
     * Whether to show the RBR for each feed name with domain ID.
     */
    shouldShowRbrForFeedNameWithDomainID: Record<string, boolean>;

    /**
     * The errors of all card feeds.
     */
    all: CardFeedErrorState;

    /**
     * The errors of company cards.
     */
    companyCards: CardFeedErrorState;

    /**
     * The errors of expensify card.
     */
    expensifyCard: CardFeedErrorState;
};

/**
 * The derived value for card feed errors.
 */
type CardFeedErrorsDerivedValue = CardFeedErrors;

export default ReportAttributesDerivedValue;
export type {
    ReportAttributes,
    ReportAttributesDerivedValue,
    ReportTransactionsAndViolationsDerivedValue,
    ReportTransactionsAndViolations,
    OutstandingReportsByPolicyIDDerivedValue,
    CardFeedErrorsDerivedValue,
    AllCardFeedErrorsMap,
    CardFeedErrorsObject,
    FeedErrors,
    CardFeedErrorState,
    CardFeedErrors,
    CardErrors,
};
