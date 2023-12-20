import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Browser from '@libs/Browser';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import personalDetailsPropType from '@pages/personalDetailsPropType';
import SearchInputManager from '@pages/workspace/SearchInputManager';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import FormAlertWithSubmitButton from './FormAlertWithSubmitButton';
import SelectionList from './SelectionList';

const propTypes = {
    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** All of the personal details for everyone */
    personalDetails: PropTypes.objectOf(personalDetailsPropType),

    /** The users are not eligible for invitation */
    excludedUsers: PropTypes.arrayOf(PropTypes.string),

    /** It can be policyName or reportName */
    name: PropTypes.string,

    /** Function to invite users */
    inviteUsers: PropTypes.func.isRequired,

    /** Text displayed on the bottom submit button */
    confirmButtonText: PropTypes.string.isRequired,

    /** Whether to show the alert text */
    shouldShowAlertPrompt: PropTypes.bool,
};

const defaultProps = {
    personalDetails: {},
    betas: [],
    excludedUsers: [],
    name: '',
    shouldShowAlertPrompt: false,
};

function MemberInviteList(props) {
    const {excludedUsers, betas, name, shouldShowAlertPrompt, confirmButtonText} = props;
    const {translate} = useLocalize();
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [personalDetails, setPersonalDetails] = useState([]);
    const [userToInvite, setUserToInvite] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');

    const styles = useThemeStyles();

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
                data: [OptionsListUtils.formatMemberForList(userToInvite)],
                shouldShow: true,
                indexOffset,
            });
        }

        return sections;
    };

    const sections = getSections();

    useEffect(() => {
        setSearchTerm(SearchInputManager.searchInput);
    }, []);

    useEffect(() => {
        const inviteOptions = OptionsListUtils.getMemberInviteOptions(props.personalDetails, betas, searchTerm, excludedUsers);

        // Update selectedOptions with the latest personalDetails information
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
    }, [props.personalDetails, betas, searchTerm, excludedUsers]);

    const toggleOption = useCallback(
        (option) => {
            const isOptionInList = _.some(selectedOptions, (selectedOption) => selectedOption.login === option.login);

            let newSelectedOptions;
            if (isOptionInList) {
                newSelectedOptions = _.reject(selectedOptions, (selectedOption) => selectedOption.login === option.login);
            } else {
                newSelectedOptions = [...selectedOptions, {...option, isSelected: true}];
            }

            setSelectedOptions(newSelectedOptions);
        },
        [selectedOptions, setSelectedOptions],
    );

    const headerMessage = useMemo(() => {
        const searchValue = searchTerm.trim().toLowerCase();
        if (!userToInvite && CONST.EXPENSIFY_EMAILS.includes(searchValue)) {
            return translate('messages.errorMessageInvalidEmail');
        }
        if (!userToInvite && excludedUsers.includes(OptionsListUtils.addSMSDomainIfPhoneNumber(searchValue).toLowerCase())) {
            return translate('messages.userIsAlreadyMember', {login: searchValue, name});
        }
        return OptionsListUtils.getHeaderMessage(personalDetails.length !== 0, Boolean(userToInvite), searchValue);
    }, [excludedUsers, translate, searchTerm, userToInvite, personalDetails.length, name]);

    const inviteUsers = (selectedUsers) => {
        if (selectedUsers.length <= 0) {
            return;
        }

        const selectedEmailsToAccountIDs = {};
        _.each(selectedUsers, (option) => {
            const login = option.login || '';
            const accountID = lodashGet(option, 'accountID', '');
            if (!login.toLowerCase().trim() || !accountID) {
                return;
            }
            selectedEmailsToAccountIDs[login] = Number(accountID);
        });

        props.inviteUsers(selectedEmailsToAccountIDs);
    };

    return (
        <>
            <SelectionList
                canSelectMultiple
                sections={sections}
                textInputLabel={translate('optionsSelector.nameEmailOrPhoneNumber')}
                textInputValue={searchTerm}
                onChangeText={setSearchTerm}
                headerMessage={headerMessage}
                onSelectRow={toggleOption}
                onConfirm={() => inviteUsers(selectedOptions)}
                showScrollIndicator
                shouldPreventDefaultFocusOnSelectRow={!Browser.isMobile()}
                showLoadingPlaceholder={!OptionsListUtils.isPersonalDetailsReady(personalDetails)}
            />
            <View style={[styles.flexShrink0]}>
                <FormAlertWithSubmitButton
                    isDisabled={!selectedOptions.length}
                    buttonText={confirmButtonText}
                    onSubmit={() => inviteUsers(selectedOptions)}
                    containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto, styles.mb5]}
                    enabledWhenOffline
                    disablePressOnEnter
                    isAlertVisible={shouldShowAlertPrompt}
                />
            </View>
        </>
    );
}

MemberInviteList.propTypes = propTypes;
MemberInviteList.defaultProps = defaultProps;
MemberInviteList.displayName = 'MemberInviteList';

export default withOnyx({
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    },
    betas: {
        key: ONYXKEYS.BETAS,
    },
})(MemberInviteList);
