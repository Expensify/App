import React from 'react';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type DismissButtonProps = {
    onPress: () => void;
};

/** Hidden screen-reader dismiss affordance; not in the keyboard tab order (mirrors React Aria DismissButton). */
function DismissButton({onPress}: DismissButtonProps): React.ReactElement {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    return (
        <PressableWithoutFeedback
            accessible
            role={CONST.ROLE.BUTTON}
            accessibilityLabel={translate('common.close')}
            sentryLabel="PopoverMenu.DismissButton"
            focusable={false}
            onPress={onPress}
            style={styles.screenReaderOnlyAnchor}
        />
    );
}

DismissButton.displayName = 'PopoverMenu.DismissButton';

export default DismissButton;
