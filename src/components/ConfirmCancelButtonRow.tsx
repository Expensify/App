import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Button from './Button';

type ConfirmCancelButtonRowProps = {
    /** Called when the user presses Apply */
    onConfirm: () => void;

    /** Called when the user presses Cancel */
    onCancel: () => void;

    /** Whether the Apply button is disabled */
    isConfirmDisabled?: boolean;
};

function ConfirmCancelButtonRow({onConfirm, onCancel, isConfirmDisabled = false}: ConfirmCancelButtonRowProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View style={[styles.flexRow, styles.gap2, styles.ph4, styles.pb4]}>
            <Button
                style={[styles.flex1]}
                text={translate('common.cancel')}
                onPress={onCancel}
            />
            <Button
                style={[styles.flex1]}
                success
                text={translate('common.apply')}
                onPress={onConfirm}
                isDisabled={isConfirmDisabled}
            />
        </View>
    );
}

export default ConfirmCancelButtonRow;
