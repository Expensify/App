import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {MoneyRequestViewData} from '@components/ReportActionItem/MoneyRequestView/useMoneyRequestViewData';

import CONST from '@src/CONST';

type TaxRateFieldProps = {
    data: MoneyRequestViewData;
};

function TaxRateField({data}: TaxRateFieldProps) {
    return (
        <OfflineWithFeedback pendingAction={data.getPendingFieldAction('taxCode')}>
            <MenuItemWithTopDescription
                title={data.taxRateValue}
                description={data.taxRatesDescription ?? data.translate('common.tax')}
                numberOfLinesTitle={2}
                interactive={data.canEditTaxFields}
                shouldShowRightIcon={data.canEditTaxFields}
                titleStyle={data.styles.flex1}
                onPress={data.onTaxRatePress}
                brickRoadIndicator={data.getErrorForField('tax') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                errorText={data.getErrorForField('tax')}
                copyValue={data.taxRateCopyValue}
                copyable={!!data.taxRateCopyValue}
            />
        </OfflineWithFeedback>
    );
}

TaxRateField.displayName = 'TaxRateField';

export default TaxRateField;
