import React, {useEffect, useMemo, useState} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import Navigation from '../../libs/Navigation/Navigation';
import styles from '../../styles/styles';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import * as Policy from '../../libs/actions/Policy';
import FormAlertWithSubmitButton from '../../components/FormAlertWithSubmitButton';
import * as OptionsListUtils from '../../libs/OptionsListUtils';
import CONST from '../../CONST';
import withPolicy, {policyDefaultProps, policyPropTypes} from './withPolicy';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';
import ROUTES from '../../ROUTES';
import * as PolicyUtils from '../../libs/PolicyUtils';
import useNetwork from '../../hooks/useNetwork';
import useLocalize from '../../hooks/useLocalize';
import SelectionList from '../../components/SelectionList';

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
    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

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
    betas: [],
    isLoadingReportData: true,
    ...policyDefaultProps,
};

function WorkspaceInvitePage(props) {
    const {translate} = useLocalize();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [personalDetails, setPersonalDetails] = useState([]);
    const [userToInvite, setUserToInvite] = useState(null);
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

    useEffect(() => {
        const inviteOptions = OptionsListUtils.getMemberInviteOptions(props.personalDetails, props.betas, searchTerm, excludedUsers);

        // Update selectedOptions with the latest personalDetails and policyMembers information
        const detailsMap = {};
        _.forEach(inviteOptions.personalDetails, (detail) => (detailsMap[detail.login] = OptionsListUtils.formatMemberForList(detail, false)));
        const newSelectedOptions = [];
        _.forEach(selectedOptions, (option) => {
            newSelectedOptions.push(_.has(detailsMap, option.login) ? {...detailsMap[option.login], isSelected: true} : option);
        });

        setUserToInvite(inviteOptions.userToInvite);
        setPersonalDetails(inviteOptions.personalDetails);
        setSelectedOptions(newSelectedOptions);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- we don't want to recalculate when selectedOptions change
    }, [props.personalDetails, props.policyMembers, props.betas, searchTerm, excludedUsers]);

    const getSections = () => {
        const sections = [];
        let indexOffset = 0;

        sections.push({
            title: undefined,
            data: selectedOptions,
            shouldShow: true,
            indexOffset,
        });
        indexOffset += selectedOptions.length;

        // Filtering out selected users from the search results
        const selectedLogins = _.map(selectedOptions, ({login}) => login);
        const personalDetailsWithoutSelected = _.filter(personalDetails, ({login}) => !_.contains(selectedLogins, login));
        const personalDetailsFormatted = _.map(personalDetailsWithoutSelected, (personalDetail) => OptionsListUtils.formatMemberForList(personalDetail, false));
        const hasUnselectedUserToInvite = userToInvite && !_.contains(selectedLogins, userToInvite.login);

        sections.push({
            title: translate('common.contacts'),
            data: personalDetailsFormatted,
            shouldShow: !_.isEmpty(personalDetailsFormatted),
            indexOffset,
        });
        indexOffset += personalDetailsFormatted.length;

        if (hasUnselectedUserToInvite) {
            sections.push({
                title: undefined,
                data: [OptionsListUtils.formatMemberForList(userToInvite, false)],
                shouldShow: true,
                indexOffset,
            });
        }

        return sections;
    };

    const toggleOption = (option) => {
        Policy.clearErrors(props.route.params.policyID);

        const isOptionInList = _.some(selectedOptions, (selectedOption) => selectedOption.login === option.login);

        let newSelectedOptions;
        if (isOptionInList) {
            newSelectedOptions = _.reject(selectedOptions, (selectedOption) => selectedOption.login === option.login);
        } else {
            newSelectedOptions = [...selectedOptions, {...option, isSelected: true}];
        }

        setSelectedOptions(newSelectedOptions);
    };

    const validate = () => {
        const errors = {};
        if (selectedOptions.length <= 0) {
            errors.noUserSelected = true;
        }

        Policy.setWorkspaceErrors(props.route.params.policyID, errors);
        return _.size(errors) <= 0;
    };

    const inviteUser = () => {
        if (!validate()) {
            return;
        }

        const invitedEmailsToAccountIDs = {};
        _.each(selectedOptions, (option) => {
            const login = option.login || '';
            const accountID = lodashGet(option, 'accountID', '');
            if (!login.toLowerCase().trim() || !accountID) {
                return;
            }
            invitedEmailsToAccountIDs[login] = Number(accountID);
        });
        Policy.setWorkspaceInviteMembersDraft(props.route.params.policyID, invitedEmailsToAccountIDs);
        Navigation.navigate(ROUTES.getWorkspaceInviteMessageRoute(props.route.params.policyID));
    };

    const [policyName, shouldShowAlertPrompt] = useMemo(
        () => [lodashGet(props.policy, 'name'), _.size(lodashGet(props.policy, 'errors', {})) > 0 || lodashGet(props.policy, 'alertMessage', '').length > 0],
        [props.policy],
    );

    const headerMessage = useMemo(() => {
        const searchValue = searchTerm.trim().toLowerCase();
        if (!userToInvite && CONST.EXPENSIFY_EMAILS.includes(searchValue)) {
            return translate('messages.errorMessageInvalidEmail');
        }
        if (!userToInvite && excludedUsers.includes(searchValue)) {
            return translate('messages.userIsAlreadyMemberOfWorkspace', {login: searchValue, workspace: policyName});
        }
        return OptionsListUtils.getHeaderMessage(personalDetails.length !== 0, Boolean(userToInvite), searchValue);
    }, [excludedUsers, translate, searchTerm, policyName, userToInvite, personalDetails]);

    return (
        <ScreenWrapper shouldEnableMaxHeight>
            {({didScreenTransitionEnd}) => {
                const sections = didScreenTransitionEnd ? getSections() : [];

                return (
                    <FullPageNotFoundView
                        shouldShow={(_.isEmpty(props.policy) || !PolicyUtils.isPolicyAdmin(props.policy)) && !props.isLoadingReportData}
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
                                Navigation.goBack(ROUTES.getWorkspaceMembersRoute(props.route.params.policyID));
                            }}
                        />
                        <SelectionList
                            canSelectMultiple
                            sections={sections}
                            textInputLabel={translate('optionsSelector.nameEmailOrPhoneNumber')}
                            textInputValue={searchTerm}
                            onChangeText={setSearchTerm}
                            headerMessage={headerMessage}
                            onSelectRow={toggleOption}
                            onConfirm={inviteUser}
                            showScrollIndicator
                            showLoadingPlaceholder={!didScreenTransitionEnd || !OptionsListUtils.isPersonalDetailsReady(props.personalDetails)}
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
                );
            }}
        </ScreenWrapper>
    );
}

WorkspaceInvitePage.propTypes = propTypes;
WorkspaceInvitePage.defaultProps = defaultProps;
WorkspaceInvitePage.displayName = 'WorkspaceInvitePage';

export default compose(
    withPolicy,
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
        isLoadingReportData: {
            key: ONYXKEYS.IS_LOADING_REPORT_DATA,
        },
    }),
)(WorkspaceInvitePage);
