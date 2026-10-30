import MenuItem from '@components/MenuItem';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import Navigation from '@libs/Navigation/Navigation';
import {shouldShowPolicy} from '@libs/PolicyUtils';
import {isChatRoom as isChatRoomUtil, isPolicyExpenseChat as isPolicyExpenseChatUtil} from '@libs/ReportUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import React from 'react';

import useIsRoomCurrentlyOpen from './hooks/useIsRoomCurrentlyOpen';

type ReportDetailsMenuGoToWorkspaceItemProps = {
    reportID: string;
};

function ReportDetailsMenuGoToWorkspaceItem({reportID}: ReportDetailsMenuGoToWorkspaceItemProps) {
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Building']);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserEmail = currentUserPersonalDetails?.email;

    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const isRoomCurrentlyOpen = useIsRoomCurrentlyOpen(report?.reportID);
    const shouldShowGoToRoom = (isChatRoomUtil(report) || isPolicyExpenseChatUtil(report)) && !isRoomCurrentlyOpen;
    const shouldShowGoToWorkspace = shouldShowPolicy(policy, false, currentUserEmail) && !policy?.isJoinRequestPending && !shouldShowGoToRoom;

    if (!shouldShowGoToWorkspace) {
        return null;
    }

    return (
        <MenuItem
            title={translate('workspace.common.goToWorkspace')}
            icon={expensifyIcons.Building}
            onPress={() => {
                if (!report?.policyID) {
                    return;
                }
                if (isSmallScreenWidth) {
                    Navigation.navigate(ROUTES.WORKSPACE_INITIAL.getRoute(report?.policyID, Navigation.getActiveRoute()));
                } else {
                    Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW.getRoute(report?.policyID));
                }
            }}
            isAnonymousAction={false}
            shouldShowRightIcon
        />
    );
}

export default ReportDetailsMenuGoToWorkspaceItem;
