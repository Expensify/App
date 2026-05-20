import React from 'react';
import {View} from 'react-native';
import {useSnapshotTransactionField} from '@components/MoneyRequestView/contexts/SnapshotTransactionProvider';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {Transaction} from '@src/types/onyx';

function BillableRowSnapshot() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const billable = useSnapshotTransactionField((tx: Transaction) => tx?.billable);

    return (
        <OfflineWithFeedback contentContainerStyle={[styles.flexRow, styles.optionRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.mh5]}>
            <View>
                <Text
                    accessible={false}
                    aria-hidden
                >
                    {translate('common.billable')}
                </Text>
            </View>
            <Switch
                accessibilityLabel={translate('common.billable')}
                isOn={!!billable}
                onToggle={() => undefined}
                disabled
            />
        </OfflineWithFeedback>
    );
}

export default BillableRowSnapshot;
