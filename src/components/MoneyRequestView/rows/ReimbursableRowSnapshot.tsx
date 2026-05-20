import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';
import {useSnapshotTransactionField} from '@components/MoneyRequestView/contexts/SnapshotTransactionProvider';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {Transaction} from '@src/types/onyx';

function ReimbursableRowSnapshot() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const reimbursable = useSnapshotTransactionField((tx: Transaction) => tx?.reimbursable);

    return (
        <OfflineWithFeedback contentContainerStyle={[styles.flexRow, styles.optionRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.mh5]}>
            <View>
                <Text
                    accessible={false}
                    aria-hidden
                >
                    {Str.UCFirst(translate('iou.reimbursable'))}
                </Text>
            </View>
            <Switch
                accessibilityLabel={Str.UCFirst(translate('iou.reimbursable'))}
                isOn={!!reimbursable}
                onToggle={() => undefined}
                disabled
            />
        </OfflineWithFeedback>
    );
}

export default ReimbursableRowSnapshot;
