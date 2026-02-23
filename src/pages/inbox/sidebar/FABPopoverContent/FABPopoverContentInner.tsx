import React, {useState} from 'react';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import PopoverMenu from '@components/PopoverMenu';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import navigateAfterInteraction from '@libs/Navigation/navigateAfterInteraction';
import CONST from '@src/CONST';
import FABMenuRegistry from './FABMenuRegistry';
import CreateReportMenuItem from './menuItems/CreateReportMenuItem';
import ExpenseMenuItem from './menuItems/ExpenseMenuItem';
import InvoiceMenuItem from './menuItems/InvoiceMenuItem';
import NewChatMenuItem from './menuItems/NewChatMenuItem';
import NewWorkspaceMenuItem from './menuItems/NewWorkspaceMenuItem';
import QuickActionMenuItem from './menuItems/QuickActionMenuItem';
import TestDriveMenuItem from './menuItems/TestDriveMenuItem';
import TrackDistanceMenuItem from './menuItems/TrackDistanceMenuItem';
import TravelMenuItem from './menuItems/TravelMenuItem';
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

    const [menuItems, setMenuItems] = useState<PopoverMenuItem[]>([]);

    return (
        <>
            <FABMenuRegistry onItemsChange={setMenuItems}>
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
                <CreateReportMenuItem
                    shouldUseNarrowLayout={shouldUseNarrowLayout}
                    icons={icons}
                    activePolicyID={activePolicyID}
                />
                <NewChatMenuItem
                    shouldUseNarrowLayout={shouldUseNarrowLayout}
                    icons={icons}
                />
                <InvoiceMenuItem
                    shouldUseNarrowLayout={shouldUseNarrowLayout}
                    icons={icons}
                    reportID={reportID}
                />
                <TravelMenuItem
                    icons={icons}
                    activePolicyID={activePolicyID}
                />
                <TestDriveMenuItem icons={icons} />
                <NewWorkspaceMenuItem
                    shouldUseNarrowLayout={shouldUseNarrowLayout}
                    icons={icons}
                />
                <QuickActionMenuItem
                    shouldUseNarrowLayout={shouldUseNarrowLayout}
                    icons={icons}
                    reportID={reportID}
                />
            </FABMenuRegistry>
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
