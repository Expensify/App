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
import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {authTokenTypeSelector} from '@selectors/Session';
import React from 'react';

type ReportDetailsMenuPrivateNotesItemProps = {
    reportID: string;
};

function ReportDetailsMenuPrivateNotesItem({reportID}: ReportDetailsMenuPrivateNotesItemProps) {
    const {translate} = useLocalize();
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
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
        <MenuItem.Root
            onPress={callFunctionIfActionIsAllowed(() => navigateToPrivateNotes(report, currentUserAccountID), false, session)}
            accessibilityLabel={translate('privateNotes.title')}
        >
            <MenuItem.Row>
                <MenuItem.Leading>
                    <MenuItem.Icon src={expensifyIcons.Pencil} />
                </MenuItem.Leading>
                <MenuItem.Content>
                    <MenuItem.Title>{translate('privateNotes.title')}</MenuItem.Title>
                </MenuItem.Content>
                <MenuItem.Trailing>
                    {hasErrorInPrivateNotes(report) && <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />}
                    <MenuItem.Chevron />
                </MenuItem.Trailing>
            </MenuItem.Row>
        </MenuItem.Root>
    );
}

export default ReportDetailsMenuPrivateNotesItem;
