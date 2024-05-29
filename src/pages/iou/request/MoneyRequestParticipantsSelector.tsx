import lodashIsEqual from 'lodash/isEqual';
import lodashPick from 'lodash/pick';
import lodashReject from 'lodash/reject';
import React, {memo, useCallback, useEffect, useMemo} from 'react';
import type {GestureResponderEvent} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import FormHelpMessage from '@components/FormHelpMessage';
import {usePersonalDetails} from '@components/OnyxProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import ReferralProgramCTA from '@components/ReferralProgramCTA';
import SelectionList from '@components/SelectionList';
import InviteMemberListItem from '@components/SelectionList/InviteMemberListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useDismissedReferralBanners from '@hooks/useDismissedReferralBanners';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePermissions from '@hooks/usePermissions';
import useScreenWrapperTranstionStatus from '@hooks/useScreenWrapperTransitionStatus';
import useThemeStyles from '@hooks/useThemeStyles';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import type {MaybePhraseKey} from '@libs/Localize';
import type {Options} from '@libs/OptionsListUtils';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as Policy from '@userActions/Policy/Policy';
import * as Report from '@userActions/Report';
import type {IOUAction, IOURequestType, IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Participant} from '@src/types/onyx/IOU';

type MoneyRequestParticipantsSelectorProps = {
    /** Callback to request parent modal to go to next step, which should be split */
    onFinish: (value?: string) => void;

    /** Callback to add participants in MoneyRequestModal */
    onParticipantsAdded: (value: Participant[]) => void;
    /** Selected participants from MoneyRequestModal with login */
    participants?: Participant[];

    /** The type of IOU report, i.e. split, request, send, track */
    iouType: IOUType;

    /** The expense type, ie. manual, scan, distance */
    iouRequestType: IOURequestType;

    /** The action of the IOU, i.e. create, split, move */
    action: IOUAction;
};

