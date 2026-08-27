import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';

import CONST from '@src/CONST';

import type {MoneyRequestViewData} from '../useMoneyRequestViewData';

type DateFieldProps = {
    data: MoneyRequestViewData;
};

function DateField({data}: DateFieldProps) {
    return (
        <OfflineWithFeedback pendingAction={data.getPendingFieldAction('created')}>
            <MenuItemWithTopDescription
                description={data.dateDescription}
                title={data.actualTransactionDate}
                numberOfLinesTitle={2}
                interactive={data.canEditDate}
                shouldShowRightIcon={data.canEditDate}
                titleStyle={data.styles.flex1}
                onPress={data.onDatePress}
                brickRoadIndicator={data.getErrorForField('date') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                errorText={data.getErrorForField('date')}
                copyValue={data.dateCopyValue}
                copyable={!!data.dateCopyValue}
            />
        </OfflineWithFeedback>
    );
}

DateField.displayName = 'DateField';

export default DateField;
