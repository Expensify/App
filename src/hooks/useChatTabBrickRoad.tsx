import {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAttributesDerivedValue} from '@src/types/onyx';

type BrickRoad = ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS> | undefined;

/**
 * Lightweight hook to determine chat tab brick road status without processing all reports.
 * This avoids the expensive useSidebarOrderedReports computation during tab switching.
 */
function useChatTabBrickRoad(): BrickRoad {
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});
    const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {
        selector: (value) => value?.reports,
        canBeMissing: true,
    });

    return useMemo(() => {
        if (!reports || !reportAttributes) {
            return undefined;
        }

        // Look for any report with brick road status in priority order:
        // 1. ERROR status (red brick road) - highest priority
        // 2. INFO status (green brick road) - lower priority
        let hasInfoBrickRoad = false;

        // We only need to check reports that have brick road attributes
        // This is much more efficient than processing all reports through the full sorting logic
        for (const reportID of Object.keys(reportAttributes)) {
            const brickRoadStatus = reportAttributes[reportID]?.brickRoadStatus;
            
            if (brickRoadStatus === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR) {
                // Found an error brick road - this has highest priority, return immediately
                return CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
            }
            
            if (brickRoadStatus === CONST.BRICK_ROAD_INDICATOR_STATUS.INFO) {
                // Found an info brick road - remember it but keep looking for errors
                hasInfoBrickRoad = true;
            }
        }

        // Return info brick road if we found one and no errors
        return hasInfoBrickRoad ? CONST.BRICK_ROAD_INDICATOR_STATUS.INFO : undefined;
    }, [reports, reportAttributes]);
}

export default useChatTabBrickRoad;