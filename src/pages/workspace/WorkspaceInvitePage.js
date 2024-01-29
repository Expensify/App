import {useNavigation} from '@react-navigation/native';
import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as LoginUtils from '@libs/LoginUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import {parsePhoneNumber} from '@libs/PhoneNumber';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SearchInputManager from './SearchInputManager';
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
    invitedEmailsToAccountIDsDraft: PropTypes.objectOf(PropTypes.number),
    ...policyPropTypes,
};

const defaultProps = {
    personalDetails: {},
    betas: [],
    isLoadingReportData: true,
    invitedEmailsToAccountIDsDraft: {},
    ...policyDefaultProps,
};

function WorkspaceInvitePage(props) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [personalDetails, setPersonalDetails] = useState([]);
    const [usersToInvite, setUsersToInvite] = useState([]);
    const [didScreenTransitionEnd, setDidScreenTransitionEnd] = useState(false);
    const navigation = useNavigation();
    const openWorkspaceInvitePage = () => {
        const policyMemberEmailsToAccountIDs = PolicyUtils.getMemberAccountIDsForWorkspace(props.policyMembers, props.personalDetails);
        Policy.openWorkspaceInvitePage(props.route.params.policyID, _.keys(policyMemberEmailsToAccountIDs));
    };

    useEffect(() => {
        setSearchTerm(SearchInputManager.searchInput);
        return () => {
            Policy.setWorkspaceInviteMembersDraft(props.route.params.policyID, {});
        };
    }, [props.route.params.policyID]);

    useEffect(() => {
        Policy.clearErrors(props.route.params.policyID);
        openWorkspaceInvitePage();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- policyID changes remount the component
    }, []);

    useEffect(() => {
        const unsubscribeTransitionEnd = navigation.addListener('transitionEnd', () => {
            setDidScreenTransitionEnd(true);
        });

        return () => {
            unsubscribeTransitionEnd();
        };
        // Rule disabled because this effect is only for component did mount & will component unmount lifecycle event
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useNetwork({onReconnect: openWorkspaceInvitePage});

    const excludedUsers = useMemo(() => PolicyUtils.getIneligibleInvitees(props.policyMembers, props.personalDetails), [props.policyMembers, props.personalDetails]);

    useEffect(() => {
        const newUsersToInviteDict = {};
        const newPersonalDetailsDict = {};
        const newSelectedOptionsDict = {};

        const inviteOptions = OptionsListUtils.getMemberInviteOptions(props.personalDetails, props.betas, searchTerm, excludedUsers, true);

        // Update selectedOptions with the latest personalDetails and policyMembers information
        const detailsMap = {};
        _.each(inviteOptions.personalDetails, (detail) => (detailsMap[detail.login] = OptionsListUtils.formatMemberForList(detail)));

        const newSelectedOptions = [];
        _.each(_.keys(props.invitedEmailsToAccountIDsDraft), (login) => {
            if (!_.has(detailsMap, login)) {
                return;
            }
            newSelectedOptions.push({...detailsMap[login], isSelected: true});
        });
        _.each(selectedOptions, (option) => {
            newSelectedOptions.push(_.has(detailsMap, option.login) ? {...detailsMap[option.login], isSelected: true} : option);
        });

        const userToInvite = inviteOptions.userToInvite;

        // Only add the user to the invites list if it is valid
        if (userToInvite) {
            newUsersToInviteDict[userToInvite.accountID] = userToInvite;
        }

        // Add all personal details to the new dict
        _.each(inviteOptions.personalDetails, (details) => {
            newPersonalDetailsDict[details.accountID] = details;
        });

        // Add all selected options to the new dict
        _.each(newSelectedOptions, (option) => {
            newSelectedOptionsDict[option.accountID] = option;
        });

        // Strip out dictionary keys and update arrays
        setUsersToInvite(_.values(newUsersToInviteDict));
        setPersonalDetails(_.values(newPersonalDetailsDict));
        setSelectedOptions(_.values(newSelectedOptionsDict));

        // eslint-disable-next-line react-hooks/exhaustive-deps -- we don't want to recalculate when selectedOptions change
    }, [props.personalDetails, props.policyMembers, props.betas, searchTerm, excludedUsers]);

    const sections = useMemo(() => {
        const sectionsArr = [];
        let indexOffset = 0;

        if (!didScreenTransitionEnd) {
            return [];
        }

        // Filter all options that is a part of the search term or in the personal details
        let filterSelectedOptions = selectedOptions;
        if (searchTerm !== '') {
            filterSelectedOptions = _.filter(selectedOptions, (option) => {
                const accountID = lodashGet(option, 'accountID', null);
                const isOptionInPersonalDetails = _.some(personalDetails, (personalDetail) => personalDetail.accountID === accountID);
                const parsedPhoneNumber = parsePhoneNumber(LoginUtils.appendCountryCode(Str.removeSMSDomain(searchTerm)));
                const searchValue = parsedPhoneNumber.possible ? parsedPhoneNumber.number.e164 : searchTerm.toLowerCase();

                const isPartOfSearchTerm = option.text.toLowerCase().includes(searchValue) || option.login.toLowerCase().includes(searchValue);
                return isPartOfSearchTerm || isOptionInPersonalDetails;
            });
        }

        sectionsArr.push({
            title: undefined,
            data: filterSelectedOptions,
            shouldShow: true,
            indexOffset,
        });
        indexOffset += filterSelectedOptions.length;

        // Filtering out selected users from the search results
        const selectedLogins = _.map(selectedOptions, ({login}) => login);
        const personalDetailsWithoutSelected = _.filter(personalDetails, ({login}) => !_.contains(selectedLogins, login));
        const personalDetailsFormatted = _.map(personalDetailsWithoutSelected, OptionsListUtils.formatMemberForList);

        sectionsArr.push({
            title: translate('common.contacts'),
            data: personalDetailsFormatted,
            shouldShow: !_.isEmpty(personalDetailsFormatted),
            indexOffset,
        });
        indexOffset += personalDetailsFormatted.length;

        _.each(usersToInvite, (userToInvite) => {
            const hasUnselectedUserToInvite = !_.contains(selectedLogins, userToInvite.login);

            if (hasUnselectedUserToInvite) {
                sectionsArr.push({
                    title: undefined,
                    data: [OptionsListUtils.formatMemberForList(userToInvite)],
                    shouldShow: true,
                    indexOffset: indexOffset++,
                });
            }
        });

        return sectionsArr;
    }, [personalDetails, searchTerm, selectedOptions, usersToInvite, translate, didScreenTransitionEnd]);

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
        Navigation.navigate(ROUTES.WORKSPACE_INVITE_MESSAGE.getRoute(props.route.params.policyID));
    };

    const [policyName, shouldShowAlertPrompt] = useMemo(
        () => [lodashGet(props.policy, 'name'), _.size(lodashGet(props.policy, 'errors', {})) > 0 || lodashGet(props.policy, 'alertMessage', '').length > 0],
        [props.policy],
    );

    const headerMessage = useMemo(() => {
        const searchValue = searchTerm.trim().toLowerCase();
        if (usersToInvite.length === 0 && CONST.EXPENSIFY_EMAILS.includes(searchValue)) {
            return translate('messages.errorMessageInvalidEmail');
        }
        if (
            usersToInvite.length === 0 &&
            excludedUsers.includes(
                parsePhoneNumber(LoginUtils.appendCountryCode(searchValue)).possible ? OptionsListUtils.addSMSDomainIfPhoneNumber(LoginUtils.appendCountryCode(searchValue)) : searchValue,
            )
        ) {
            return translate('messages.userIsAlreadyMember', {login: searchValue, name: policyName});
        }
        return OptionsListUtils.getHeaderMessage(personalDetails.length !== 0, usersToInvite.length > 0, searchValue);
    }, [excludedUsers, translate, searchTerm, policyName, usersToInvite, personalDetails.length]);

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            testID={WorkspaceInvitePage.displayName}
        >
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
                <SelectionList
                    canSelectMultiple
                    sections={sections}
                    textInputLabel={translate('optionsSelector.nameEmailOrPhoneNumber')}
                    textInputValue={searchTerm}
                    onChangeText={(value) => {
                        SearchInputManager.searchInput = value;
                        setSearchTerm(value);
                    }}
                    headerMessage={headerMessage}
                    onSelectRow={toggleOption}
                    onConfirm={inviteUser}
                    showScrollIndicator
                    showLoadingPlaceholder={!didScreenTransitionEnd || !OptionsListUtils.isPersonalDetailsReady(props.personalDetails)}
                    shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
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
        </ScreenWrapper>
    );
}

WorkspaceInvitePage.propTypes = propTypes;
WorkspaceInvitePage.defaultProps = defaultProps;
WorkspaceInvitePage.displayName = 'WorkspaceInvitePage';

export default compose(
    withPolicyAndFullscreenLoading,
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
        invitedEmailsToAccountIDsDraft: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${route.params.policyID.toString()}`,
        },
    }),
)(WorkspaceInvitePage);
