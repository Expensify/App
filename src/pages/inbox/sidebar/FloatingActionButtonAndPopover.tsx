import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Platform, View} from 'react-native';
import FloatingActionButton from '@components/FloatingActionButton';
import FloatingReceiptButton from '@components/FloatingReceiptButton';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
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
    const {windowHeight} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isFocused = useIsFocused();
    const prevIsFocused = usePrevious(isFocused);

    const [isCreateMenuActive, setIsCreateMenuActive] = useState(false);
    const [isMenuMounted, setIsMenuMounted] = useState(false);
    const fabRef = useRef<HTMLDivElement>(null);

    const {startScan, startQuickScan, reportID, activePolicyID, session, policyChatForActivePolicy, allTransactionDrafts} = useScanActions();

    const showCreateMenu = useCallback(() => {
        if (!isFocused && shouldUseNarrowLayout) {
            return;
        }
        setIsMenuMounted(true);
        setIsCreateMenuActive(true);
    }, [isFocused, shouldUseNarrowLayout]);

    const hideCreateMenu = useCallback(() => {
        if (!isCreateMenuActive) {
            return;
        }
        setIsCreateMenuActive(false);
    }, [isCreateMenuActive]);

    const handleMenuModalHide = useCallback(() => {
        setIsMenuMounted(false);
    }, []);

    const didScreenBecomeInactive = useCallback((): boolean => !isFocused && prevIsFocused, [isFocused, prevIsFocused]);

    useEffect(() => {
        if (!didScreenBecomeInactive()) {
            return;
        }

        // Hide menu manually when other pages are opened using shortcut key
        // eslint-disable-next-line react-hooks/set-state-in-effect
        hideCreateMenu();
    }, [didScreenBecomeInactive, hideCreateMenu]);

    // Close menu on dragover (web only — prevents popover from staying open during file drag)
    useEffect(() => {
        if (Platform.OS !== 'web' || !isCreateMenuActive) {
            return;
        }
        const handler = () => hideCreateMenu();
        document.addEventListener('dragover', handler);
        return () => document.removeEventListener('dragover', handler);
    }, [isCreateMenuActive, hideCreateMenu]);

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
                isMenuMounted={isMenuMounted}
                isVisible={isCreateMenuActive && (!shouldUseNarrowLayout || isFocused)}
                onClose={hideCreateMenu}
                onItemSelected={hideCreateMenu}
                onModalHide={handleMenuModalHide}
                anchorPosition={styles.createMenuPositionSidebar(windowHeight)}
                anchorRef={fabRef}
                shouldUseNarrowLayout={shouldUseNarrowLayout}
                reportID={reportID}
                activePolicyID={activePolicyID}
                session={session}
                policyChatForActivePolicy={policyChatForActivePolicy}
                allTransactionDrafts={allTransactionDrafts}
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
