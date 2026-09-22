import Button from '@components/Button';
import FloatingActionButton from '@components/FloatingActionButton';
import FloatingReceiptButton from '@components/FloatingReceiptButton';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {RefObject} from 'react';

import React from 'react';

import useScanActions from './useScanActions';

type FABButtonsProps = {
    isActive: boolean;
    fabRef: RefObject<HTMLDivElement | null>;
    onPress: () => void;

    /** Set to false where only the create button belongs, such as the flat navigation bar header */
    shouldShowReceiptButton?: boolean;

    /** Renders the standard small success button instead of the floating action button */
    shouldUseSmallSuccessButton?: boolean;
};

function FABButtons({isActive, fabRef, onPress, shouldShowReceiptButton = true, shouldUseSmallSuccessButton = false}: FABButtonsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {startScan, startQuickScan} = useScanActions();
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);

    if (shouldUseSmallSuccessButton) {
        return (
            <Button
                accessibilityLabel={translate('accessibilityHints.openActionsMenu')}
                accessibilityState={{expanded: isActive}}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
                ref={fabRef as RefObject<never>}
                onPress={onPress}
                variant={CONST.BUTTON_VARIANT.SUCCESS}
                size={CONST.BUTTON_SIZE.SMALL}
                // The button is icon-only, so dropping the horizontal padding keeps it square at the small size.
                innerStyles={styles.ph0}
                sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.FLOATING_ACTION_BUTTON}
            >
                <Button.Icon src={icons.Plus} />
            </Button>
        );
    }

    return (
        <>
            {!shouldUseNarrowLayout && shouldShowReceiptButton && (
                <FloatingReceiptButton
                    accessibilityLabel={translate('sidebarScreen.fabScanReceiptExplained')}
                    role={CONST.ROLE.BUTTON}
                    onPress={startQuickScan}
                    sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.FLOATING_RECEIPT_BUTTON}
                />
            )}
            <FloatingActionButton
                accessibilityLabel={translate('accessibilityHints.openActionsMenu')}
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
