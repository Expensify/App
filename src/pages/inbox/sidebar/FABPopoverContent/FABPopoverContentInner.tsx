import React from 'react';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import CONST from '@src/CONST';
import FABPopoverMenu from './FABPopoverMenu';
import CreateReportMenuItem, {useCreateReportMenuItemVisible} from './menuItems/CreateReportMenuItem';
import ExpenseMenuItem from './menuItems/ExpenseMenuItem';
import InvoiceMenuItem, {useInvoiceMenuItemVisible} from './menuItems/InvoiceMenuItem';
import NewChatMenuItem from './menuItems/NewChatMenuItem';
import NewWorkspaceMenuItem, {useNewWorkspaceMenuItemVisible} from './menuItems/NewWorkspaceMenuItem';
import QuickActionMenuItem, {useQuickActionMenuItemVisible} from './menuItems/QuickActionMenuItem';
import TestDriveMenuItem, {useTestDriveMenuItemVisible} from './menuItems/TestDriveMenuItem';
import TrackDistanceMenuItem from './menuItems/TrackDistanceMenuItem';
import TravelMenuItem, {useTravelMenuItemVisible} from './menuItems/TravelMenuItem';
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

    const showQuickAction = useQuickActionMenuItemVisible();
    const showInvoice = useInvoiceMenuItemVisible();
    const showTravel = useTravelMenuItemVisible(activePolicyID);
    const showTestDrive = useTestDriveMenuItemVisible();
    const showNewWorkspace = useNewWorkspaceMenuItemVisible();
    const showCreateReport = useCreateReportMenuItemVisible();

    return (
        <FABPopoverMenu
            isVisible={isVisible}
            onClose={onClose}
            onItemSelected={onItemSelected}
            onModalHide={onModalHide}
            anchorPosition={anchorPosition}
            anchorRef={anchorRef}
            fromSidebarMediumScreen={!shouldUseNarrowLayout}
            animationInTiming={CONST.MODAL.ANIMATION_TIMING.FAB_IN}
            animationOutTiming={CONST.MODAL.ANIMATION_TIMING.FAB_OUT}
        >
            {showQuickAction && (
                <QuickActionMenuItem
                    shouldUseNarrowLayout={shouldUseNarrowLayout}
                    icons={icons}
                    reportID={reportID}
                />
            )}
            <ExpenseMenuItem
                shouldUseNarrowLayout={shouldUseNarrowLayout}
                icons={icons}
                reportID={reportID}
            />
            <TrackDistanceMenuItem
                shouldUseNarrowLayout={shouldUseNarrowLayout}
                icons={icons}
                reportID={reportID}
            />
            {showCreateReport && (
                <CreateReportMenuItem
                    shouldUseNarrowLayout={shouldUseNarrowLayout}
                    icons={icons}
                    activePolicyID={activePolicyID}
                />
            )}
            <NewChatMenuItem
                shouldUseNarrowLayout={shouldUseNarrowLayout}
                icons={icons}
            />
            {showInvoice && (
                <InvoiceMenuItem
                    shouldUseNarrowLayout={shouldUseNarrowLayout}
                    icons={icons}
                    reportID={reportID}
                />
            )}
            {showTravel && (
                <TravelMenuItem
                    icons={icons}
                    activePolicyID={activePolicyID}
                />
            )}
            {showTestDrive && <TestDriveMenuItem icons={icons} />}
            {showNewWorkspace && (
                <NewWorkspaceMenuItem
                    shouldUseNarrowLayout={shouldUseNarrowLayout}
                    icons={icons}
                />
            )}
        </FABPopoverMenu>
    );
}

FABPopoverContentInner.displayName = 'FABPopoverContentInner';

export default FABPopoverContentInner;
