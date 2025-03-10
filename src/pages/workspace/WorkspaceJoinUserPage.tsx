import React, {useEffect, useRef} from 'react';
import {useOnyx} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import ScreenWrapper from '@components/ScreenWrapper';
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
    const [policy, policyResult] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const isPolicyLoading = isLoadingOnyxValue(policyResult);
    const inviterEmail = route?.params?.email;
    const isUnmounted = useRef(false);

    useEffect(() => {
        if (isUnmounted.current || isPolicyLoading) {
            return;
        }
        if (!isEmptyObject(policy) && !policy?.isJoinRequestPending && !isPendingDeletePolicy(policy)) {
            Navigation.isNavigationReady().then(() => {
                Navigation.goBack(undefined, {shouldPopToTop: true});
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
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- we only want to run this once after the policy loads
    }, [isPolicyLoading]);

    useEffect(
        () => () => {
            isUnmounted.current = true;
        },
        [],
    );

    return (
        <ScreenWrapper testID={WorkspaceJoinUserPage.displayName}>
            <FullScreenLoadingIndicator style={[styles.flex1, styles.pRelative]} />
        </ScreenWrapper>
    );
}

WorkspaceJoinUserPage.displayName = 'WorkspaceJoinUserPage';
export default WorkspaceJoinUserPage;
