import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {MoneyRequestViewData} from '@components/ReportActionItem/MoneyRequestView/useMoneyRequestViewData';
import Switch from '@components/Switch';
import Text from '@components/Text';
import ViolationMessages from '@components/ViolationMessages';

import {View} from 'react-native';

type BillableFieldProps = {
    data: MoneyRequestViewData;
};

function BillableField({data}: BillableFieldProps) {
    return (
        <OfflineWithFeedback
            pendingAction={data.getPendingFieldAction('billable')}
            contentContainerStyle={[data.styles.flexRow, data.styles.optionRow, data.styles.justifyContentBetween, data.styles.alignItemsCenter, data.styles.mh5]}
        >
            <View>
                <Text
                    accessible={false}
                    aria-hidden
                >
                    {data.translate('common.billable')}
                </Text>
                {!!data.getErrorForField('billable') && (
                    <ViolationMessages
                        violations={data.getViolationsForField('billable')}
                        containerStyle={[data.styles.mt1]}
                        textStyle={[data.styles.ph0]}
                        isLast
                        isMarkAsCash={data.isMarkAsCash}
                        canEdit={data.canEdit}
                        companyCardPageURL={data.companyCardPageURL}
                        connectionLink={data.connectionLink}
                        routeDistanceMeters={data.transaction?.comment?.customUnit?.routeDistanceMeters}
                        distanceUnit={data.transaction?.comment?.customUnit?.distanceUnit}
                    />
                )}
            </View>
            <Switch
                accessibilityLabel={data.translate('common.billable')}
                isOn={data.updatedTransaction?.billable ?? !!data.transactionBillable}
                onToggle={data.saveBillable}
                disabled={!data.canEdit}
            />
        </OfflineWithFeedback>
    );
}

BillableField.displayName = 'BillableField';

export default BillableField;
