import {generateReportID} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import type {AnchorPosition} from '@src/styles';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';

import type {ComponentRef, RefObject} from 'react';
import type {View} from 'react-native';

import React, {useState} from 'react';

import FABPopoverMenu from './FABPopoverMenu';
import CreateReportMenuItem from './menuItems/CreateReportMenuItem';
import ExpenseMenuItem from './menuItems/ExpenseMenuItem';
import InvoiceMenuItem from './menuItems/InvoiceMenuItem';
import NewChatMenuItem from './menuItems/NewChatMenuItem';
import NewWorkspaceMenuItem from './menuItems/NewWorkspaceMenuItem';
import QuickActionMenuItem from './menuItems/QuickActionMenuItem';
import TrackDistanceMenuItem from './menuItems/TrackDistanceMenuItem';
import TravelMenuItem from './menuItems/TravelMenuItem';

type CreateMenuPopoverProps = {
    /** Whether the menu is open */
    isVisible: boolean;

    /** Closes the menu, both on dismiss and after an item is picked */
    onClose: () => void;

    /** The button that opened the menu, which gets focus back when it closes */
    anchorRef: RefObject<ComponentRef<typeof View> | HTMLDivElement | null>;

    /** Replaces the default placement above a floating action button at the bottom of the sidebar */
    anchorPosition?: AnchorPosition;

    /** How the menu lines up with `anchorPosition` */
    anchorAlignment?: AnchorAlignment;
};

/** The create menu with every item, for any button that opens it. */
function CreateMenuPopover({isVisible, onClose, anchorRef, anchorPosition, anchorAlignment}: CreateMenuPopoverProps) {
    const [reportID] = useState(() => generateReportID());

    return (
        <FABPopoverMenu
            isVisible={isVisible}
            onClose={onClose}
            onItemSelected={onClose}
            anchorRef={anchorRef}
            anchorPosition={anchorPosition}
            anchorAlignment={anchorAlignment}
            animationInTiming={CONST.MODAL.ANIMATION_TIMING.FAB_IN}
            animationOutTiming={CONST.MODAL.ANIMATION_TIMING.FAB_OUT}
        >
            <ExpenseMenuItem reportID={reportID} />
            <CreateReportMenuItem />
            <TrackDistanceMenuItem reportID={reportID} />
            <NewChatMenuItem />
            <InvoiceMenuItem reportID={reportID} />
            <TravelMenuItem />
            <NewWorkspaceMenuItem />
            <QuickActionMenuItem reportID={reportID} />
        </FABPopoverMenu>
    );
}

export default CreateMenuPopover;
