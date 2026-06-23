import React from 'react';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type CenteredModalLayoutOverlayProps from './types';

/**
 * On native the navigation `Overlay` can't back the modal (it depends on `position: fixed`),
 * so we render a plain full-screen Pressable behind the card. Tapping the area outside the
 * card (which the centered card layer lets through via `pointerEvents="box-none"`) closes the modal.
 */
function CenteredModalLayoutOverlay({onBackdropPress}: CenteredModalLayoutOverlayProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <PressableWithoutFeedback
            onPress={onBackdropPress}
            style={styles.fullScreen}
            accessibilityLabel={translate('common.close')}
            role={CONST.ROLE.BUTTON}
            id={CONST.OVERLAY.TOP_BUTTON_NATIVE_ID}
            tabIndex={-1}
            sentryLabel="CenteredModalLayout-backdrop"
        />
    );
}

export default CenteredModalLayoutOverlay;
