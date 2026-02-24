import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import FloatingActionButton from '@components/FloatingActionButton';
import FloatingReceiptButton from '@components/FloatingReceiptButton';
import useDragoverDismiss from '@hooks/useDragoverDismiss';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import FABPopoverContent from './FABPopoverContent';
import useScanActions from './FABPopoverContent/useScanActions';

/**
 * Responsible for rendering the {@link FABPopoverContent}, and the accompanying
 * FAB that can open or close the menu.
 */
function FloatingActionButtonAndPopover() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isFocused = useIsFocused();
    const prevIsFocused = usePrevious(isFocused);

    const [isCreateMenuActive, setIsCreateMenuActive] = useState(false);
    const fabRef = useRef<HTMLDivElement>(null);

    const {startScan, startQuickScan, reportID, activePolicyID} = useScanActions();

    const showCreateMenu = useCallback(() => {
        if (!isFocused && shouldUseNarrowLayout) {
            return;
        }
        setIsCreateMenuActive(true);
    }, [isFocused, shouldUseNarrowLayout]);

    const hideCreateMenu = useCallback(() => {
        if (!isCreateMenuActive) {
            return;
        }
        setIsCreateMenuActive(false);
    }, [isCreateMenuActive]);

    const didScreenBecomeInactive = useCallback((): boolean => !isFocused && prevIsFocused, [isFocused, prevIsFocused]);

    useEffect(() => {
        if (!didScreenBecomeInactive()) {
            return;
        }

        // Intentionally calling setState inside useEffect — we need to imperatively respond to
        // navigation focus changes (an external event) which can't be expressed as an event handler
        // eslint-disable-next-line react-hooks/set-state-in-effect
        hideCreateMenu();
    }, [didScreenBecomeInactive, hideCreateMenu]);

    // Close menu on dragover — prevents popover from staying open during file drag
    useDragoverDismiss(isCreateMenuActive, hideCreateMenu);

    const toggleCreateMenu = () => {
        if (isCreateMenuActive) {
            hideCreateMenu();
        } else {
            showCreateMenu();
        }
    };

    return (
        <View style={[styles.justifyContentCenter, styles.flexGrow1, styles.gap3, shouldUseNarrowLayout ? styles.w100 : styles.pv4]}>
            <FABPopoverContent
                isVisible={isCreateMenuActive && (!shouldUseNarrowLayout || isFocused)}
                onClose={hideCreateMenu}
                onItemSelected={hideCreateMenu}
                anchorRef={fabRef}
                reportID={reportID}
                activePolicyID={activePolicyID}
            />
            {!shouldUseNarrowLayout && (
                <FloatingReceiptButton
                    accessibilityLabel={translate('sidebarScreen.fabScanReceiptExplained')}
                    role={CONST.ROLE.BUTTON}
                    onPress={startQuickScan}
                    sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.FLOATING_RECEIPT_BUTTON}
                />
            )}
            <FloatingActionButton
                accessibilityLabel={translate('sidebarScreen.fabNewChatExplained')}
                role={CONST.ROLE.BUTTON}
                isActive={isCreateMenuActive}
                ref={fabRef}
                onPress={toggleCreateMenu}
                onLongPress={startScan}
                sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.FLOATING_ACTION_BUTTON}
            />
        </View>
    );
}

export default FloatingActionButtonAndPopover;
