import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {MoneyRequestViewData} from '@components/ReportActionItem/MoneyRequestView/useMoneyRequestViewData';

import CONST from '@src/CONST';

type DistanceRequestFieldsProps = {
    data: MoneyRequestViewData;
};

function DistanceRequestFields({data}: DistanceRequestFieldsProps) {
    return (
        <>
            <OfflineWithFeedback pendingAction={data.getPendingFieldAction('waypoints') ?? data.getPendingFieldAction('merchant')}>
                <MenuItemWithTopDescription
                    description={data.distanceToDisplayDescription}
                    title={data.distanceToDisplay}
                    hintText={data.distanceToDisplayHintText}
                    numberOfLinesTitle={2}
                    interactive={data.canEditDistance}
                    shouldShowRightIcon={data.canEditDistance}
                    titleStyle={data.styles.flex1}
                    onPress={data.onDistancePress}
                    brickRoadIndicator={data.getErrorForField('waypoints') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    errorText={data.getErrorForField('waypoints')}
                    copyValue={data.distanceCopyValue}
                    copyable={!!data.distanceCopyValue}
                />
            </OfflineWithFeedback>
            <OfflineWithFeedback pendingAction={data.getPendingFieldAction('customUnitRateID')}>
                <MenuItemWithTopDescription
                    description={data.translate('common.rate')}
                    title={data.rateToDisplay}
                    numberOfLinesTitle={2}
                    interactive={data.canEditDistanceRate}
                    shouldShowRightIcon={data.canEditDistanceRate}
                    titleStyle={data.styles.flex1}
                    onPress={data.onDistanceRatePress}
                    brickRoadIndicator={data.getErrorForField('customUnitRateID') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    errorText={data.getErrorForField('customUnitRateID')}
                    copyValue={data.distanceRateCopyValue}
                    copyable={!!data.distanceRateCopyValue}
                />
            </OfflineWithFeedback>
        </>
    );
}

DistanceRequestFields.displayName = 'DistanceRequestFields';

export default DistanceRequestFields;
