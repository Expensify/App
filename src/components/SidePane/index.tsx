import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import Onyx, {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Backdrop from '@components/Modal/BottomDockedModal/Backdrop';
import {PressableWithFeedback} from '@components/Pressable';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function SidePane() {
    const styles = useThemeStyles();
    const {isExtraLargeScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();
    const [sidePane] = useOnyx(ONYXKEYS.NVP_SIDE_PANE);

    const resetTriggered = useRef(false);

    const onClose = useCallback(
        (updateNarrow = false) => {
            // eslint-disable-next-line rulesdir/prefer-actions-set-data
            Onyx.merge(ONYXKEYS.NVP_SIDE_PANE, isExtraLargeScreenWidth && !updateNarrow ? {open: false} : {openMobile: false});
        },
        [isExtraLargeScreenWidth],
    );

    useEffect(() => {
        // Close the side pane when the screen size changes from large to small
        if (!isExtraLargeScreenWidth && !resetTriggered.current) {
            onClose(true);
            resetTriggered.current = true;
        }

        // Reset the trigger when the screen size changes back to large
        if (isExtraLargeScreenWidth) {
            resetTriggered.current = false;
        }
    }, [isExtraLargeScreenWidth, onClose]);

    if (!isExtraLargeScreenWidth && !sidePane?.openMobile) {
        return null;
    }

    if (isExtraLargeScreenWidth && !sidePane?.open) {
        return null;
    }

    return (
        <>
            {!isExtraLargeScreenWidth && (
                <Backdrop
                    onBackdropPress={onClose}
                    style={styles.sidePaneOverlay}
                />
            )}
            <View style={styles.sidePaneContainer(shouldUseNarrowLayout, isExtraLargeScreenWidth)}>
                <PressableWithFeedback
                    onPress={() => onClose(false)}
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={translate('common.close')}
                >
                    <HeaderWithBackButton
                        title="Help"
                        onBackButtonPress={() => onClose(false)}
                        onCloseButtonPress={() => onClose(false)}
                        shouldShowBackButton={!isExtraLargeScreenWidth}
                        shouldShowCloseButton={isExtraLargeScreenWidth}
                        shouldDisplayHelpButton={false}
                    />
                </PressableWithFeedback>
            </View>
        </>
    );
}

SidePane.displayName = 'SidePane';

export default SidePane;