function MoneyRequestParticipantsSelector({participants = [], onFinish, onParticipantsAdded, iouType, iouRequestType, action}: MoneyRequestParticipantsSelectorProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const referralContentType = iouType === CONST.IOU.TYPE.PAY ? CONST.REFERRAL_PROGRAM.CONTENT_TYPES.PAY_SOMEONE : CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE;
    const {isOffline} = useNetwork();
    const personalDetails = usePersonalDetails();
    const {isDismissed} = useDismissedReferralBanners({referralContentType});
    const {canUseP2PDistanceRequests} = usePermissions();
    const {didScreenTransitionEnd} = useScreenWrapperTranstionStatus();
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false});
    const {options, areOptionsInitialized} = useOptionsList({
        shouldInitialize: didScreenTransitionEnd,
    });

    const offlineMessage: MaybePhraseKey = isOffline ? [`${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}`, {isTranslated: true}] : '';

    const isIOUSplit = iouType === CONST.IOU.TYPE.SPLIT;
    const isCategorizeOrShareAction = [CONST.IOU.ACTION.CATEGORIZE, CONST.IOU.ACTION.SHARE].some((option) => option === action);

    const shouldShowReferralBanner = !isDismissed && iouType !== CONST.IOU.TYPE.INVOICE;

    useEffect(() => {
        Report.searchInServer(debouncedSearchTerm.trim());
    }, [debouncedSearchTerm]);

    /**
     * Returns the sections needed for the SelectionList
     *
     * @returns {Array}
     */
    const [sections, newChatOptions] = useMemo(() => {
        const newSections: OptionsListUtils.CategorySection[] = [];
        if (!areOptionsInitialized || !didScreenTransitionEnd) {
            return [newSections, {}];
        }
        const chatOptions = OptionsListUtils.getFilteredOptions(
            options.reports,
            options.personalDetails,
            betas,
            debouncedSearchTerm,
            participants,
            CONST.EXPENSIFY_EMAILS,

            // If we are using this component in the "Submit expense" flow then we pass the includeOwnedWorkspaceChats argument so that the current user
            // sees the option to submit an expense from their admin on their own Workspace Chat.
            (iouType === CONST.IOU.TYPE.SUBMIT || iouType === CONST.IOU.TYPE.SPLIT) && action !== CONST.IOU.ACTION.SUBMIT,

            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            (canUseP2PDistanceRequests || iouRequestType !== CONST.IOU.REQUEST_TYPE.DISTANCE) && !isCategorizeOrShareAction,
            false,
            {},
            [],
            false,
            {},
            [],
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            (canUseP2PDistanceRequests || iouRequestType !== CONST.IOU.REQUEST_TYPE.DISTANCE) && !isCategorizeOrShareAction,
            false,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            !isCategorizeOrShareAction,
            isCategorizeOrShareAction ? 0 : undefined,
        );

        const formatResults = OptionsListUtils.formatSectionsFromSearchTerm(
            debouncedSearchTerm,
            participants.map((participant) => ({...participant, reportID: participant.reportID ?? ''})),
            chatOptions.recentReports,
            chatOptions.personalDetails,
            personalDetails,
            true,
        );

        newSections.push(formatResults.section);

        newSections.push({
            title: translate('common.recents'),
            data: chatOptions.recentReports,
            shouldShow: chatOptions.recentReports.length > 0,
        });

        newSections.push({
            title: translate('common.contacts'),
            data: chatOptions.personalDetails,
            shouldShow: chatOptions.personalDetails.length > 0,
        });

        if (
            chatOptions.userToInvite &&
            !OptionsListUtils.isCurrentUser({...chatOptions.userToInvite, accountID: chatOptions.userToInvite?.accountID ?? -1, status: chatOptions.userToInvite?.status ?? undefined})
        ) {
            newSections.push({
                title: undefined,
                data: [chatOptions.userToInvite].map((participant) => {
                    const isPolicyExpenseChat = participant?.isPolicyExpenseChat ?? false;
                    return isPolicyExpenseChat ? OptionsListUtils.getPolicyExpenseReportOption(participant) : OptionsListUtils.getParticipantsOption(participant, personalDetails);
                }),
                shouldShow: true,
            });
        }

        return [newSections, chatOptions];
    }, [
        areOptionsInitialized,
        options.reports,
        options.personalDetails,
        betas,
        debouncedSearchTerm,
        participants,
        iouType,
        action,
        canUseP2PDistanceRequests,
        iouRequestType,
        personalDetails,
        translate,
        didScreenTransitionEnd,
        isCategorizeOrShareAction,
    ]);

    /**
     * Adds a single participant to the expense
     *
     * @param {Object} option
     */
    const addSingleParticipant = useCallback(
        (option: Participant) => {
            const newParticipants: Participant[] = [
                {
                    ...lodashPick(option, 'accountID', 'login', 'isPolicyExpenseChat', 'reportID', 'searchText', 'policyID'),
                    selected: true,
                    iouType,
                },
            ];

            if (iouType === CONST.IOU.TYPE.INVOICE) {
                const primaryPolicy = Policy.getPrimaryPolicy(activePolicyID);

                newParticipants.push({
                    policyID: primaryPolicy?.id,
                    isSender: true,
                    selected: false,
                    iouType,
                });
            }

            onParticipantsAdded(newParticipants);
            onFinish();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps -- we don't want to trigger this callback when iouType changes
        [onFinish, onParticipantsAdded],
    );

    /**
     * Removes a selected option from list if already selected. If not already selected add this option to the list.
     * @param {Object} option
     */
    const addParticipantToSelection = useCallback(
        (option: Participant) => {
            const isOptionSelected = (selectedOption: Participant) => {
                if (selectedOption.accountID && selectedOption.accountID === option?.accountID) {
                    return true;
                }

                if (selectedOption.reportID && selectedOption.reportID === option?.reportID) {
                    return true;
                }

                return false;
            };
            const isOptionInList = participants.some(isOptionSelected);
            let newSelectedOptions: Participant[];

            if (isOptionInList) {
                newSelectedOptions = lodashReject(participants, isOptionSelected);
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
                        iouType,
                    },
                ];
            }

            onParticipantsAdded(newSelectedOptions);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps -- we don't want to trigger this callback when iouType changes
        [participants, onParticipantsAdded],
    );

    const headerMessage = useMemo(
        () =>
            OptionsListUtils.getHeaderMessage(
                ((newChatOptions as Options)?.personalDetails ?? []).length + ((newChatOptions as Options)?.recentReports ?? []).length !== 0,
                Boolean((newChatOptions as Options)?.userToInvite),
                debouncedSearchTerm.trim(),
                participants.some((participant) => participant?.searchText?.toLowerCase().includes(debouncedSearchTerm.trim().toLowerCase())),
            ),
        [newChatOptions, participants, debouncedSearchTerm],
    );

    // Right now you can't split an expense with a workspace and other additional participants
    // This is getting properly fixed in https://github.com/Expensify/App/issues/27508, but as a stop-gap to prevent
    // the app from crashing on native when you try to do this, we'll going to hide the button if you have a workspace and other participants
    const hasPolicyExpenseChatParticipant = participants.some((participant) => participant.isPolicyExpenseChat);
    const shouldShowSplitBillErrorMessage = participants.length > 1 && hasPolicyExpenseChatParticipant;

    // canUseP2PDistanceRequests is true if the iouType is track expense, but we don't want to allow splitting distance with track expense yet
    const isAllowedToSplit =
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        (canUseP2PDistanceRequests || iouRequestType !== CONST.IOU.REQUEST_TYPE.DISTANCE) &&
        ![CONST.IOU.TYPE.PAY, CONST.IOU.TYPE.TRACK, CONST.IOU.TYPE.INVOICE].some((option) => option === iouType) &&
        ![CONST.IOU.ACTION.SHARE, CONST.IOU.ACTION.SUBMIT, CONST.IOU.ACTION.CATEGORIZE].some((option) => option === action);

    const handleConfirmSelection = useCallback(
        (keyEvent?: GestureResponderEvent | KeyboardEvent, option?: Participant) => {
            const shouldAddSingleParticipant = option && !participants.length;
            if (shouldShowSplitBillErrorMessage || (!participants.length && !option)) {
                return;
            }

            if (shouldAddSingleParticipant) {
                addSingleParticipant(option);
                return;
            }

            onFinish(CONST.IOU.TYPE.SPLIT);
        },
        [shouldShowSplitBillErrorMessage, onFinish, addSingleParticipant, participants],
    );

    const footerContent = useMemo(() => {
        if (isDismissed && !shouldShowSplitBillErrorMessage && !participants.length) {
            return;
        }

        return (
            <>
                {shouldShowReferralBanner && !isCategorizeOrShareAction && (
                    <ReferralProgramCTA
                        referralContentType={referralContentType}
                        style={[styles.flexShrink0, !!participants.length && !shouldShowSplitBillErrorMessage && styles.mb5]}
                    />
                )}

                {shouldShowSplitBillErrorMessage && (
                    <FormHelpMessage
                        style={[styles.ph1, styles.mb2]}
                        isError
                        message="iou.error.splitExpenseMultipleParticipantsErrorMessage"
                    />
                )}

                {!!participants.length && !isCategorizeOrShareAction && (
                    <Button
                        success
                        text={translate('common.next')}
                        onPress={handleConfirmSelection}
                        pressOnEnter
                        large
                        isDisabled={shouldShowSplitBillErrorMessage}
                    />
                )}
                {isCategorizeOrShareAction && (
                    <Button
                        success
                        text={translate('workspace.new.newWorkspace')}
                        onPress={() => onFinish()}
                        pressOnEnter
                        large
                    />
                )}
            </>
        );
    }, [
        handleConfirmSelection,
        participants.length,
        isDismissed,
        referralContentType,
        shouldShowSplitBillErrorMessage,
        styles,
        translate,
        shouldShowReferralBanner,
        isCategorizeOrShareAction,
        onFinish,
    ]);

    return (
        <SelectionList
            onConfirm={handleConfirmSelection}
            sections={areOptionsInitialized ? sections : CONST.EMPTY_ARRAY}
            ListItem={InviteMemberListItem}
            textInputValue={searchTerm}
            textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')}
            textInputHint={offlineMessage}
            onChangeText={setSearchTerm}
            shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
            onSelectRow={(item) => (isIOUSplit ? addParticipantToSelection(item) : addSingleParticipant(item))}
            shouldDebounceRowSelect
            footerContent={footerContent}
            headerMessage={headerMessage}
            showLoadingPlaceholder={!areOptionsInitialized || !didScreenTransitionEnd}
            canSelectMultiple={isIOUSplit && isAllowedToSplit}
            isLoadingNewOptions={!!isSearchingForReports}
        />
    );
}

MoneyRequestParticipantsSelector.displayName = 'MoneyTemporaryForRefactorRequestParticipantsSelector';

export default memo(
    MoneyRequestParticipantsSelector,
    (prevProps, nextProps) =>
        lodashIsEqual(prevProps.participants, nextProps.participants) && prevProps.iouRequestType === nextProps.iouRequestType && prevProps.iouType === nextProps.iouType,
);
