import type {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useRef} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import ScreenWrapper from '@components/ScreenWrapper';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useThemeStyles from '@hooks/useThemeStyles';
// import {areEmailsFromSamePrivateDomain} from '@libs/LoginUtils';
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

function WorkspaceJoinUserPage({route, policies}: WorkspaceJoinUserPageProps) {
    const styles = useThemeStyles();
    const policyID = route?.params?.policyID;
    // const invitedEmail = route?.params?.email;
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const policy = ReportUtils.getPolicy(policyID);
    const executedRef = useRef(false);

    useEffect(() => {
        if (!currentUserPersonalDetails.login || !policy || !policies || executedRef?.current) {
            return;
        }
        const isPolicyMember = PolicyUtils.isPolicyMember(policyID, policies as Record<string, Policy>)
        if (isPolicyMember) {
            Navigation.goBack(undefined, false, true);
            return;
        }
        // Will be used later when API return reportID to invited member with the same domain
        // const isSamePrivateDomain = policy?.owner ? areEmailsFromSamePrivateDomain(currentUserPersonalDetails.login, policy?.owner) : false;
        PolicyAction.inviteMemberToWorkspace(policyID, currentUserPersonalDetails?.login);
        executedRef.current = true;
        Navigation.navigate(ROUTES.ALL_SETTINGS);
    }, [currentUserPersonalDetails?.login, policy, policyID, policies]);

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
