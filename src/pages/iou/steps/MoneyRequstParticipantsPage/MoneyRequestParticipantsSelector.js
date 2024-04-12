import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import _ from 'underscore';
import Button from '@components/Button';
import FormHelpMessage from '@components/FormHelpMessage';
import {usePersonalDetails} from '@components/OnyxProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import {PressableWithFeedback} from '@components/Pressable';
import ReferralProgramCTA from '@components/ReferralProgramCTA';
import SelectCircle from '@components/SelectCircle';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/UserListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useDismissedReferralBanners from '@hooks/useDismissedReferralBanners';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePermissions from '@hooks/usePermissions';
import useSearchTermAndSearch from '@hooks/useSearchTermAndSearch';
import useThemeStyles from '@hooks/useThemeStyles';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    /** Callback to request parent modal to go to next step, which should be request */
    navigateToRequest: PropTypes.func.isRequired,

    /** Callback to request parent modal to go to next step, which should be split */
    navigateToSplit: PropTypes.func.isRequired,

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

    /** The type of IOU report, i.e. bill, request, send */
    iouType: PropTypes.string.isRequired,

    /** Whether the money request is a distance request or not */
    isDistanceRequest: PropTypes.bool,

    /** Whether the screen transition has ended */
    didScreenTransitionEnd: PropTypes.bool,
};

const defaultProps = {
    participants: [],
    isDistanceRequest: false,
    didScreenTransitionEnd: false,
};

