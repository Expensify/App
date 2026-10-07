import MenuItemAction from '@components/MenuItem/presets/MenuItemAction';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';

import CONST from '@src/CONST';

import React from 'react';

import type {ReportDetailsRequestData} from './types';

import useReportDetailsRequestData from './useReportDetailsRequestData';

type ReportDetailsRequestActionsProps = {
    reportID: string;

    /** Renders the menu rows, including the track-expense rows built from the request data */
    renderMenu: (requestData?: ReportDetailsRequestData) => React.ReactNode;

    /** Confirms the delete, navigates away and then runs the passed delete */
    showDeleteModal: (requestData: ReportDetailsRequestData | undefined, onDelete: () => void) => Promise<void>;

    /** Deletes the expense described by the request data */
    deleteTransaction: (requestData: ReportDetailsRequestData) => void;
};

/** Menu and Delete row of the money cases, the only place the request data subscriptions are mounted */
function ReportDetailsRequestActions({reportID, renderMenu, showDeleteModal, deleteTransaction}: ReportDetailsRequestActionsProps) {
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['ArrowSplit', 'Trashcan']);
    const requestData = useReportDetailsRequestData(reportID);
    const {shouldShowDeleteButton, shouldShowEditSplitOnDeleteAction, deleteMenuItemTitle} = requestData;

    return (
        <>
            {renderMenu(requestData)}

            {shouldShowDeleteButton && (
                <MenuItemAction
                    key={CONST.REPORT_DETAILS_MENU_ITEM.DELETE}
                    icon={shouldShowEditSplitOnDeleteAction ? expensifyIcons.ArrowSplit : expensifyIcons.Trashcan}
                    title={deleteMenuItemTitle}
                    onPress={shouldShowEditSplitOnDeleteAction ? () => deleteTransaction(requestData) : () => showDeleteModal(requestData, () => deleteTransaction(requestData))}
                />
            )}
        </>
    );
}

export default ReportDetailsRequestActions;
