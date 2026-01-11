import type {OnyxCollection} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {Card, CardFeed} from '.';
import type {CompanyCardFeedWithNumber} from './CardFeeds';
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
 *
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
     *
     */
    errors?: Card['errors'];
    /**
     *
     */
    errorFields?: Card['errorFields'];
    /**
     *
     */
    pendingAction?: Card['pendingAction'];
};

/**
 * The errors of a card feed.
 */
type CardFeedErrors = {
    /**
     *
     */
    shouldShowRBR: boolean;
    /**
     *
     */
    hasFailedCardAssignments: boolean;
    /**
     *
     */
    hasFeedError: boolean;
    /**
     *
     */
    isFeedConnectionBroken: boolean;
    /**
     *
     */
    cardErrors: Record<string, CardErrors>;
};

type CardFeedId = CardFeed | CompanyCardFeedWithNumber;

/**
 *
 */
type AllCardFeedErrorsMap = Map<number, Map<CardFeedId, CardFeedErrors>>;

/**
 * The errors of all card feeds.
 */
type AllCardFeedErrors = Record<number, Record<CardFeedId, CardFeedErrors>>;

/**
 * The derived value for card feed errors.
 */
type CardFeedErrorsDerivedValue = AllCardFeedErrors;

export default ReportAttributesDerivedValue;
export type {
    ReportAttributes,
    ReportAttributesDerivedValue,
    ReportTransactionsAndViolationsDerivedValue,
    ReportTransactionsAndViolations,
    OutstandingReportsByPolicyIDDerivedValue,
    CardFeedErrorsDerivedValue,
    AllCardFeedErrorsMap,
    AllCardFeedErrors,
    CardFeedErrors,
    CardErrors,
};
