import React from 'react';
import PopoverMenu from '@components/PopoverMenu';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import navigateAfterInteraction from '@libs/Navigation/navigateAfterInteraction';
import CONST from '@src/CONST';
import useCreateReportMenuItem from './menuItems/useCreateReportMenuItem';
import useExpenseMenuItem from './menuItems/useExpenseMenuItem';
import useInvoiceMenuItem from './menuItems/useInvoiceMenuItem';
import useNewChatMenuItem from './menuItems/useNewChatMenuItem';
import useNewWorkspaceMenuItem from './menuItems/useNewWorkspaceMenuItem';
import useQuickActionMenuItem from './menuItems/useQuickActionMenuItem';
import useTestDriveMenuItem from './menuItems/useTestDriveMenuItem';
import useTrackDistanceMenuItem from './menuItems/useTrackDistanceMenuItem';
import useTravelMenuItem from './menuItems/useTravelMenuItem';
import type {FABPopoverContentInnerProps} from './types';

type FABPopoverContentInnerExtraProps = FABPopoverContentInnerProps & {
    reportID: string;
    activePolicyID: string | undefined;
};

function FABPopoverContentInner({
    isVisible,
    onClose,
    onItemSelected,
    onModalHide,
    anchorPosition,
    anchorRef,
    shouldUseNarrowLayout,
    reportID,
    activePolicyID,
}: FABPopoverContentInnerExtraProps) {
    const icons = useMemoizedLazyExpensifyIcons([
        'CalendarSolid',
        'Document',
        'NewWorkspace',
        'NewWindow',
        'Binoculars',
        'Car',
        'Location',
        'Suitcase',
        'Task',
        'InvoiceGeneric',
        'ReceiptScan',
        'ChatBubble',
        'Coins',
        'Receipt',
        'Cash',
        'Transfer',
        'MoneyCircle',
        'Clock',
    ] as const);

    const expenseItem = useExpenseMenuItem({shouldUseNarrowLayout, icons, reportID});
    const trackDistanceItem = useTrackDistanceMenuItem({shouldUseNarrowLayout, icons, reportID});
    const {menuItem: createReportItem, confirmationModal} = useCreateReportMenuItem({shouldUseNarrowLayout, icons, activePolicyID});
    const newChatItem = useNewChatMenuItem({shouldUseNarrowLayout, icons});
    const invoiceItem = useInvoiceMenuItem({shouldUseNarrowLayout, icons, reportID});
    const travelItem = useTravelMenuItem({icons, activePolicyID});
    const testDriveItem = useTestDriveMenuItem({icons});
    const newWorkspaceItem = useNewWorkspaceMenuItem({shouldUseNarrowLayout, icons});
    const quickActionItem = useQuickActionMenuItem({shouldUseNarrowLayout, icons, reportID});

    const menuItems = [...expenseItem, ...trackDistanceItem, ...createReportItem, ...newChatItem, ...invoiceItem, ...travelItem, ...testDriveItem, ...newWorkspaceItem, ...quickActionItem];

    return (
        <>
            {confirmationModal}
            <PopoverMenu
                onClose={onClose}
                shouldEnableMaxHeight={false}
                isVisible={isVisible}
                anchorPosition={anchorPosition}
                onItemSelected={onItemSelected}
                onModalHide={onModalHide}
                fromSidebarMediumScreen={!shouldUseNarrowLayout}
                animationInTiming={CONST.MODAL.ANIMATION_TIMING.FAB_IN}
                animationOutTiming={CONST.MODAL.ANIMATION_TIMING.FAB_OUT}
                menuItems={menuItems.map((item) => ({
                    ...item,
                    onSelected: () => {
                        if (!item.onSelected) {
                            return;
                        }
                        navigateAfterInteraction(item.onSelected);
                    },
                }))}
                anchorRef={anchorRef}
            />
        </>
    );
}

FABPopoverContentInner.displayName = 'FABPopoverContentInner';

export default FABPopoverContentInner;
