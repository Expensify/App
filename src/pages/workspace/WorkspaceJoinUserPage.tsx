import type {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useRef} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import ScreenWrapper from '@components/ScreenWrapper';
import useThemeStyles from '@hooks/useThemeStyles';
import navigateAfterJoinRequest from '@libs/navigateAfterJoinRequest';
import * as PolicyUtils from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {AuthScreensParamList} from '@navigation/types';
import * as MemberAction from '@userActions/Policy/Member';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type WorkspaceJoinUserPageOnyxProps = {
    /** The policy of the report */
    policy: OnyxEntry<Policy>;
};

type WorkspaceJoinUserPageRoute = {route: StackScreenProps<AuthScreensParamList, typeof SCREENS.WORKSPACE_JOIN_USER>['route']};
type WorkspaceJoinUserPageProps = WorkspaceJoinUserPageRoute & WorkspaceJoinUserPageOnyxProps;

let isJoinLinkUsed = false;

function WorkspaceJoinUserPage({route, policy}: WorkspaceJoinUserPageProps) {
    const styles = useThemeStyles();
    const policyID = route?.params?.policyID;
    const inviterEmail = route?.params?.email;
    const isUnmounted = useRef(false);

    useEffect(() => {
        if (!isJoinLinkUsed) {
            return;
        }
        navigateAfterJoinRequest();
    }, []);

    useEffect(() => {
        if (isUnmounted.current || isJoinLinkUsed) {
            return;
        }
        if (!isEmptyObject(policy) && !policy?.isJoinRequestPending && !PolicyUtils.isPendingDeletePolicy(policy)) {
            Navigation.isNavigationReady().then(() => {
                Navigation.goBack(undefined, false, true);
                Navigation.navigate(ROUTES.WORKSPACE_INITIAL.getRoute(policyID ?? '-1'));
            });
            return;
        }
        MemberAction.inviteMemberToWorkspace(policyID, inviterEmail);
        isJoinLinkUsed = true;
        Navigation.isNavigationReady().then(() => {
            if (isUnmounted.current) {
                return;
            }
            navigateAfterJoinRequest();
        });
    }, [policy, policyID, inviterEmail]);

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

export default function ComponentWithOnyx(props: Omit<WorkspaceJoinUserPageProps, keyof WorkspaceJoinUserPageOnyxProps>) {
    const [policy, policyMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${props.route?.params?.policyID}`);

    if (isLoadingOnyxValue(policyMetadata)) {
        return null;
    }

    return (
        <WorkspaceJoinUserPage
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            policy={policy}
        />
    );
}
