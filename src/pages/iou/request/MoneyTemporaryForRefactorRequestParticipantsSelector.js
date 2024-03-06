import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import Button from '@components/Button';
import FormHelpMessage from '@components/FormHelpMessage';
import {usePersonalDetails} from '@components/OnyxProvider';
import {PressableWithFeedback} from '@components/Pressable';
import ReferralProgramCTA from '@components/ReferralProgramCTA';
import SelectCircle from '@components/SelectCircle';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/UserListItem';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useSearchTermAndSearch from '@hooks/useSearchTermAndSearch';
import useThemeStyles from '@hooks/useThemeStyles';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import reportPropTypes from '@pages/reportPropTypes';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** An object that holds data about which referral banners have been dismissed */
    dismissedReferralBanners: PropTypes.objectOf(PropTypes.bool),

    /** Callback to request parent modal to go to next step, which should be split */
    onFinish: PropTypes.func.isRequired,

    /** Callback to add participants in MoneyRequestModal */
    onParticipantsAdded: PropTypes.func.isRequired,

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

    /** All reports shared with the user */
    reports: PropTypes.objectOf(reportPropTypes),

    /** Padding bottom style of safe area */
    safeAreaPaddingBottomStyle: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    /** The type of IOU report, i.e. bill, request, send */
    iouType: PropTypes.oneOf(_.values(CONST.IOU.TYPE)).isRequired,

    /** The request type, ie. manual, scan, distance */
    iouRequestType: PropTypes.oneOf(_.values(CONST.IOU.REQUEST_TYPE)).isRequired,

    /** Whether the parent screen transition has ended */
    didScreenTransitionEnd: PropTypes.bool,
};

const defaultProps = {
    participants: [],
    safeAreaPaddingBottomStyle: {},
    reports: {},
    betas: [],
    dismissedReferralBanners: {},
    didScreenTransitionEnd: false,
};

