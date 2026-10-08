import MenuItemAction from '@components/MenuItem/presets/MenuItemAction';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';

import CONST from '@src/CONST';

import React from 'react';

import type {ReportDetailsRequestData} from './types';

import ReportDetailsMenuItems from './ReportDetailsMenuItems';
import useReportDetailsRequestData from './useReportDetailsRequestData';

type ReportDetailsRequestActionsProps = {
    reportID: string;

    /** Confirms the delete, navigates away and then runs the passed delete */
    showDeleteModal: (requestData: ReportDetailsRequestData | undefined, onDelete: () => void) => Promise<void>;

    /** Deletes the expense described by the request data */
    deleteTransaction: (requestData: ReportDetailsRequestData) => void;
};

/** Menu and Delete row of the money cases, the only place the request data subscriptions are mounted */
function ReportDetailsRequestActions({reportID, showDeleteModal, deleteTransaction}: ReportDetailsRequestActionsProps) {
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['ArrowSplit', 'Trashcan']);
    const requestData = useReportDetailsRequestData(reportID);
    const {shouldShowDeleteButton, shouldShowEditSplitOnDeleteAction, deleteMenuItemTitle} = requestData;

    return (
        <>
            <ReportDetailsMenuItems
                reportID={reportID}
                requestData={requestData}
            />

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
