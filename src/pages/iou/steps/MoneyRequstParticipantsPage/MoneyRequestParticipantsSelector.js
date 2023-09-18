import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../../../../ONYXKEYS';
import styles from '../../../../styles/styles';
import OptionsSelector from '../../../../components/OptionsSelector';
import * as OptionsListUtils from '../../../../libs/OptionsListUtils';
import * as ReportUtils from '../../../../libs/ReportUtils';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import * as Browser from '../../../../libs/Browser';
import compose from '../../../../libs/compose';
import CONST from '../../../../CONST';
import personalDetailsPropType from '../../../personalDetailsPropType';
import reportPropTypes from '../../../reportPropTypes';
import refPropTypes from '../../../../components/refPropTypes';

const propTypes = {
    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** Callback to request parent modal to go to next step, which should be split */
    navigateToRequest: PropTypes.func.isRequired,

    /** Callback to request parent modal to go to next step, which should be split */
    navigateToSplit: PropTypes.func.isRequired,

    /** A ref to forward to options selector's text input */
    forwardedRef: refPropTypes,

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

    /** The type of IOU report, i.e. bill, request, send */
    iouType: PropTypes.string.isRequired,

    /** Whether the money request is a distance request or not */
    isDistanceRequest: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    participants: [],
    forwardedRef: undefined,
    safeAreaPaddingBottomStyle: {},
    personalDetails: {},
    reports: {},
    betas: [],
    isDistanceRequest: false,
};

function MoneyRequestParticipantsSelector({
    forwardedRef,
    betas,
    participants,
    personalDetails,
    reports,
    translate,
    navigateToRequest,
    navigateToSplit,
    onAddParticipants,
    safeAreaPaddingBottomStyle,
    iouType,
    isDistanceRequest,
}) {
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
     * Adds a single participant to the request
     *
     * @param {Object} option
     */
    const addSingleParticipant = (option) => {
        onAddParticipants([{accountID: option.accountID, login: option.login, isPolicyExpenseChat: option.isPolicyExpenseChat, reportID: option.reportID, selected: true}]);
        navigateToRequest();
    };

    /**
     * Removes a selected option from list if already selected. If not already selected add this option to the list.
     * @param {Object} option
     */
    const addParticipantToSelection = useCallback(
        (option) => {
            const isOptionInList = _.some(participants, (selectedOption) => selectedOption.accountID === option.accountID);

            let newSelectedOptions;

            if (isOptionInList) {
                newSelectedOptions = _.reject(participants, (selectedOption) => selectedOption.accountID === option.accountID);
            } else {
                newSelectedOptions = [...participants, {accountID: option.accountID, login: option.login, selected: true}];
            }

            onAddParticipants(newSelectedOptions);

            const chatOptions = OptionsListUtils.getNewChatOptions(
                reports,
                personalDetails,
                betas,
                isOptionInList ? searchTerm : '',
                newSelectedOptions,
                CONST.EXPENSIFY_EMAILS,

                // If we are using this component in the "Request money" flow then we pass the includeOwnedWorkspaceChats argument so that the current user
                // sees the option to request money from their admin on their own Workspace Chat.
                iouType === CONST.IOU.MONEY_REQUEST_TYPE.REQUEST,

                // We don't want to include any P2P options like personal details or reports that are not workspace chats for certain features.
                !isDistanceRequest,
            );

            setNewChatOptions({
                recentReports: chatOptions.recentReports,
                personalDetails: chatOptions.personalDetails,
                userToInvite: chatOptions.userToInvite,
            });
        },
        [participants, onAddParticipants, reports, personalDetails, betas, searchTerm, iouType, isDistanceRequest],
    );

    const headerMessage = OptionsListUtils.getHeaderMessage(
        newChatOptions.personalDetails.length + newChatOptions.recentReports.length !== 0,
        Boolean(newChatOptions.userToInvite),
        searchTerm,
        maxParticipantsReached,
    );
    const isOptionsDataReady = ReportUtils.isReportDataReady() && OptionsListUtils.isPersonalDetailsReady(personalDetails);

    useEffect(() => {
        const chatOptions = OptionsListUtils.getNewChatOptions(
            reports,
            personalDetails,
            betas,
            searchTerm,
            participants,
            CONST.EXPENSIFY_EMAILS,

            // If we are using this component in the "Request money" flow then we pass the includeOwnedWorkspaceChats argument so that the current user
            // sees the option to request money from their admin on their own Workspace Chat.
            iouType === CONST.IOU.MONEY_REQUEST_TYPE.REQUEST,

            // We don't want to include any P2P options like personal details or reports that are not workspace chats for certain features.
            !isDistanceRequest,
        );
        setNewChatOptions({
            recentReports: chatOptions.recentReports,
            personalDetails: chatOptions.personalDetails,
            userToInvite: chatOptions.userToInvite,
        });
    }, [betas, reports, participants, personalDetails, translate, searchTerm, setNewChatOptions, iouType, isDistanceRequest]);

    return (
        <View style={[styles.flex1, styles.w100, participants.length > 0 ? safeAreaPaddingBottomStyle : {}]}>
            <OptionsSelector
                canSelectMultipleOptions
                shouldShowMultipleOptionSelectorAsButton
                multipleOptionSelectorButtonText={translate('iou.split')}
                onAddToSelection={addParticipantToSelection}
                sections={sections}
                selectedOptions={participants}
                value={searchTerm}
                onSelectRow={addSingleParticipant}
                onChangeText={setSearchTerm}
                ref={forwardedRef}
                headerMessage={headerMessage}
                boldStyle
                shouldShowConfirmButton
                confirmButtonText={translate('iou.addToSplit')}
                onConfirmSelection={navigateToSplit}
                textInputLabel={translate('optionsSelector.nameEmailOrPhoneNumber')}
                safeAreaPaddingBottomStyle={safeAreaPaddingBottomStyle}
                shouldShowOptions={isOptionsDataReady}
                shouldFocusOnSelectRow={!Browser.isMobile()}
                shouldDelayFocus
            />
        </View>
    );
}

MoneyRequestParticipantsSelector.propTypes = propTypes;
MoneyRequestParticipantsSelector.defaultProps = defaultProps;
MoneyRequestParticipantsSelector.displayName = 'MoneyRequestParticipantsSelector';

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
)(
    React.forwardRef((props, ref) => (
        <MoneyRequestParticipantsSelector
            /* eslint-disable-next-line react/jsx-props-no-spreading */
            {...props}
            forwardedRef={ref}
        />
    )),
);
