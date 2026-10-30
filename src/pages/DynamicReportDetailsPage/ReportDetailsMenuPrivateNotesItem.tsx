import MenuItem from '@components/MenuItem';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import Permissions from '@libs/Permissions';
import {
    isChatThread as isChatThreadUtil,
    isInvoiceReport as isInvoiceReportUtil,
    isMoneyRequestReport as isMoneyRequestReportUtil,
    isTaskReport as isTaskReportUtil,
    navigateToPrivateNotes,
} from '@libs/ReportUtils';

import {hasErrorInPrivateNotes} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

type ReportDetailsMenuPrivateNotesItemProps = {
    reportID: string;
};

function ReportDetailsMenuPrivateNotesItem({reportID}: ReportDetailsMenuPrivateNotesItemProps) {
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Pencil']);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserPersonalDetails?.accountID;
    const isChatThread = isChatThreadUtil(report);
    const isMoneyRequestReport = isMoneyRequestReportUtil(report);
    const isInvoiceReport = isInvoiceReportUtil(report);
    const isTaskReport = isTaskReportUtil(report);

    // Prevent displaying private notes option for threads and task reports, or when the feature is disabled
    const shouldShowPrivateNotes = Permissions.canUsePrivateNotes() && !isChatThread && !isMoneyRequestReport && !isInvoiceReport && !isTaskReport;

    if (!shouldShowPrivateNotes) {
        return null;
    }

    return (
        <MenuItem
            title={translate('privateNotes.title')}
            icon={expensifyIcons.Pencil}
            onPress={() => navigateToPrivateNotes(report, currentUserAccountID)}
            isAnonymousAction={false}
            shouldShowRightIcon
            brickRoadIndicator={hasErrorInPrivateNotes(report) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
        />
    );
}

export default ReportDetailsMenuPrivateNotesItem;