function MoneyTemporaryForRefactorRequestParticipantsSelector({
    betas,
    participants,
    reports,
    onFinish,
    onParticipantsAdded,
    safeAreaPaddingBottomStyle,
    iouType,
    iouRequestType,
    dismissedReferralBanners,
    didScreenTransitionEnd,
}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [searchTerm, setSearchTerm] = useState('');
    const referralContentType = iouType === CONST.IOU.TYPE.SEND ? CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SEND_MONEY : CONST.REFERRAL_PROGRAM.CONTENT_TYPES.MONEY_REQUEST;
    const {isOffline} = useNetwork();
    const personalDetails = usePersonalDetails();

    const offlineMessage = isOffline ? [`${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}`, {isTranslated: true}] : '';

    const maxParticipantsReached = participants.length === CONST.REPORT.MAXIMUM_PARTICIPANTS;
    const setSearchTermAndSearchInServer = useSearchTermAndSearch(setSearchTerm, maxParticipantsReached);

    /**
     * Returns the sections needed for the OptionsSelector
     *
     * @returns {Array}
     */
    const [sections, newChatOptions] = useMemo(() => {
        const newSections = [];
        if (!didScreenTransitionEnd) {
            return [newSections, {}];
        }
        let indexOffset = 0;

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
            iouRequestType !== CONST.IOU.REQUEST_TYPE.DISTANCE,
            false,
            {},
            [],
            false,
            {},
            [],

            // We don't want the user to be able to invite individuals when they are in the "Distance request" flow for now.
            // This functionality is being built here: https://github.com/Expensify/App/issues/23291
            iouRequestType !== CONST.IOU.REQUEST_TYPE.DISTANCE,
            false,
        );

        const formatResults = OptionsListUtils.formatSectionsFromSearchTerm(
            searchTerm,
            participants,
            chatOptions.recentReports,
            chatOptions.personalDetails,
            maxParticipantsReached,
            indexOffset,
            personalDetails,
            true,
        );

        newSections.push(formatResults.section);
        indexOffset = formatResults.newIndexOffset;

        if (maxParticipantsReached) {
            return [newSections, {}];
        }

        newSections.push({
            title: translate('common.recents'),
            data: chatOptions.recentReports,
            shouldShow: !_.isEmpty(chatOptions.recentReports),
            indexOffset,
        });
        indexOffset += chatOptions.recentReports.length;

        newSections.push({
            title: translate('common.contacts'),
            data: chatOptions.personalDetails,
            shouldShow: !_.isEmpty(chatOptions.personalDetails),
            indexOffset,
        });
        indexOffset += chatOptions.personalDetails.length;

        if (chatOptions.userToInvite && !OptionsListUtils.isCurrentUser(chatOptions.userToInvite)) {
            newSections.push({
                title: undefined,
                data: _.map([chatOptions.userToInvite], (participant) => {
                    const isPolicyExpenseChat = lodashGet(participant, 'isPolicyExpenseChat', false);
                    return isPolicyExpenseChat ? OptionsListUtils.getPolicyExpenseReportOption(participant) : OptionsListUtils.getParticipantsOption(participant, personalDetails);
                }),
                shouldShow: true,
                indexOffset,
            });
        }

        return [newSections, chatOptions];
    }, [didScreenTransitionEnd, reports, personalDetails, betas, searchTerm, participants, iouType, iouRequestType, maxParticipantsReached, translate]);

    /**
     * Adds a single participant to the request
     *
     * @param {Object} option
     */
    const addSingleParticipant = (option) => {
        onParticipantsAdded([
            {
                ..._.pick(option, 'accountID', 'login', 'isPolicyExpenseChat', 'reportID', 'searchText'),
                selected: true,
            },
        ]);
        onFinish();
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

            onParticipantsAdded(newSelectedOptions, newSelectedOptions.length !== 0 ? CONST.IOU.TYPE.SPLIT : undefined);
        },
        [participants, onParticipantsAdded],
    );

    const headerMessage = useMemo(
        () =>
            OptionsListUtils.getHeaderMessage(
                _.get(newChatOptions, 'personalDetails', []).length + _.get(newChatOptions, 'recentReports', []).length !== 0,
                Boolean(newChatOptions.userToInvite),
                searchTerm.trim(),
                maxParticipantsReached,
                _.some(participants, (participant) => participant.searchText.toLowerCase().includes(searchTerm.trim().toLowerCase())),
            ),
        [maxParticipantsReached, newChatOptions, participants, searchTerm],
    );

    // Right now you can't split a request with a workspace and other additional participants
    // This is getting properly fixed in https://github.com/Expensify/App/issues/27508, but as a stop-gap to prevent
    // the app from crashing on native when you try to do this, we'll going to hide the button if you have a workspace and other participants
    const hasPolicyExpenseChatParticipant = _.some(participants, (participant) => participant.isPolicyExpenseChat);
    const shouldShowSplitBillErrorMessage = participants.length > 1 && hasPolicyExpenseChatParticipant;
    const isAllowedToSplit = iouRequestType !== CONST.IOU.REQUEST_TYPE.DISTANCE;

    const handleConfirmSelection = useCallback(() => {
        if (shouldShowSplitBillErrorMessage) {
            return;
        }

        onFinish(CONST.IOU.TYPE.SPLIT);
    }, [shouldShowSplitBillErrorMessage, onFinish]);

    const footerContent = useMemo(
        () => (
            <View>
                {!dismissedReferralBanners[referralContentType] && (
                    <View style={[styles.flexShrink0, !!participants.length && !shouldShowSplitBillErrorMessage && styles.pb5]}>
                        <ReferralProgramCTA referralContentType={referralContentType} />
                    </View>
                )}

                {shouldShowSplitBillErrorMessage && (
                    <FormHelpMessage
                        style={[styles.ph1, styles.mb2]}
                        isError
                        message="iou.error.splitBillMultipleParticipantsErrorMessage"
                    />
                )}

                {!!participants.length && (
                    <Button
                        success
                        text={translate('iou.addToSplit')}
                        onPress={handleConfirmSelection}
                        pressOnEnter
                        isDisabled={shouldShowSplitBillErrorMessage}
                    />
                )}
            </View>
        ),
        [handleConfirmSelection, participants.length, dismissedReferralBanners, referralContentType, shouldShowSplitBillErrorMessage, styles, translate],
    );

    const itemRightSideComponent = useCallback(
        (item) => {
            if (!isAllowedToSplit) {
                return null;
            }
            if (item.isSelected) {
                return (
                    <PressableWithFeedback
                        onPress={() => addParticipantToSelection(item)}
                        disabled={item.isDisabled}
                        role={CONST.ACCESSIBILITY_ROLE.CHECKBOX}
                        accessibilityLabel={CONST.ACCESSIBILITY_ROLE.CHECKBOX}
                        style={[styles.flexRow, styles.alignItemsCenter, styles.ml5, styles.optionSelectCircle]}
                    >
                        <SelectCircle
                            isChecked={item.isSelected}
                            selectCircleStyles={styles.ml0}
                        />
                    </PressableWithFeedback>
                );
            }

            return (
                <Button
                    onPress={() => addParticipantToSelection(item)}
                    style={[styles.pl2]}
                    text={translate('iou.split')}
                    small
                />
            );
        },
        [addParticipantToSelection, isAllowedToSplit, styles, translate],
    );

    const isOptionsDataReady = useMemo(() => ReportUtils.isReportDataReady() && OptionsListUtils.isPersonalDetailsReady(personalDetails), [personalDetails]);

    return (
        <View style={[styles.flex1, styles.w100, participants.length > 0 ? safeAreaPaddingBottomStyle : {}]}>
            <SelectionList
                onConfirm={handleConfirmSelection}
                sections={didScreenTransitionEnd && isOptionsDataReady ? sections : CONST.EMPTY_ARRAY}
                ListItem={UserListItem}
                textInputValue={searchTerm}
                textInputLabel={translate('optionsSelector.nameEmailOrPhoneNumber')}
                textInputHint={offlineMessage}
                onChangeText={setSearchTermAndSearchInServer}
                shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
                onSelectRow={addSingleParticipant}
                footerContent={footerContent}
                headerMessage={headerMessage}
                showLoadingPlaceholder={!(didScreenTransitionEnd && isOptionsDataReady)}
                rightHandSideComponent={itemRightSideComponent}
            />
        </View>
    );
}

MoneyTemporaryForRefactorRequestParticipantsSelector.propTypes = propTypes;
MoneyTemporaryForRefactorRequestParticipantsSelector.defaultProps = defaultProps;
MoneyTemporaryForRefactorRequestParticipantsSelector.displayName = 'MoneyTemporaryForRefactorRequestParticipantsSelector';

export default withOnyx({
    dismissedReferralBanners: {
        key: ONYXKEYS.ACCOUNT,
        selector: (data) => data.dismissedReferralBanners || {},
    },
    reports: {
        key: ONYXKEYS.COLLECTION.REPORT,
    },
    betas: {
        key: ONYXKEYS.BETAS,
    },
})(MoneyTemporaryForRefactorRequestParticipantsSelector);
