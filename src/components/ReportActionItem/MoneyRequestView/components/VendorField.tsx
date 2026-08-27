import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';

import CONST from '@src/CONST';

import type {MoneyRequestViewData} from '../useMoneyRequestViewData';

type VendorFieldProps = {
    data: MoneyRequestViewData;
};

function VendorField({data}: VendorFieldProps) {
    return (
        <OfflineWithFeedback pendingAction={data.getPendingFieldAction('vendor')}>
            <MenuItemWithTopDescription
                description={data.vendorFieldLabel}
                title={data.transactionVendorName}
                numberOfLinesTitle={2}
                interactive={data.canEdit}
                shouldShowRightIcon={data.canEdit}
                titleStyle={data.styles.flex1}
                onPress={data.onVendorPress}
                brickRoadIndicator={data.getErrorForField('vendor') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                errorText={data.getErrorForField('vendor')}
            />
        </OfflineWithFeedback>
    );
}

VendorField.displayName = 'VendorField';

export default VendorField;
