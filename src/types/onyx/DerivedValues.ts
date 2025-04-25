import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

/**
 * The attributes of a report.
 */
type ReportAttributes = {
    /**
     * The name of the report.
     */
    reportName: string;
    /**
     * The status of the brick road.
     */
    brickRoadStatus: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS> | undefined;
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

export default ReportAttributesDerivedValue;
export type {ReportAttributes};
