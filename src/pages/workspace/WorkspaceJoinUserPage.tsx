import type {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useRef} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import ScreenWrapper from '@components/ScreenWrapper';
import useThemeStyles from '@hooks/useThemeStyles';
import navigateAfterJoinRequest from '@libs/navigateAfterJoinRequest';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import Navigation from '@navigation/Navigation';
import type {AuthScreensParamList} from '@navigation/types';
import * as PolicyAction from '@userActions/Policy';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';

type WorkspaceJoinUserPageOnyxProps = {
    /** The list of this user's policies */
    policies: OnyxCollection<Policy>;
};

type WorkspaceJoinUserPageRoute = {route: StackScreenProps<AuthScreensParamList, typeof SCREENS.WORKSPACE_JOIN_USER>['route']};
type WorkspaceJoinUserPageProps = WorkspaceJoinUserPageRoute & WorkspaceJoinUserPageOnyxProps;

let isJoinLinkUsed = false;

function WorkspaceJoinUserPage({route, policies}: WorkspaceJoinUserPageProps) {
    const styles = useThemeStyles();
    const policyID = route?.params?.policyID;
    const inviterEmail = route?.params?.email;
    const policy = ReportUtils.getPolicy(policyID);
    const isUnmounted = useRef(false);

    useEffect(() => {
        if (!isJoinLinkUsed) {
            return;
        }
        navigateAfterJoinRequest();
    }, []);

    useEffect(() => {
        if (!policy || !policies || isUnmounted.current || isJoinLinkUsed) {
            return;
        }
        const isPolicyMember = PolicyUtils.isPolicyMember(policyID, policies as Record<string, Policy>);
        if (isPolicyMember) {
            Navigation.isNavigationReady().then(() => {
                Navigation.goBack(undefined, false, true);
                Navigation.navigate(ROUTES.WORKSPACE_INITIAL.getRoute(policyID ?? ''));
            });
            return;
        }
        PolicyAction.inviteMemberToWorkspace(policyID, inviterEmail);
        isJoinLinkUsed = true;
        Navigation.isNavigationReady().then(() => {
            if (isUnmounted.current) {
                return;
            }
            navigateAfterJoinRequest();
        });
    }, [policy, policyID, policies, inviterEmail]);

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
export default withOnyx<WorkspaceJoinUserPageProps, WorkspaceJoinUserPageOnyxProps>({
    policies: {
        key: ONYXKEYS.COLLECTION.POLICY,
    },
})(WorkspaceJoinUserPage);
