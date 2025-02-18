import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import Onyx, {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {PressableWithFeedback, PressableWithoutFeedback} from '@components/Pressable';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function SidePane() {
    const theme = useTheme();
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
        if (!isExtraLargeScreenWidth && !resetTriggered.current) {
            onClose(true);
            resetTriggered.current = true;
        }

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
            <View
                style={{
                    position: 'fixed',
                    // We need to stretch the overlay to cover the sidebar and the translate animation distance.
                    left: 0,
                    top: 0,
                    bottom: 0,
                    right: 0,
                    backgroundColor: theme.overlay,
                    opacity: 0.72,
                }}
            >
                <PressableWithoutFeedback
                    style={[styles.draggableTopBar, styles.boxShadowNone]}
                    onPress={() => onClose()}
                    accessibilityLabel={translate('common.close')}
                    role={CONST.ROLE.BUTTON}
                    id={CONST.OVERLAY.TOP_BUTTON_NATIVE_ID}
                    tabIndex={-1}
                />
                <PressableWithoutFeedback
                    style={[styles.flex1, styles.boxShadowNone]}
                    onPress={() => onClose()}
                    accessibilityLabel={translate('common.close')}
                    role={CONST.ROLE.BUTTON}
                    noDragArea
                    id={CONST.OVERLAY.BOTTOM_BUTTON_NATIVE_ID}
                    tabIndex={-1}
                />
            </View>
            <View
                style={[
                    {
                        width: shouldUseNarrowLayout ? '100%' : variables.sideBarWidth,
                        height: '100%',
                        backgroundColor: theme.modalBackground,
                        right: 0,
                        position: 'fixed',
                    },
                    isExtraLargeScreenWidth && {borderLeftWidth: 1, borderLeftColor: theme.border},
                ]}
            >
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
                    />
                </PressableWithFeedback>
            </View>
        </>
    );
}

SidePane.displayName = 'SidePane';

export default SidePane;
