import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../../../ONYXKEYS';
import styles from '../../../../styles/styles';
import OptionsSelector from '../../../../components/OptionsSelector';
import * as OptionsListUtils from '../../../../libs/OptionsListUtils';
import * as ReportUtils from '../../../../libs/ReportUtils';
import CONST from '../../../../CONST';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import compose from '../../../../libs/compose';
import personalDetailsPropType from '../../../personalDetailsPropType';
import * as Browser from '../../../../libs/Browser';
import reportPropTypes from '../../../reportPropTypes';

const propTypes = {
    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** Callback to inform parent modal of success */
    onStepComplete: PropTypes.func.isRequired,

    /** Callback to add participants in MoneyRequestModal */
    onAddParticipants: PropTypes.func.isRequired,

    /** Selected participants from MoneyRequestModal with login */
    participants: PropTypes.arrayOf(
        PropTypes.shape({
            accountID: PropTypes.number,
            login: PropTypes.string,
            isPolicyExpenseChat: PropTypes.bool,
            isOwnPolicyExpenseChat: PropTypes.bool,
            selected: PropTypes.bool,
        }),
    ),

    /** All of the personal details for everyone */
    personalDetails: PropTypes.objectOf(personalDetailsPropType),

    /** All reports shared with the user */
    reports: PropTypes.objectOf(reportPropTypes),

    /** padding bottom style of safe area */
    safeAreaPaddingBottomStyle: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    ...withLocalizePropTypes,
};

const defaultProps = {
    participants: [],
    betas: [],
    personalDetails: {},
    reports: {},
    safeAreaPaddingBottomStyle: {},
};

function MoneyRequestParticipantsSplitSelector({betas, participants, personalDetails, reports, translate, onAddParticipants, onStepComplete, safeAreaPaddingBottomStyle}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [newChatOptions, setNewChatOptions] = useState({
        recentReports: [],
        personalDetails: [],
        userToInvite: null,
    });

    const maxParticipantsReached = participants.length === CONST.REPORT.MAXIMUM_PARTICIPANTS;

    /**
     * Returns the sections needed for the OptionsSelector
     *
     * @param {Boolean} maxParticipantsReached
     * @returns {Array}
     */
    const sections = useMemo(() => {
        const newSections = [];
        let indexOffset = 0;

        newSections.push({
            title: undefined,
            data: OptionsListUtils.getParticipantsOptions(participants, personalDetails),
            shouldShow: true,
            indexOffset,
        });
        indexOffset += participants.length;

        if (maxParticipantsReached) {
            return newSections;
        }

        newSections.push({
            title: translate('common.recents'),
            data: newChatOptions.recentReports,
            shouldShow: !_.isEmpty(newChatOptions.recentReports),
            indexOffset,
        });
        indexOffset += newChatOptions.recentReports.length;

        newSections.push({
            title: translate('common.contacts'),
            data: newChatOptions.personalDetails,
            shouldShow: !_.isEmpty(newChatOptions.personalDetails),
            indexOffset,
        });
        indexOffset += newChatOptions.personalDetails.length;

        if (newChatOptions.userToInvite && !OptionsListUtils.isCurrentUser(newChatOptions.userToInvite)) {
            newSections.push({
                undefined,
                data: [newChatOptions.userToInvite],
                shouldShow: true,
                indexOffset,
            });
        }

        return newSections;
    }, [maxParticipantsReached, newChatOptions, participants, personalDetails, translate]);

    /**
     * Removes a selected option from list if already selected. If not already selected add this option to the list.
     * @param {Object} option
     */
    const toggleOption = useCallback(
        (option) => {
            const isOptionInList = _.some(participants, (selectedOption) => selectedOption.accountID === option.accountID);

            let newSelectedOptions;

            if (isOptionInList) {
                newSelectedOptions = _.reject(participants, (selectedOption) => selectedOption.accountID === option.accountID);
            } else {
                newSelectedOptions = [...participants, {accountID: option.accountID, login: option.login, selected: true, searchText: option.searchText}];
            }

            onAddParticipants(newSelectedOptions);

            const chatOptions = OptionsListUtils.getNewChatOptions(reports, personalDetails, betas, isOptionInList ? searchTerm : '', newSelectedOptions, CONST.EXPENSIFY_EMAILS);

            setNewChatOptions({
                recentReports: chatOptions.recentReports,
                personalDetails: chatOptions.personalDetails,
                userToInvite: chatOptions.userToInvite,
            });
        },
        [searchTerm, participants, onAddParticipants, reports, personalDetails, betas, setNewChatOptions],
    );

    const headerMessage = OptionsListUtils.getHeaderMessage(
        newChatOptions.personalDetails.length + newChatOptions.recentReports.length !== 0,
        Boolean(newChatOptions.userToInvite),
        searchTerm,
        maxParticipantsReached,
        _.some(participants, (participant) => participant.searchText.toLowerCase().includes(searchTerm.toLowerCase())),
    );
    const isOptionsDataReady = ReportUtils.isReportDataReady() && OptionsListUtils.isPersonalDetailsReady(personalDetails);

    useEffect(() => {
        const chatOptions = OptionsListUtils.getNewChatOptions(reports, personalDetails, betas, searchTerm, participants, CONST.EXPENSIFY_EMAILS);
        setNewChatOptions({
            recentReports: chatOptions.recentReports,
            personalDetails: chatOptions.personalDetails,
            userToInvite: chatOptions.userToInvite,
        });
    }, [betas, reports, participants, personalDetails, translate, searchTerm, setNewChatOptions]);

    return (
        <View style={[styles.flex1, styles.w100, participants.length > 0 ? safeAreaPaddingBottomStyle : {}]}>
            <OptionsSelector
                canSelectMultipleOptions
                sections={sections}
                selectedOptions={participants}
                value={searchTerm}
                onSelectRow={toggleOption}
                onChangeText={setSearchTerm}
                headerMessage={headerMessage}
                boldStyle
                shouldShowConfirmButton
                confirmButtonText={translate('common.next')}
                onConfirmSelection={onStepComplete}
                textInputLabel={translate('optionsSelector.nameEmailOrPhoneNumber')}
                safeAreaPaddingBottomStyle={safeAreaPaddingBottomStyle}
                shouldShowOptions={isOptionsDataReady}
                shouldFocusOnSelectRow={!Browser.isMobile()}
            />
        </View>
    );
}

MoneyRequestParticipantsSplitSelector.propTypes = propTypes;
MoneyRequestParticipantsSplitSelector.defaultProps = defaultProps;
MoneyRequestParticipantsSplitSelector.displayName = 'MoneyRequestParticipantsSplitSelector';

export default compose(
    withLocalize,
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
        reports: {
            key: ONYXKEYS.COLLECTION.REPORT,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
)(MoneyRequestParticipantsSplitSelector);
