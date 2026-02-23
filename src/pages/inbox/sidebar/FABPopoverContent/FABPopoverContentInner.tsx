import React, {useMemo} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import PopoverMenu from '@components/PopoverMenu';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import navigateAfterInteraction from '@libs/Navigation/navigateAfterInteraction';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
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
    session: {email?: string; accountID?: number} | undefined;
    policyChatForActivePolicy: OnyxTypes.Report | undefined;
    allTransactionDrafts: OnyxCollection<OnyxTypes.Transaction>;
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
    session,
    policyChatForActivePolicy,
    allTransactionDrafts,
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
    const invoiceItem = useInvoiceMenuItem({shouldUseNarrowLayout, icons, reportID, allTransactionDrafts});
    const travelItem = useTravelMenuItem({icons, activePolicyID});
    const testDriveItem = useTestDriveMenuItem({icons});
    const newWorkspaceItem = useNewWorkspaceMenuItem({shouldUseNarrowLayout, icons});
    const quickActionItem = useQuickActionMenuItem({
        shouldUseNarrowLayout,
        icons,
        reportID,
        session,
        policyChatForActivePolicy,
        allTransactionDrafts,
    });

    const menuItems = useMemo(
        () => [...expenseItem, ...trackDistanceItem, ...createReportItem, ...newChatItem, ...invoiceItem, ...travelItem, ...testDriveItem, ...newWorkspaceItem, ...quickActionItem],
        [expenseItem, trackDistanceItem, createReportItem, newChatItem, invoiceItem, travelItem, testDriveItem, newWorkspaceItem, quickActionItem],
    );

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
