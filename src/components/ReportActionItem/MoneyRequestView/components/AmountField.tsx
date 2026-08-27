import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';

import CONST from '@src/CONST';

import type {MoneyRequestViewData} from '../useMoneyRequestViewData';

type AmountFieldProps = {
    data: MoneyRequestViewData;
};

function AmountField({data}: AmountFieldProps) {
    return (
        <OfflineWithFeedback pendingAction={data.getPendingFieldAction('amount') ?? (data.amountTitle ? data.getPendingFieldAction('customUnitRateID') : undefined)}>
            <MenuItemWithTopDescription
                title={data.amountTitle}
                shouldShowTitleIcon={data.shouldShowPaid}
                titleIcon={data.icons.Checkmark}
                description={data.amountDescription}
                titleStyle={data.styles.textHeadlineH2}
                numberOfLinesTitle={2}
                interactive={data.canEditAmount}
                shouldShowRightIcon={data.canEditAmount}
                onPress={data.onAmountPress}
                brickRoadIndicator={data.getErrorForField('amount') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                errorText={data.getErrorForField('amount')}
                copyValue={data.amountCopyValue}
                copyable={!!data.amountCopyValue}
            />
        </OfflineWithFeedback>
    );
}

AmountField.displayName = 'AmountField';

export default AmountField;