function MoneyRequestParticipantsSelector({participants, navigateToRequest, navigateToSplit, onAddParticipants, iouType, isDistanceRequest, didScreenTransitionEnd}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const referralContentType = iouType === CONST.IOU.TYPE.SEND ? CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SEND_MONEY : CONST.REFERRAL_PROGRAM.CONTENT_TYPES.MONEY_REQUEST;
    const {isOffline} = useNetwork();
    const personalDetails = usePersonalDetails();
    const {options, areOptionsInitialized} = useOptionsList({shouldInitialize: didScreenTransitionEnd});
    const {canUseP2PDistanceRequests} = usePermissions(iouType);

    const maxParticipantsReached = participants.length === CONST.REPORT.MAXIMUM_PARTICIPANTS;
    const setSearchTermAndSearchInServer = useSearchTermAndSearch(setSearchTerm, maxParticipantsReached);

    const offlineMessage = isOffline ? [`${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}`, {isTranslated: true}] : '';

    const newChatOptions = useMemo(() => {
        const chatOptions = OptionsListUtils.getFilteredOptions(
            options.reports,
            options.personalDetails,
            betas,
            debouncedSearchTerm,
            participants,
            CONST.EXPENSIFY_EMAILS,

            // If we are using this component in the "Request money" flow then we pass the includeOwnedWorkspaceChats argument so that the current user
            // sees the option to request money from their admin on their own Workspace Chat.
            iouType === CONST.IOU.TYPE.REQUEST,

            canUseP2PDistanceRequests || !isDistanceRequest,
            false,
            {},
            [],
            false,
            {},
            [],
            // We don't want the user to be able to invite individuals when they are in the "Distance request" flow for now.
            // This functionality is being built here: https://github.com/Expensify/App/issues/23291
            canUseP2PDistanceRequests || !isDistanceRequest,
            true,
        );
        return {
            recentReports: chatOptions.recentReports,
            personalDetails: chatOptions.personalDetails,
            userToInvite: chatOptions.userToInvite,
        };
    }, [options.reports, options.personalDetails, betas, debouncedSearchTerm, participants, iouType, canUseP2PDistanceRequests, isDistanceRequest]);

    /**
     * Returns the sections needed for the OptionsSelector
     *
     * @returns {Array}
     */
    const sections = useMemo(() => {
        const newSections = [];

        const formatResults = OptionsListUtils.formatSectionsFromSearchTerm(
            debouncedSearchTerm,
            participants,
            newChatOptions.recentReports,
            newChatOptions.personalDetails,
            maxParticipantsReached,
            personalDetails,
            true,
        );
        newSections.push(formatResults.section);

        if (maxParticipantsReached) {
            return newSections;
        }

        newSections.push({
            title: translate('common.recents'),
            data: newChatOptions.recentReports,
            shouldShow: !_.isEmpty(newChatOptions.recentReports),
        });

        newSections.push({
            title: translate('common.contacts'),
            data: newChatOptions.personalDetails,
            shouldShow: !_.isEmpty(newChatOptions.personalDetails),
        });

        if (newChatOptions.userToInvite && !OptionsListUtils.isCurrentUser(newChatOptions.userToInvite)) {
            newSections.push({
                title: undefined,
                data: _.map([newChatOptions.userToInvite], (participant) => {
                    const isPolicyExpenseChat = lodashGet(participant, 'isPolicyExpenseChat', false);
                    return isPolicyExpenseChat ? OptionsListUtils.getPolicyExpenseReportOption(participant) : OptionsListUtils.getParticipantsOption(participant, personalDetails);
                }),
                shouldShow: true,
            });
        }

        return newSections;
    }, [maxParticipantsReached, newChatOptions.personalDetails, newChatOptions.recentReports, newChatOptions.userToInvite, participants, personalDetails, debouncedSearchTerm, translate]);

    /**
     * Adds a single participant to the request
     *
     * @param {Object} option
     */
    const addSingleParticipant = useCallback(
        (option) => {
            if (participants.length) {
                return;
            }
            onAddParticipants(
                [
                    {
                        accountID: option.accountID,
                        login: option.login,
                        isPolicyExpenseChat: option.isPolicyExpenseChat,
                        reportID: option.reportID,
                        selected: true,
                        searchText: option.searchText,
                    },
                ],
                false,
            );
            navigateToRequest();
        },
        [navigateToRequest, onAddParticipants, participants.length],
    );

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

    const headerMessage = useMemo(
        () =>
            OptionsListUtils.getHeaderMessage(
                _.get(newChatOptions, 'personalDetails', []).length + _.get(newChatOptions, 'recentReports', []).length !== 0,
                Boolean(newChatOptions.userToInvite),
                debouncedSearchTerm.trim(),
                maxParticipantsReached,
                _.some(participants, (participant) => participant.searchText.toLowerCase().includes(debouncedSearchTerm.trim().toLowerCase())),
            ),
        [maxParticipantsReached, newChatOptions, participants, debouncedSearchTerm],
    );

    // Right now you can't split a request with a workspace and other additional participants
    // This is getting properly fixed in https://github.com/Expensify/App/issues/27508, but as a stop-gap to prevent
    // the app from crashing on native when you try to do this, we'll going to show error message if you have a workspace and other participants
    const hasPolicyExpenseChatParticipant = _.some(participants, (participant) => participant.isPolicyExpenseChat);
    const shouldShowSplitBillErrorMessage = participants.length > 1 && hasPolicyExpenseChatParticipant;

    // canUseP2PDistanceRequests is true if the iouType is track expense, but we don't want to allow splitting distance with track expense yet
    const isAllowedToSplit = (canUseP2PDistanceRequests || !isDistanceRequest) && (iouType !== CONST.IOU.TYPE.SEND || iouType !== CONST.IOU.TYPE.TRACK_EXPENSE);

    const handleConfirmSelection = useCallback(
        (keyEvent, option) => {
            const shouldAddSingleParticipant = option && !participants.length;

            if (shouldShowSplitBillErrorMessage || (!participants.length && !option)) {
                return;
            }

            if (shouldAddSingleParticipant) {
                addSingleParticipant(option);
                return;
            }

            navigateToSplit();
        },
        [shouldShowSplitBillErrorMessage, navigateToSplit, addSingleParticipant, participants.length],
    );

    const {isDismissed} = useDismissedReferralBanners({referralContentType});

    const footerContent = useMemo(() => {
        if (isDismissed && !shouldShowSplitBillErrorMessage && !participants.length) {
            return null;
        }
        return (
            <>
                {!isDismissed && (
                    <ReferralProgramCTA
                        referralContentType={referralContentType}
                        style={[styles.flexShrink0, !!participants.length && !shouldShowSplitBillErrorMessage && styles.mb5]}
                    />
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
                        large
                        isDisabled={shouldShowSplitBillErrorMessage}
                    />
                )}
            </>
        );
    }, [handleConfirmSelection, participants.length, isDismissed, referralContentType, shouldShowSplitBillErrorMessage, styles, translate]);

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
                        style={[styles.flexRow, styles.alignItemsCenter, styles.ml3]}
                    >
                        <SelectCircle isChecked={item.isSelected} />
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

    return (
        <SelectionList
            onConfirm={handleConfirmSelection}
            sections={sections}
            ListItem={UserListItem}
            textInputValue={searchTerm}
            textInputLabel={translate('optionsSelector.nameEmailOrPhoneNumber')}
            textInputHint={offlineMessage}
            onChangeText={setSearchTermAndSearchInServer}
            shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
            onSelectRow={addSingleParticipant}
            footerContent={footerContent}
            headerMessage={headerMessage}
            showLoadingPlaceholder={!areOptionsInitialized && !didScreenTransitionEnd}
            rightHandSideComponent={itemRightSideComponent}
        />
    );
}

MoneyRequestParticipantsSelector.propTypes = propTypes;
MoneyRequestParticipantsSelector.displayName = 'MoneyRequestParticipantsSelector';
MoneyRequestParticipantsSelector.defaultProps = defaultProps;

export default MoneyRequestParticipantsSelector;
