import React from 'react';
import type {RefObject} from 'react';
import FloatingActionButton from '@components/FloatingActionButton';
import FloatingReceiptButton from '@components/FloatingReceiptButton';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {startQuickScan, startScan} from '@libs/actions/Scan';
import CONST from '@src/CONST';
import useRedirectToExpensifyClassic from './useRedirectToExpensifyClassic';

type FABButtonsProps = {
    isActive: boolean;
    fabRef: RefObject<HTMLDivElement | null>;
    onPress: () => void;
};

function FABButtons({isActive, fabRef, onPress}: FABButtonsProps) {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {shouldRedirectToExpensifyClassic, showRedirectToExpensifyClassicModal} = useRedirectToExpensifyClassic();

    const handleScan = () => {
        if (shouldRedirectToExpensifyClassic) {
            showRedirectToExpensifyClassicModal();
            return;
        }
        startScan();
    };

    const handleQuickScan = () => {
        if (shouldRedirectToExpensifyClassic) {
            showRedirectToExpensifyClassicModal();
            return;
        }
        startQuickScan();
    };

    return (
        <>
            {!shouldUseNarrowLayout && (
                <FloatingReceiptButton
                    accessibilityLabel={translate('sidebarScreen.fabScanReceiptExplained')}
                    role={CONST.ROLE.BUTTON}
                    onPress={handleQuickScan}
                    sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.FLOATING_RECEIPT_BUTTON}
                />
            )}
            <FloatingActionButton
                accessibilityLabel={translate('sidebarScreen.fabNewChatExplained')}
                role={CONST.ROLE.BUTTON}
                isActive={isActive}
                ref={fabRef}
                onPress={onPress}
                onLongPress={handleScan}
                sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.FLOATING_ACTION_BUTTON}
            />
        </>
    );
}

export default FABButtons;
