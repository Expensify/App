import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MemberInviteList from '@components/MemberInviteList';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {policyDefaultProps, policyPropTypes} from './withPolicy';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';

const personalDetailsPropTypes = PropTypes.shape({
    /** The login of the person (either email or phone number) */
    login: PropTypes.string,

    /** The URL of the person's avatar (there should already be a default avatar if
  the person doesn't have their own avatar uploaded yet, except for anon users) */
    avatar: PropTypes.string,

    /** This is either the user's full name, or their login if full name is an empty string */
    displayName: PropTypes.string,
});

const propTypes = {
    /** All of the personal details for everyone */
    personalDetails: PropTypes.objectOf(personalDetailsPropTypes),

    /** URL Route params */
    route: PropTypes.shape({
        /** Params from the URL path */
        params: PropTypes.shape({
            /** policyID passed via route: /workspace/:policyID/invite */
            policyID: PropTypes.string,
        }),
    }).isRequired,

    isLoadingReportData: PropTypes.bool,
    ...policyPropTypes,
};

const defaultProps = {
    personalDetails: {},
    isLoadingReportData: true,
    ...policyDefaultProps,
};

function WorkspaceInvitePage(props) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const openWorkspaceInvitePage = () => {
        const policyMemberEmailsToAccountIDs = PolicyUtils.getMemberAccountIDsForWorkspace(props.policyMembers, props.personalDetails);
        Policy.openWorkspaceInvitePage(props.route.params.policyID, _.keys(policyMemberEmailsToAccountIDs));
    };

    useEffect(() => {
        Policy.clearErrors(props.route.params.policyID);
        openWorkspaceInvitePage();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- policyID changes remount the component
    }, []);

    useNetwork({onReconnect: openWorkspaceInvitePage});

    const excludedUsers = useMemo(() => PolicyUtils.getIneligibleInvitees(props.policyMembers, props.personalDetails), [props.policyMembers, props.personalDetails]);

    const validate = (selectedMembersSize) => {
        const errors = {};
        if (selectedMembersSize <= 0) {
            errors.noUserSelected = true;
        }

        Policy.setWorkspaceErrors(props.route.params.policyID, errors);
        return _.size(errors) <= 0;
    };

    const inviteUsers = (selectedUsers) => {
        if (!validate(selectedUsers.length)) {
            return;
        }

        const invitedEmailsToAccountIDs = {};
        _.each(selectedUsers, (option) => {
            const login = option.login || '';
            const accountID = lodashGet(option, 'accountID', '');
            if (!login.toLowerCase().trim() || !accountID) {
                return;
            }
            invitedEmailsToAccountIDs[login] = Number(accountID);
        });
        Policy.setWorkspaceInviteMembersDraft(props.route.params.policyID, invitedEmailsToAccountIDs);
        Navigation.navigate(ROUTES.WORKSPACE_INVITE_MESSAGE.getRoute(props.route.params.policyID));
    };

    const [policyName, shouldShowAlertPrompt] = useMemo(
        () => [lodashGet(props.policy, 'name'), _.size(lodashGet(props.policy, 'errors', {})) > 0 || lodashGet(props.policy, 'alertMessage', '').length > 0],
        [props.policy],
    );

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            testID={WorkspaceInvitePage.displayName}
        >
            {({didScreenTransitionEnd}) => (
                <FullPageNotFoundView
                    shouldShow={(_.isEmpty(props.policy) && !props.isLoadingReportData) || !PolicyUtils.isPolicyAdmin(props.policy) || PolicyUtils.isPendingDeletePolicy(props.policy)}
                    subtitleKey={_.isEmpty(props.policy) ? undefined : 'workspace.common.notAuthorized'}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WORKSPACES)}
                >
                    <HeaderWithBackButton
                        title={translate('workspace.invite.invitePeople')}
                        subtitle={policyName}
                        shouldShowGetAssistanceButton
                        guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_MEMBERS}
                        onBackButtonPress={() => {
                            Policy.clearErrors(props.route.params.policyID);
                            Navigation.goBack(ROUTES.WORKSPACE_MEMBERS.getRoute(props.route.params.policyID));
                        }}
                    />
                    <MemberInviteList
                        didScreenTransitionEnd={didScreenTransitionEnd}
                        inviteUsers={inviteUsers}
                        excludedUsers={excludedUsers}
                        name={policyName}
                    />
                    <View style={[styles.flexShrink0]}>
                        <FormAlertWithSubmitButton
                            isDisabled={!selectedOptions.length}
                            isAlertVisible={shouldShowAlertPrompt}
                            buttonText={translate('common.next')}
                            onSubmit={inviteUser}
                            message={props.policy.alertMessage}
                            containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto, styles.mb5]}
                            enabledWhenOffline
                            disablePressOnEnter
                        />
                    </View>
                </FullPageNotFoundView>
            )}
        </ScreenWrapper>
    );
}

WorkspaceInvitePage.propTypes = propTypes;
WorkspaceInvitePage.defaultProps = defaultProps;
WorkspaceInvitePage.displayName = 'WorkspaceInvitePage';

export default compose(
    withPolicyAndFullscreenLoading,
    withOnyx({
        isLoadingReportData: {
            key: ONYXKEYS.IS_LOADING_REPORT_DATA,
        },
    }),
)(WorkspaceInvitePage);
