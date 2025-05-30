import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {Errors} from './OnyxCommon';
import type Transaction from './Transaction';

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
 * The derived value for report transactions.
 */
type ReportTransactionsDerivedValue = Record<string, Transaction[]>;

export default ReportAttributesDerivedValue;
export type {ReportAttributes, ReportAttributesDerivedValue, ReportTransactionsDerivedValue};
