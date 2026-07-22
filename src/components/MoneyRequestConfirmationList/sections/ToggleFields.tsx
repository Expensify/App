import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';

import {toggleStateSelector} from './selectors';
import useTransactionSelector from './useTransactionSelector';

type ToggleFieldsProps = {
    isReadOnly: boolean;
    shouldShowReimbursable: boolean;
    shouldShowBillable: boolean;
    onToggleReimbursable?: (isOn: boolean) => void;
    onToggleBillable?: (isOn: boolean) => void;
    transactionID: string | undefined;
};

function ToggleFields({isReadOnly, shouldShowReimbursable, shouldShowBillable, onToggleReimbursable, onToggleBillable, transactionID}: ToggleFieldsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const toggleState = useTransactionSelector(transactionID, toggleStateSelector);

    const iouIsBillable = toggleState?.billable ?? false;
    const iouIsReimbursable = toggleState?.reimbursable ?? true;

    return (
        <>
            {shouldShowReimbursable && (
                <View
                    key={Str.UCFirst(translate('iou.reimbursable'))}
                    style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.ml5, styles.mr8, styles.optionRow]}
                >
                    <ToggleSettingOptionRow
                        switchAccessibilityLabel={Str.UCFirst(translate('iou.reimbursable'))}
                        title={Str.UCFirst(translate('iou.reimbursable'))}
                        onToggle={(isOn) => onToggleReimbursable?.(isOn)}
                        isActive={iouIsReimbursable}
                        disabled={isReadOnly}
                        wrapperStyle={styles.flex1}
                    />
                </View>
            )}
            {shouldShowBillable && (
                <View
                    key={translate('common.billable')}
                    style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.ml5, styles.mr8, styles.optionRow]}
                >
                    <ToggleSettingOptionRow
                        switchAccessibilityLabel={translate('common.billable')}
                        title={translate('common.billable')}
                        onToggle={(isOn) => onToggleBillable?.(isOn)}
                        isActive={iouIsBillable}
                        disabled={isReadOnly}
                        wrapperStyle={styles.flex1}
                    />
                </View>
            )}
        </>
    );
}

export default ToggleFields;
