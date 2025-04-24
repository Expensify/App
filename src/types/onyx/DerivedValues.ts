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

export default ReportAttributes;
