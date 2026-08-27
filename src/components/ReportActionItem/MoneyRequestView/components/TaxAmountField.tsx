import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';

import type {MoneyRequestViewData} from '../useMoneyRequestViewData';

type TaxAmountFieldProps = {
    data: MoneyRequestViewData;
};

function TaxAmountField({data}: TaxAmountFieldProps) {
    return (
        <OfflineWithFeedback pendingAction={data.getPendingFieldAction('taxAmount')}>
            <MenuItemWithTopDescription
                title={data.taxAmountTitle}
                description={data.taxAmountDescription}
                numberOfLinesTitle={2}
                interactive={data.canEditTaxFields}
                shouldShowRightIcon={data.canEditTaxFields}
                titleStyle={data.styles.flex1}
                onPress={data.onTaxAmountPress}
                copyValue={data.taxAmountCopyValue}
                copyable={!!data.taxAmountCopyValue}
            />
        </OfflineWithFeedback>
    );
}

TaxAmountField.displayName = 'TaxAmountField';

export default TaxAmountField;
