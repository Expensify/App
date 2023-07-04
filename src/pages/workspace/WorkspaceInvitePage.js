/* eslint-disable react/prop-types */
import React, {useState, useEffect, useCallback} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import Navigation from '../../libs/Navigation/Navigation';
import styles from '../../styles/styles';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import * as Policy from '../../libs/actions/Policy';
import FormAlertWithSubmitButton from '../../components/FormAlertWithSubmitButton';
import FormSubmit from '../../components/FormSubmit';
import OptionsSelector from '../../components/OptionsSelector';
import * as OptionsListUtils from '../../libs/OptionsListUtils';
import CONST from '../../CONST';
import * as Link from '../../libs/actions/Link';
import {policyPropTypes, policyDefaultProps} from './withPolicy';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';
import {withNetwork} from '../../components/OnyxProvider';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';
import networkPropTypes from '../../components/networkPropTypes';
import ROUTES from '../../ROUTES';
import * as Browser from '../../libs/Browser';
import * as PolicyUtils from '../../libs/PolicyUtils';

const personalDetailsPropTypes = PropTypes.shape({
    /** The login of the person (either email or phone number) */
    login: PropTypes.string.isRequired,

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

    ...policyPropTypes,
    ...withLocalizePropTypes,
    network: networkPropTypes.isRequired,
};

const defaultProps = {
    personalDetails: {},
    betas: [],
    ...policyDefaultProps,
};

function WorkspaceInvitePage(props) {
    const [searchTerm, setSearchTerm] = useState(''); //
    const [personalDetails, setPersonalDetails] = useState([]); // array of all details of invited users
    const [selectedOptions, setSelectedOptions] = useState([]); // this is an array of emails to invite
    const [userToInvite, setUserToInvite] = useState(null);

    const getExcludedUsers = useCallback(() => {
        // Exclude any expensify emails or valid policy members from the invite options
        const memberEmailsToExclude = [...CONST.EXPENSIFY_EMAILS];
        _.each(props.policyMembers, (policyMember, accountID) => {
            // Policy members that are pending delete or have errors are not valid and we should show them in the invite options (don't exclude them).
            if (policyMember.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || !_.isEmpty(policyMember.errors)) {
                return;
            }
            const memberEmail = lodashGet(props.personalDetails, `[${accountID}].login`);
            if (!memberEmail) {
                return;
            }
            memberEmailsToExclude.push(memberEmail);
        });
        return memberEmailsToExclude;
    }, [props.personalDetails, props.policyMembers]);

    // const updateOptionsWithSearchTerm = useCallback(() => {
    //     this.setState({
    //         searchTerm,
    //         userToInvite,
    //         personalDetails,
    //     });
    // }, [searchTerm, personalDetails, userToInvite]);

    const updateOptionsWithSearchTerm = useCallback((searchTerm = '') => {
        const {personalDetails, userToInvite} = OptionsListUtils.getMemberInviteOptions(props.personalDetails, props.betas, searchTerm, getExcludedUsers());

        // Update selectedOptions with the latest personalDetails and policyMembers information
        const detailsMap = {};
        _.forEach(personalDetails, (detail) => (detailsMap[detail.login] = detail)); // email => all details obj.

        const newSelectedOptions = [];
        _.forEach(selectedOptions, (option) => {
            newSelectedOptions.push(_.has(detailsMap, option.login) ? detailsMap[option.login] : option);
        });

        setSearchTerm(searchTerm);
        setPersonalDetails(detailsMap);
        setUserToInvite(userToInvite); //Check
        setSelectedOptions(newSelectedOptions);
    }, []);

    useEffect(() => {
        updateOptionsWithSearchTerm(props.searchTerm);
    }, [props.personalDetails, props.searchTerm, updateOptionsWithSearchTerm]);

    useEffect(() => {
        if (props.network.isOffline) {
            return;
        }
        const policyMemberEmailsToAccountIDs = PolicyUtils.getClientPolicyMemberEmailsToAccountIDs(props.policyMembers, props.personalDetails);
        Policy.openWorkspaceInvitePage(props.route.params.policyID, _.keys(policyMemberEmailsToAccountIDs));
    }, [props.network.isOffline, props.personalDetails, props.policyMembers, props.route.params.policyID]);

    /**
     * @returns {Boolean}
     */
    const getShouldShowAlertPrompt = useCallback(() => _.size(lodashGet(props.policy, 'errors', {})) > 0 || lodashGet(props.policy, 'alertMessage', '').length > 0, [props.policy]);

    /**
     * Returns the sections needed for the OptionsSelector
     * @returns {Array}
     */
    const getSections = useCallback(() => {
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
        const filterText = _.reduce(selectedOptions, (str, {login}) => `${str} ${login}`, '');
        const personalDetailsWithoutSelected = _.filter(personalDetails, ({login}) => !filterText.includes(login));
        const hasUnselectedUserToInvite = userToInvite && !filterText.includes(userToInvite.login);

        sections.push({
            title: props.translate('common.contacts'),
            data: personalDetailsWithoutSelected,
            shouldShow: !_.isEmpty(personalDetailsWithoutSelected),
            indexOffset,
        });
        indexOffset += personalDetailsWithoutSelected.length;

        if (hasUnselectedUserToInvite) {
            sections.push({
                title: undefined,
                data: [userToInvite],
                shouldShow: true,
                indexOffset,
            });
        }

        return sections;
    }, []);

    const openPrivacyURL = useCallback((e) => {
        e.preventDefault();
        Link.openExternalLink(CONST.PRIVACY_URL);
    }, []);

    const clearErrors = useCallback(() => {
        Policy.setWorkspaceErrors(props.route.params.policyID, {});
        Policy.hideWorkspaceAlertMessage(props.route.params.policyID);
    }, [props.route.params.policyID]);

    /**
     * Removes a selected option from list if already selected. If not already selected add this option to the list.
     * @param {Object} option
     */

    const toggleOption = useCallback((option) => {
        clearErrors();

        let newSelectedOptions;

        if (isOptionInList) {
            newSelectedOptions = _.reject(selectedOptions, (selectedOption) => selectedOption.login === option.login);
        } else {
            newSelectedOptions = [...selectedOptions, option];
        }

        setSelectedOptions(newSelectedOptions);
    });

    /**
     * @returns {Boolean}
     */
    const validate = useCallback(() => {
        const errors = {};
        if (selectedOptions.length <= 0) {
            errors.noUserSelected = true;
        }

        Policy.setWorkspaceErrors(props.route.params.policyID, errors);
        return _.size(errors) <= 0;
    }, [props.route.params.policyID, selectedOptions.length]);

    /**
     * Handle the invite button click
     */
    const inviteUser = useCallback(() => {
        if (!validate()) {
            return;
        }

        const invitedEmailsToAccountIDs = {};
        _.each(selectedOptions, (option) => {
            const login = option.login || '';
            const accountID = lodashGet(option, 'participantsList[0].accountID');
            if (!login.toLowerCase().trim() || !accountID) {
                return;
            }
            invitedEmailsToAccountIDs[login] = Number(accountID);
        });
        Policy.setWorkspaceInviteMembersDraft(props.route.params.policyID, invitedEmailsToAccountIDs);
        Navigation.navigate(ROUTES.getWorkspaceInviteMessageRoute(props.route.params.policyID));
    }, [props.route.params.policyID, selectedOptions, validate]);

    const sections = getSections();
    const headerMessage = OptionsListUtils.getHeaderMessage(personalDetails.length !== 0, Boolean(userToInvite), searchTerm);
    const policyName = lodashGet(props.policy, 'name');

    return (
        <ScreenWrapper shouldEnableMaxHeight>
            <FullPageNotFoundView
                shouldShow={_.isEmpty(props.policy)}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WORKSPACES)}
            >
                <FormSubmit
                    style={[styles.flex1]}
                    onSubmit={inviteUser}
                >
                    <HeaderWithBackButton
                        title={props.translate('workspace.invite.invitePeople')}
                        subtitle={policyName}
                        shouldShowGetAssistanceButton
                        guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_MEMBERS}
                        onBackButtonPress={() => {
                            clearErrors();
                            Navigation.goBack(ROUTES.getWorkspaceMembersRoute(props.route.params.policyID));
                        }}
                    />
                    <View style={[styles.flexGrow1, styles.flexShrink0, styles.flexBasisAuto]}>
                        <OptionsSelector
                            contentContainerStyles={[styles.flexGrow1, styles.flexShrink0, styles.flexBasisAuto]}
                            listContainerStyles={[styles.flexGrow1, styles.flexShrink1, styles.flexBasis0]}
                            canSelectMultipleOptions
                            sections={sections}
                            selectedOptions={selectedOptions}
                            value={searchTerm}
                            shouldShowOptions={OptionsListUtils.isPersonalDetailsReady(props.personalDetails)}
                            onSelectRow={toggleOption}
                            onChangeText={updateOptionsWithSearchTerm}
                            onConfirmSelection={inviteUser}
                            headerMessage={headerMessage}
                            hideSectionHeaders
                            boldStyle
                            shouldFocusOnSelectRow={!Browser.isMobile()}
                            textInputLabel={props.translate('optionsSelector.nameEmailOrPhoneNumber')}
                        />
                    </View>
                    <View style={[styles.flexShrink0]}>
                        <FormAlertWithSubmitButton
                            isDisabled={!selectedOptions.length}
                            isAlertVisible={getShouldShowAlertPrompt()}
                            buttonText={props.translate('common.next')}
                            onSubmit={inviteUser}
                            message={props.policy.alertMessage}
                            containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto, styles.mb5]}
                            enabledWhenOffline
                            disablePressOnEnter
                        />
                    </View>
                </FormSubmit>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

WorkspaceInvitePage.propTypes = propTypes;
WorkspaceInvitePage.defaultProps = defaultProps;
WorkspaceInvitePage.displayName = 'WorkspaceInvitePage';

export default compose(
    withLocalize,
    withPolicyAndFullscreenLoading,
    withNetwork(),
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
)(WorkspaceInvitePage);
