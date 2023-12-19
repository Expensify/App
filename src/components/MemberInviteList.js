import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import useLocalize from '@hooks/useLocalize';
import * as Browser from '@libs/Browser';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import personalDetailsPropType from '@pages/personalDetailsPropType';
import SearchInputManager from '@pages/workspace/SearchInputManager';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import optionPropTypes from './optionPropTypes';
import SelectionList from './SelectionList';

const propTypes = {
    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** All of the personal details for everyone */
    personalDetails: PropTypes.objectOf(personalDetailsPropType),

    /** Array of already selected options */
    selectedOptions: PropTypes.arrayOf(optionPropTypes).isRequired,

    didScreenTransitionEnd: PropTypes.bool.isRequired,

    excludedUsers: PropTypes.arrayOf(PropTypes.string),

    name: PropTypes.string,

    setSelectedOptions: PropTypes.func.isRequired,

    inviteUsers: PropTypes.func.isRequired,
};

const defaultProps = {
    personalDetails: {},
    betas: [],
    excludedUsers: [],
    name: '',
};

function MemberInviteList(props) {
    const {selectedOptions, setSelectedOptions, excludedUsers, betas, didScreenTransitionEnd, name, inviteUsers} = props;
    const {translate} = useLocalize();
    const [personalDetails, setPersonalDetails] = useState([]);
    const [usersToInvite, setUsersToInvite] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');

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

        sections.push({
            title: translate('common.contacts'),
            data: personalDetailsFormatted,
            shouldShow: !_.isEmpty(personalDetailsFormatted),
            indexOffset,
        });
        indexOffset += personalDetailsFormatted.length;

        _.each(usersToInvite, (userToInvite) => {
            const hasUnselectedUserToInvite = !_.contains(selectedLogins, userToInvite.login);

            if (hasUnselectedUserToInvite) {
                sections.push({
                    title: undefined,
                    data: [OptionsListUtils.formatMemberForList(userToInvite)],
                    shouldShow: true,
                    indexOffset: indexOffset++,
                });
            }
        });

        return sections;
    };

    const sections = didScreenTransitionEnd ? getSections() : [];

    useEffect(() => {
        setSearchTerm(SearchInputManager.searchInput);
    }, []);

    useEffect(() => {
        const newUsersToInviteDict = {};

        const inviteOptions = OptionsListUtils.getMemberInviteOptions(props.personalDetails, betas, searchTerm, excludedUsers);

        // Update selectedOptions with the latest personalDetails information
        const detailsMap = {};
        _.forEach(inviteOptions.personalDetails, (detail) => (detailsMap[detail.login] = OptionsListUtils.formatMemberForList(detail, false)));
        const newSelectedOptions = [];
        _.forEach(selectedOptions, (option) => {
            newSelectedOptions.push(_.has(detailsMap, option.login) ? {...detailsMap[option.login], isSelected: true} : option);
        });

        const userToInvite = inviteOptions.userToInvite;

        // Only add the user to the invites list if it is valid
        if (userToInvite) {
            newUsersToInviteDict[userToInvite.accountID] = userToInvite;
        }

        setUsersToInvite(_.values(newUsersToInviteDict));
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
        if (usersToInvite.length === 0 && CONST.EXPENSIFY_EMAILS.includes(searchValue)) {
            return translate('messages.errorMessageInvalidEmail');
        }
        if (usersToInvite.length === 0 && excludedUsers.includes(OptionsListUtils.addSMSDomainIfPhoneNumber(searchValue).toLowerCase())) {
            return translate('messages.userIsAlreadyMember', {login: searchValue, name});
        }
        return OptionsListUtils.getHeaderMessage(personalDetails.length !== 0, usersToInvite.length > 0, searchValue);
    }, [excludedUsers, translate, searchTerm, usersToInvite, personalDetails.length, name]);

    return (
        <SelectionList
            canSelectMultiple
            sections={sections}
            textInputLabel={translate('optionsSelector.nameEmailOrPhoneNumber')}
            textInputValue={searchTerm}
            onChangeText={setSearchTerm}
            headerMessage={headerMessage}
            onSelectRow={toggleOption}
            onConfirm={inviteUsers}
            showScrollIndicator
            shouldPreventDefaultFocusOnSelectRow={!Browser.isMobile()}
            showLoadingPlaceholder={!didScreenTransitionEnd || !OptionsListUtils.isPersonalDetailsReady(personalDetails)}
        />
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
