import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import Button from '@components/Button';
import FormHelpMessage from '@components/FormHelpMessage';
import OptionsSelector from '@components/OptionsSelector';
import refPropTypes from '@components/refPropTypes';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Report from '@libs/actions/Report';
import * as Browser from '@libs/Browser';
import compose from '@libs/compose';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import personalDetailsPropType from '@pages/personalDetailsPropType';
import reportPropTypes from '@pages/reportPropTypes';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** Callback to request parent modal to go to next step, which should be request */
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

    /** Whether we are searching for reports in the server */
    isSearchingForReports: PropTypes.bool,

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
    isSearchingForReports: false,
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
    isSearchingForReports,
}) {
    const styles = useThemeStyles();
    const [searchTerm, setSearchTerm] = useState('');
    const [newChatOptions, setNewChatOptions] = useState({
        recentReports: [],
        personalDetails: [],
        userToInvite: null,
    });
    const {isOffline} = useNetwork();

    const maxParticipantsReached = participants.length === CONST.REPORT.MAXIMUM_PARTICIPANTS;

    /**
     * Returns the sections needed for the OptionsSelector
     *
     * @returns {Array}
     */
    const sections = useMemo(() => {
        const newSections = [];
        let indexOffset = 0;

        const formatResults = OptionsListUtils.formatSectionsFromSearchTerm(
            searchTerm,
            participants,
            newChatOptions.recentReports,
            newChatOptions.personalDetails,
            personalDetails,
            true,
            indexOffset,
        );
        newSections.push(formatResults.section);
        indexOffset = formatResults.newIndexOffset;

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
                title: undefined,
                data: _.map([newChatOptions.userToInvite], (participant) => {
                    const isPolicyExpenseChat = lodashGet(participant, 'isPolicyExpenseChat', false);
                    return isPolicyExpenseChat ? OptionsListUtils.getPolicyExpenseReportOption(participant) : OptionsListUtils.getParticipantsOption(participant, personalDetails);
                }),
                shouldShow: true,
                indexOffset,
            });
        }

        return newSections;
    }, [maxParticipantsReached, newChatOptions, participants, personalDetails, translate, searchTerm]);

    /**
     * Adds a single participant to the request
     *
     * @param {Object} option
     */
    const addSingleParticipant = (option) => {
        onAddParticipants(
            [{accountID: option.accountID, login: option.login, isPolicyExpenseChat: option.isPolicyExpenseChat, reportID: option.reportID, selected: true, searchText: option.searchText}],
            false,
        );
        navigateToRequest();
    };

    /**
     * Removes a selected option from list if already selected. If not already selected add this option to the list.
     * @param {Object} option
     */
    const addParticipantToSelection = useCallback(
        (option) => {
            const isOptionSelected = (selectedOption) => {
                if (selectedOption.accountID && selectedOption.accountID === option.accountID) {
                    return true;
                }

                if (selectedOption.reportID && selectedOption.reportID === option.reportID) {
                    return true;
                }

                return false;
            };
            const isOptionInList = _.some(participants, isOptionSelected);
            let newSelectedOptions;

            if (isOptionInList) {
                newSelectedOptions = _.reject(participants, isOptionSelected);
            } else {
                newSelectedOptions = [
                    ...participants,
                    {
                        accountID: option.accountID,
                        login: option.login,
                        isPolicyExpenseChat: option.isPolicyExpenseChat,
                        reportID: option.reportID,
                        selected: true,
                        searchText: option.searchText,
                    },
                ];
            }
            onAddParticipants(newSelectedOptions, newSelectedOptions.length !== 0);
        },
        [participants, onAddParticipants],
    );

    const headerMessage = OptionsListUtils.getHeaderMessage(
        newChatOptions.personalDetails.length + newChatOptions.recentReports.length !== 0,
        Boolean(newChatOptions.userToInvite),
        searchTerm.trim(),
        maxParticipantsReached,
        _.some(participants, (participant) => participant.searchText.toLowerCase().includes(searchTerm.trim().toLowerCase())),
    );
    const isOptionsDataReady = ReportUtils.isReportDataReady() && OptionsListUtils.isPersonalDetailsReady(personalDetails);

    useEffect(() => {
        const chatOptions = OptionsListUtils.getFilteredOptions(
            reports,
            personalDetails,
            betas,
            searchTerm,
            participants,
            CONST.EXPENSIFY_EMAILS,

            // If we are using this component in the "Request money" flow then we pass the includeOwnedWorkspaceChats argument so that the current user
            // sees the option to request money from their admin on their own Workspace Chat.
            iouType === CONST.IOU.TYPE.REQUEST,

            // We don't want to include any P2P options like personal details or reports that are not workspace chats for certain features.
            !isDistanceRequest,
            false,
            {},
            [],
            false,
            {},
            [],
            // We don't want the user to be able to invite individuals when they are in the "Distance request" flow for now.
            // This functionality is being built here: https://github.com/Expensify/App/issues/23291
            !isDistanceRequest,
            true,
        );
        setNewChatOptions({
            recentReports: chatOptions.recentReports,
            personalDetails: chatOptions.personalDetails,
            userToInvite: chatOptions.userToInvite,
        });
    }, [betas, reports, participants, personalDetails, translate, searchTerm, setNewChatOptions, iouType, isDistanceRequest]);

    // When search term updates we will fetch any reports
    const setSearchTermAndSearchInServer = useCallback((text = '') => {
        Report.searchInServer(text);
        setSearchTerm(text);
    }, []);

    // Right now you can't split a request with a workspace and other additional participants
    // This is getting properly fixed in https://github.com/Expensify/App/issues/27508, but as a stop-gap to prevent
    // the app from crashing on native when you try to do this, we'll going to show error message if you have a workspace and other participants
    const hasPolicyExpenseChatParticipant = _.some(participants, (participant) => participant.isPolicyExpenseChat);
    const shouldShowSplitBillErrorMessage = participants.length > 1 && hasPolicyExpenseChatParticipant;
    const isAllowedToSplit = !isDistanceRequest && iouType !== CONST.IOU.TYPE.SEND;

    const handleConfirmSelection = useCallback(() => {
        if (shouldShowSplitBillErrorMessage) {
            return;
        }

        navigateToSplit();
    }, [shouldShowSplitBillErrorMessage, navigateToSplit]);

    const footerContent = (
        <View>
            {shouldShowSplitBillErrorMessage && (
                <FormHelpMessage
                    style={[styles.ph1, styles.mb2]}
                    isError
                    message="iou.error.splitBillMultipleParticipantsErrorMessage"
                />
            )}
            <Button
                success
                text={translate('iou.addToSplit')}
                onPress={handleConfirmSelection}
                pressOnEnter
                isDisabled={shouldShowSplitBillErrorMessage}
            />
        </View>
    );

    return (
        <View style={[styles.flex1, styles.w100, participants.length > 0 ? safeAreaPaddingBottomStyle : {}]}>
            <OptionsSelector
                canSelectMultipleOptions={isAllowedToSplit}
                shouldShowMultipleOptionSelectorAsButton
                multipleOptionSelectorButtonText={translate('iou.split')}
                onAddToSelection={addParticipantToSelection}
                sections={sections}
                selectedOptions={participants}
                value={searchTerm}
                onSelectRow={addSingleParticipant}
                onChangeText={setSearchTermAndSearchInServer}
                ref={forwardedRef}
                headerMessage={headerMessage}
                boldStyle
                shouldShowConfirmButton={isAllowedToSplit}
                onConfirmSelection={handleConfirmSelection}
                textInputLabel={translate('optionsSelector.nameEmailOrPhoneNumber')}
                textInputAlert={isOffline ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : ''}
                safeAreaPaddingBottomStyle={safeAreaPaddingBottomStyle}
                shouldShowOptions={isOptionsDataReady}
                shouldShowReferralCTA
                referralContentType={iouType === 'send' ? CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SEND_MONEY : CONST.REFERRAL_PROGRAM.CONTENT_TYPES.MONEY_REQUEST}
                shouldPreventDefaultFocusOnSelectRow={!Browser.isMobile()}
                shouldDelayFocus
                footerContent={isAllowedToSplit && footerContent}
                isLoadingNewOptions={isSearchingForReports}
            />
        </View>
    );
}

MoneyRequestParticipantsSelector.propTypes = propTypes;
MoneyRequestParticipantsSelector.defaultProps = defaultProps;
MoneyRequestParticipantsSelector.displayName = 'MoneyRequestParticipantsSelector';

const MoneyRequestParticipantsSelectorWithRef = React.forwardRef((props, ref) => (
    <MoneyRequestParticipantsSelector
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));

MoneyRequestParticipantsSelectorWithRef.displayName = 'MoneyRequestParticipantsSelectorWithRef';

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
        isSearchingForReports: {
            key: ONYXKEYS.IS_SEARCHING_FOR_REPORTS,
            initWithStoredValues: false,
        },
    }),
)(MoneyRequestParticipantsSelectorWithRef);
