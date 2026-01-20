import React, {useEffect, useRef} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import ScreenWrapper from '@components/ScreenWrapper';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {inviteMemberToWorkspace} from '@libs/actions/Policy/Member';
import navigateAfterJoinRequest from '@libs/navigateAfterJoinRequest';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {isPendingDeletePolicy} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {AuthScreensParamList} from '@navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type WorkspaceJoinUserPageRoute = {route: PlatformStackScreenProps<AuthScreensParamList, typeof SCREENS.WORKSPACE_JOIN_USER>['route']};
type WorkspaceJoinUserPageProps = WorkspaceJoinUserPageRoute;

function WorkspaceJoinUserPage({route}: WorkspaceJoinUserPageProps) {
    const styles = useThemeStyles();
    const policyID = route?.params?.policyID;
    const [policy, policyResult] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: true});
    const isPolicyLoading = isLoadingOnyxValue(policyResult);
    const inviterEmail = route?.params?.email;
    const isUnmounted = useRef(false);

    useEffect(() => {
        if (isUnmounted.current || isPolicyLoading) {
            return;
        }
        if (!isEmptyObject(policy) && !policy?.isJoinRequestPending && !isPendingDeletePolicy(policy)) {
            Navigation.isNavigationReady().then(() => {
                if (Navigation.getShouldPopToSidebar()) {
                    Navigation.popToSidebar();
                } else {
                    Navigation.goBack();
                }
                Navigation.navigate(ROUTES.WORKSPACE_INITIAL.getRoute(policyID));
            });
            return;
        }
        inviteMemberToWorkspace(policyID, inviterEmail);
        Navigation.isNavigationReady().then(() => {
            if (isUnmounted.current) {
                return;
            }
            navigateAfterJoinRequest();
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps -- we only want to run this once after the policy loads
    }, [isPolicyLoading]);

    useEffect(
        () => () => {
            isUnmounted.current = true;
        },
        [],
    );

    return (
        <ScreenWrapper testID="WorkspaceJoinUserPage">
            <FullScreenLoadingIndicator style={[styles.flex1, styles.pRelative]} />
        </ScreenWrapper>
    );
}

export default WorkspaceJoinUserPage;
