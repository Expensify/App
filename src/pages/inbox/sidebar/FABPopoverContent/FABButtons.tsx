import React from 'react';
import type {RefObject} from 'react';
import FloatingActionButton from '@components/FloatingActionButton';
import FloatingReceiptButton from '@components/FloatingReceiptButton';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import CONST from '@src/CONST';
import useScanActions from './useScanActions';

type FABButtonsProps = {
    isActive: boolean;
    fabRef: RefObject<HTMLDivElement | null>;
    onPress: () => void;
};

function FABButtons({isActive, fabRef, onPress}: FABButtonsProps) {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {startScan, startQuickScan} = useScanActions();

    return (
        <>
            {!shouldUseNarrowLayout && (
                /* eslint-disable-next-line react-native-a11y/has-accessibility-hint -- Already present before the lint rule was enabled, needs to be fixed. */
                <FloatingReceiptButton
                    accessibilityLabel={translate('sidebarScreen.fabScanReceiptExplained')}
                    role={CONST.ROLE.BUTTON}
                    onPress={startQuickScan}
                    sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.FLOATING_RECEIPT_BUTTON}
                />
            )}
            {/* eslint-disable-next-line react-native-a11y/has-accessibility-hint -- Already present before the lint rule was enabled, needs to be fixed. */}
            <FloatingActionButton
                accessibilityLabel={translate('sidebarScreen.fabNewChatExplained')}
                role={CONST.ROLE.BUTTON}
                isActive={isActive}
                ref={fabRef}
                onPress={onPress}
                onLongPress={startScan}
                sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.FLOATING_ACTION_BUTTON}
            />
        </>
    );
}

export default FABButtons;
