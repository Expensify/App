import React from 'react';
import {Pressable} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type DismissButtonProps = {
    onPress: () => void;
};

/**
 * Hidden screen-reader dismiss affordance — sequential AT nav reaches this button so users can close
 * the popover without keyboard traps. Not in the keyboard tab order (mirrors React Aria DismissButton).
 */
function DismissButton({onPress}: DismissButtonProps): React.ReactElement {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    return (
        <Pressable
            accessible
            accessibilityRole={CONST.ROLE.BUTTON}
            accessibilityLabel={translate('common.close')}
            focusable={false}
            onPress={onPress}
            style={styles.screenReaderOnlyAnchor}
        />
    );
}

DismissButton.displayName = 'PopoverMenu.DismissButton';

export default DismissButton;
