import MenuItem from '@components/MenuItem';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import Navigation from '@libs/Navigation/Navigation';
import {isChatRoom as isChatRoomUtil, isPolicyExpenseChat as isPolicyExpenseChatUtil} from '@libs/ReportUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import React from 'react';

import useIsRoomCurrentlyOpen from './hooks/useIsRoomCurrentlyOpen';

type ReportDetailsMenuGoToRoomItemProps = {
    reportID: string;
};

function ReportDetailsMenuGoToRoomItem({reportID}: ReportDetailsMenuGoToRoomItemProps) {
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Hashtag']);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const isRoomCurrentlyOpen = useIsRoomCurrentlyOpen(report?.reportID);
    const shouldShowGoToRoom = (isChatRoomUtil(report) || isPolicyExpenseChatUtil(report)) && !isRoomCurrentlyOpen;

    if (!shouldShowGoToRoom) {
        return null;
    }

    return (
        <MenuItem
            title={translate('reportDetailsPage.goToRoom')}
            icon={expensifyIcons.Hashtag}
            onPress={() => {
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(report?.reportID));
            }}
            isAnonymousAction={false}
            shouldShowRightIcon
        />
    );
}

export default ReportDetailsMenuGoToRoomItem;
