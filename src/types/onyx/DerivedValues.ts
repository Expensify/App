import type {OnyxCollection} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
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
 * The derived value for ordered reports in the LHN (Left Hand Navigation).
 */
type OrderedReportsForLHNDerivedValue = {
    /**
     * The reports to display in the LHN.
     */
    reportsToDisplay: Record<
        string,
        Report & {
            /**
             * Whether the report has errors that need user attention, excluding SmartScan receipt failures.
             * This includes transaction violations that need review, policy-related issues, and other reportErrors.
             * Used to display a RBR indicator in the LHN.
             */
            hasErrorsOtherThanFailedReceipt?: boolean;
        }
    >;
    /**
     * The ordered report IDs.
     */
    orderedReportIDs: string[];
    /**
     * The current report ID.
     */
    currentReportID: string | undefined;
    /**
     * The locale used for sorting.
     */
    locale: string | null;
};

export default ReportAttributesDerivedValue;
export type {
    ReportAttributes,
    ReportAttributesDerivedValue,
    ReportTransactionsAndViolationsDerivedValue,
    ReportTransactionsAndViolations,
    OutstandingReportsByPolicyIDDerivedValue,
    OrderedReportsForLHNDerivedValue,
};
