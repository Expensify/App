import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Switch from '@components/Switch';
import Text from '@components/Text';

import {Str} from 'expensify-common';
import {View} from 'react-native';

import type {MoneyRequestViewData} from '../useMoneyRequestViewData';

type ReimbursableFieldProps = {
    data: MoneyRequestViewData;
};

function ReimbursableField({data}: ReimbursableFieldProps) {
    return (
        <OfflineWithFeedback
            pendingAction={data.getPendingFieldAction('reimbursable')}
            contentContainerStyle={[data.styles.flexRow, data.styles.optionRow, data.styles.justifyContentBetween, data.styles.alignItemsCenter, data.styles.mh5]}
        >
            <View>
                <Text
                    accessible={false}
                    aria-hidden
                >
                    {Str.UCFirst(data.translate('iou.reimbursable'))}
                </Text>
            </View>
            <Switch
                accessibilityLabel={Str.UCFirst(data.translate('iou.reimbursable'))}
                isOn={data.updatedTransaction?.reimbursable ?? !!data.transactionReimbursable}
                onToggle={data.saveReimbursable}
                disabled={!data.canEditReimbursable}
            />
        </OfflineWithFeedback>
    );
}

ReimbursableField.displayName = 'ReimbursableField';

export default ReimbursableField;
