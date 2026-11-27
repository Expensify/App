import usePermissions from '@hooks/usePermissions';

import {generateReportID} from '@libs/ReportUtils';

import CONST from '@src/CONST';

import React, {useState} from 'react';

import type {FABPopoverMenuProps} from './FABPopoverMenu';

import FABPopoverMenu from './FABPopoverMenu';
import CreateReportMenuItem from './menuItems/CreateReportMenuItem';
import ExpenseMenuItem from './menuItems/ExpenseMenuItem';
import InvoiceMenuItem from './menuItems/InvoiceMenuItem';
import NewChatMenuItem from './menuItems/NewChatMenuItem';
import NewWorkspaceMenuItem from './menuItems/NewWorkspaceMenuItem';
import QuickActionMenuItem from './menuItems/QuickActionMenuItem';
import TrackDistanceMenuItem from './menuItems/TrackDistanceMenuItem';
import TravelMenuItem from './menuItems/TravelMenuItem';

type CreateMenuPopoverProps = Omit<FABPopoverMenuProps, 'children' | 'shouldShowIconTiles'>;

/** The create menu with every item, for any button that opens it. */
function CreateMenuPopover(props: CreateMenuPopoverProps) {
    const [reportID] = useState(() => generateReportID());
    const {isBetaEnabled} = usePermissions();

    return (
        <FABPopoverMenu
            {...props}
            // The colored icon tiles ship together with the flat navigation, for every button that opens this menu
            shouldShowIconTiles={isBetaEnabled(CONST.BETAS.FLAT_NAV)}
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
