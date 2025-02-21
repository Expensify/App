import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import Onyx, {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Backdrop from '@components/Modal/BottomDockedModal/Backdrop';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {isSidePaneHidden} from '@libs/SidePaneUtils';
import ONYXKEYS from '@src/ONYXKEYS';

function SidePane() {
    const styles = useThemeStyles();
    const {isExtraLargeScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();
    const [sidePane] = useOnyx(ONYXKEYS.NVP_SIDE_PANE);

    const onClose = useCallback(
        (shouldUpdateNarrow = false) => {
            // eslint-disable-next-line rulesdir/prefer-actions-set-data
            Onyx.merge(ONYXKEYS.NVP_SIDE_PANE, isExtraLargeScreenWidth && !shouldUpdateNarrow ? {open: false} : {openMobile: false});
        },
        [isExtraLargeScreenWidth],
    );

    const resetTriggered = useRef(false);
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

    if (isSidePaneHidden(sidePane, isExtraLargeScreenWidth)) {
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
                <ScreenWrapper testID={SidePane.displayName}>
                    <HeaderWithBackButton
                        title={translate('common.help')}
                        onBackButtonPress={() => onClose(false)}
                        onCloseButtonPress={() => onClose(false)}
                        shouldShowBackButton={!isExtraLargeScreenWidth}
                        shouldShowCloseButton={isExtraLargeScreenWidth}
                        shouldDisplayHelpButton={false}
                    />
                </ScreenWrapper>
            </View>
        </>
    );
}

SidePane.displayName = 'SidePane';

export default SidePane;
