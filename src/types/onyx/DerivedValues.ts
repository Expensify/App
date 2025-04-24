import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {ReportAction} from '.';
import type {ErrorFields, Errors} from './OnyxCommon';

/**
 * The attributes of a report.
 */
type ReportAttributes = {
    /**
     * The name of the report.
     */
    reportName: string;
    /**
     * The errors of the report.
     */
    reportErrors: Errors;
    /**
     * The errors of the report actions.
     */
    reportActionsErrors: {
        /**
         * The errors of the report action.
         */
        errors: ErrorFields;
        /**
         * The report action.
         */
        reportAction?: OnyxEntry<ReportAction>;
    };
    /**
     * Whether the report has violations to display in the LHN.
     */
    hasViolationsToDisplayInLHN: boolean;
    /**
     * Whether the report has any kind of violations.
     */
    hasAnyViolations: boolean;
    /**
     * The ID of the one transaction thread report.
     */
    oneTransactionThreadReportID: string | undefined;
    /**
     * The status of the brick road.
     */
    brickRoadStatus: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS> | undefined;
    /**
     * Whether the report requires attention from the current user.
     */
    requiresAttention: boolean;
};

export default ReportAttributes;
