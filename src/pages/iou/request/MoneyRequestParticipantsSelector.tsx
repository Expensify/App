import {deepEqual} from 'fast-equals';
import lodashPick from 'lodash/pick';
import lodashReject from 'lodash/reject';
import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';
import type {GestureResponderEvent} from 'react-native';
import {InteractionManager} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import {RESULTS} from 'react-native-permissions';
import type {PermissionStatus} from 'react-native-permissions';
import Button from '@components/Button';
import ContactPermissionModal from '@components/ContactPermissionModal';
import EmptySelectionListContent from '@components/EmptySelectionListContent';
import FormHelpMessage from '@components/FormHelpMessage';
import {UserPlus} from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import {usePersonalDetails} from '@components/OnyxProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import ReferralProgramCTA from '@components/ReferralProgramCTA';
import SelectionList from '@components/SelectionList';
import InviteMemberListItem from '@components/SelectionList/InviteMemberListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useDismissedReferralBanners from '@hooks/useDismissedReferralBanners';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePolicy from '@hooks/usePolicy';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import useThemeStyles from '@hooks/useThemeStyles';
import contactImport from '@libs/ContactImport';
import type {ContactImportResult} from '@libs/ContactImport/types';
import useContactPermissions from '@libs/ContactPermission/useContactPermissions';
import getContacts from '@libs/ContactUtils';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import getPlatform from '@libs/getPlatform';
import goToSettings from '@libs/goToSettings';
import {isMovingTransactionFromTrackExpense} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {Option, SearchOption, Section} from '@libs/OptionsListUtils';
import {
    filterAndOrderOptions,
    formatSectionsFromSearchTerm,
    getHeaderMessage,
    getParticipantsOption,
    getPersonalDetailSearchTerms,
    getPolicyExpenseReportOption,
    getValidOptions,
    isCurrentUser,
    orderOptions,
} from '@libs/OptionsListUtils';
import {isPaidGroupPolicy as isPaidGroupPolicyUtil} from '@libs/PolicyUtils';
import type {OptionData} from '@libs/ReportUtils';
import {isInvoiceRoom} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {getInvoicePrimaryWorkspace} from '@userActions/Policy/Policy';
import {searchInServer} from '@userActions/Report';
import type {IOUAction, IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PersonalDetails} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import ImportContactButton from './ImportContactButton';

type MoneyRequestParticipantsSelectorProps = {
    /** Callback to request parent modal to go to next step, which should be split */
    onFinish?: (value?: string) => void;

    /** Callback to add participants in MoneyRequestModal */
    onParticipantsAdded: (value: Participant[]) => void;

    /** Selected participants from MoneyRequestModal with login */
    participants?: Participant[] | typeof CONST.EMPTY_ARRAY;

    /** The type of IOU report, i.e. split, request, send, track */
    iouType: IOUType;

    /** The action of the IOU, i.e. create, split, move */
    action: IOUAction;

    /** Whether this is a per diem expense request */
    isPerDiemRequest?: boolean;
};

function MoneyRequestParticipantsSelector({
    participants = CONST.EMPTY_ARRAY,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onFinish = (_value?: string) => {},
    onParticipantsAdded,
    iouType,
    action,
    isPerDiemRequest = false,
}: MoneyRequestParticipantsSelectorProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [betas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: true});
    const [contactPermissionState, setContactPermissionState] = useState<PermissionStatus>(RESULTS.UNAVAILABLE);
    const platform = getPlatform();
    const isNative = platform === CONST.PLATFORM.ANDROID || platform === CONST.PLATFORM.IOS;
    const showImportContacts = isNative && !(contactPermissionState === RESULTS.GRANTED || contactPermissionState === RESULTS.LIMITED);
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const referralContentType = CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE;
    const {isOffline} = useNetwork();
    const personalDetails = usePersonalDetails();
    const {isDismissed} = useDismissedReferralBanners({referralContentType});
    const {didScreenTransitionEnd} = useScreenWrapperTransitionStatus();
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const policy = usePolicy(activePolicyID);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {canBeMissing: true, initWithStoredValues: false});
    const [currentUserLogin] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true, selector: (session) => session?.email});
    const {options, areOptionsInitialized, initializeOptions} = useOptionsList({
        shouldInitialize: didScreenTransitionEnd,
    });
    const [contacts, setContacts] = useState<Array<SearchOption<PersonalDetails>>>([]);
    const [textInputAutoFocus, setTextInputAutoFocus] = useState<boolean>(!isNative);
    const cleanSearchTerm = useMemo(() => debouncedSearchTerm.trim().toLowerCase(), [debouncedSearchTerm]);
    const offlineMessage: string = isOffline ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : '';

    const isPaidGroupPolicy = useMemo(() => isPaidGroupPolicyUtil(policy), [policy]);
    const isIOUSplit = iouType === CONST.IOU.TYPE.SPLIT;
    const isCategorizeOrShareAction = [CONST.IOU.ACTION.CATEGORIZE, CONST.IOU.ACTION.SHARE].some((option) => option === action);
    const [tryNewDot] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT, {canBeMissing: true});
    const hasBeenAddedToNudgeMigration = !!tryNewDot?.nudgeMigration?.timestamp;

    const importAndSaveContacts = useCallback(() => {
        contactImport().then(({contactList, permissionStatus}: ContactImportResult) => {
            setContactPermissionState(permissionStatus);
            const usersFromContact = getContacts(contactList);
            setContacts(usersFromContact);
        });
    }, []);

    useEffect(() => {
        searchInServer(debouncedSearchTerm.trim());
    }, [debouncedSearchTerm]);

    useEffect(() => {
        // This is necessary to ensure the options list is always up to date
        // e.g. if the approver was changed in the policy, we need to update the options list
        initializeOptions();
    }, [initializeOptions]);

    useContactPermissions({
        importAndSaveContacts,
        setContacts,
        contactPermissionState,
        setContactPermissionState,
    });

    const defaultOptions = useMemo(() => {
        if (!areOptionsInitialized || !didScreenTransitionEnd) {
            return {
                userToInvite: null,
                recentReports: [],
                personalDetails: [],
                currentUserOption: null,
                headerMessage: '',
            };
        }

        const optionList = getValidOptions(
            {
                reports: options.reports,
                personalDetails: options.personalDetails.concat(contacts),
            },
            {
                betas,
                selectedOptions: participants as Participant[],
                excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,

                // If we are using this component in the "Submit expense" or the combined submit/track flow then we pass the includeOwnedWorkspaceChats argument so that the current user
                // sees the option to submit an expense from their admin on their own Expense Chat.
                includeOwnedWorkspaceChats: iouType === CONST.IOU.TYPE.SUBMIT || iouType === CONST.IOU.TYPE.CREATE || iouType === CONST.IOU.TYPE.SPLIT,

                // Sharing with an accountant involves inviting them to the workspace and that requires admin access.
                excludeNonAdminWorkspaces: action === CONST.IOU.ACTION.SHARE,

                // Per diem expenses should only be submitted to workspaces, not individual users
                includeP2P: !isCategorizeOrShareAction && !isPerDiemRequest,
                includeInvoiceRooms: iouType === CONST.IOU.TYPE.INVOICE,
                action,
                shouldSeparateSelfDMChat: iouType !== CONST.IOU.TYPE.INVOICE,
                shouldSeparateWorkspaceChat: true,
                includeSelfDM: !isMovingTransactionFromTrackExpense(action) && iouType !== CONST.IOU.TYPE.INVOICE,
                canShowManagerMcTest: !hasBeenAddedToNudgeMigration && action !== CONST.IOU.ACTION.SUBMIT,
                isPerDiemRequest,
            },
        );

        const orderedOptions = orderOptions(optionList);

        return {
            ...optionList,
            ...orderedOptions,
        };
    }, [
        action,
        contacts,
        areOptionsInitialized,
        betas,
        didScreenTransitionEnd,
        iouType,
        isCategorizeOrShareAction,
        options.personalDetails,
        options.reports,
        participants,
        isPerDiemRequest,
        hasBeenAddedToNudgeMigration,
    ]);

    const chatOptions = useMemo(() => {
        if (!areOptionsInitialized) {
            return {
                userToInvite: null,
                recentReports: [],
                personalDetails: [],
                currentUserOption: null,
                headerMessage: '',
                workspaceChats: [],
                selfDMChat: null,
            };
        }

        const newOptions = filterAndOrderOptions(defaultOptions, debouncedSearchTerm, {
            canInviteUser: !isCategorizeOrShareAction && !isPerDiemRequest,
            selectedOptions: participants as Participant[],
            excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
            preferPolicyExpenseChat: isPaidGroupPolicy,
            preferRecentExpenseReports: action === CONST.IOU.ACTION.CREATE,
        });
        return newOptions;
    }, [areOptionsInitialized, defaultOptions, debouncedSearchTerm, participants, isPaidGroupPolicy, isCategorizeOrShareAction, action, isPerDiemRequest]);

    const inputHelperText = useMemo(
        () =>
            getHeaderMessage(
                (chatOptions.personalDetails ?? []).length + (chatOptions.recentReports ?? []).length + (chatOptions.workspaceChats ?? []).length !== 0 ||
                    !isEmptyObject(chatOptions.selfDMChat),
                !!chatOptions?.userToInvite,
                debouncedSearchTerm.trim(),
                participants.some((participant) => getPersonalDetailSearchTerms(participant).join(' ').toLowerCase().includes(cleanSearchTerm)),
            ),
        [
            chatOptions.personalDetails,
            chatOptions.recentReports,
            chatOptions.selfDMChat,
            chatOptions?.userToInvite,
            chatOptions.workspaceChats,
            cleanSearchTerm,
            debouncedSearchTerm,
            participants,
        ],
    );
    /**
     * Returns the sections needed for the OptionsSelector
     * @returns {Array}
     */
    const [sections, header] = useMemo(() => {
        const newSections: Section[] = [];
        if (!areOptionsInitialized || !didScreenTransitionEnd) {
            return [newSections, ''];
        }

        const formatResults = formatSectionsFromSearchTerm(
            debouncedSearchTerm,
            participants.map((participant) => ({...participant, reportID: participant.reportID})) as OptionData[],
            chatOptions.recentReports,
            chatOptions.personalDetails,
            personalDetails,
            true,
        );

        newSections.push(formatResults.section);

        newSections.push({
            title: translate('workspace.common.workspace'),
            data: chatOptions.workspaceChats ?? [],
            shouldShow: (chatOptions.workspaceChats ?? []).length > 0,
        });

        newSections.push({
            title: translate('workspace.invoices.paymentMethods.personal'),
            data: chatOptions.selfDMChat ? [chatOptions.selfDMChat] : [],
            shouldShow: !!chatOptions.selfDMChat,
        });

        newSections.push({
            title: translate('common.recents'),
            data: isPerDiemRequest ? chatOptions.recentReports.filter((report) => report.isPolicyExpenseChat) : chatOptions.recentReports,
            shouldShow: (isPerDiemRequest ? chatOptions.recentReports.filter((report) => report.isPolicyExpenseChat) : chatOptions.recentReports).length > 0,
        });

        newSections.push({
            title: translate('common.contacts'),
            data: chatOptions.personalDetails,
            shouldShow: chatOptions.personalDetails.length > 0 && !isPerDiemRequest,
        });

        if (
            chatOptions.userToInvite &&
            !isCurrentUser({
                ...chatOptions.userToInvite,
                accountID: chatOptions.userToInvite?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                status: chatOptions.userToInvite?.status ?? undefined,
            }) &&
            !isPerDiemRequest
        ) {
            newSections.push({
                title: undefined,
                data: [chatOptions.userToInvite].map((participant) => {
                    const isPolicyExpenseChat = participant?.isPolicyExpenseChat ?? false;
                    return isPolicyExpenseChat ? getPolicyExpenseReportOption(participant) : getParticipantsOption(participant, personalDetails);
                }),
                shouldShow: true,
            });
        }

        let headerMessage = '';
        if (!showImportContacts) {
            headerMessage = inputHelperText;
        }

        return [newSections, headerMessage];
    }, [
        areOptionsInitialized,
        didScreenTransitionEnd,
        debouncedSearchTerm,
        participants,
        chatOptions.recentReports,
        chatOptions.personalDetails,
        chatOptions.selfDMChat,
        chatOptions.workspaceChats,
        chatOptions.userToInvite,
        personalDetails,
        translate,
        showImportContacts,
        inputHelperText,
        isPerDiemRequest,
    ]);

    /**
     * Adds a single participant to the expense
     *
     * @param {Object} option
     */
    const addSingleParticipant = useCallback(
        (option: Participant & Option) => {
            const newParticipants: Participant[] = [
                {
                    ...lodashPick(option, 'accountID', 'login', 'isPolicyExpenseChat', 'reportID', 'searchText', 'policyID', 'isSelfDM', 'text', 'phoneNumber'),
                    selected: true,
                    iouType,
                },
            ];

            if (iouType === CONST.IOU.TYPE.INVOICE) {
                const policyID = option.item && isInvoiceRoom(option.item) ? option.policyID : getInvoicePrimaryWorkspace(currentUserLogin)?.id;
                newParticipants.push({
                    policyID,
                    isSender: true,
                    selected: false,
                    iouType,
                });
            }

            onParticipantsAdded(newParticipants);

            if (!option.isSelfDM) {
                onFinish();
            }
        },
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- we don't want to trigger this callback when iouType changes
        [onFinish, onParticipantsAdded, currentUserLogin],
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
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- we don't want to trigger this callback when iouType changes
        [participants, onParticipantsAdded],
    );

    // Right now you can't split a request with a workspace and other additional participants
    // This is getting properly fixed in https://github.com/Expensify/App/issues/27508, but as a stop-gap to prevent
    // the app from crashing on native when you try to do this, we'll going to hide the button if you have a workspace and other participants
    const hasPolicyExpenseChatParticipant = participants.some((participant) => participant.isPolicyExpenseChat);
    const shouldShowSplitBillErrorMessage = participants.length > 1 && hasPolicyExpenseChatParticipant;

    const isAllowedToSplit =
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

    const showLoadingPlaceholder = useMemo(() => !areOptionsInitialized || !didScreenTransitionEnd, [areOptionsInitialized, didScreenTransitionEnd]);

    const optionLength = useMemo(() => {
        if (!areOptionsInitialized) {
            return 0;
        }
        let length = 0;
        sections.forEach((section) => {
            length += section.data.length;
        });
        return length;
    }, [areOptionsInitialized, sections]);

    const shouldShowListEmptyContent = useMemo(() => optionLength === 0 && !showLoadingPlaceholder, [optionLength, showLoadingPlaceholder]);

    const shouldShowReferralBanner = !isDismissed && iouType !== CONST.IOU.TYPE.INVOICE && !shouldShowListEmptyContent;

    const initiateContactImportAndSetState = useCallback(() => {
        setContactPermissionState(RESULTS.GRANTED);
        InteractionManager.runAfterInteractions(importAndSaveContacts);
    }, [importAndSaveContacts]);

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
                        message={translate('iou.error.splitExpenseMultipleParticipantsErrorMessage')}
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

    const onSelectRow = useCallback(
        (option: Participant) => {
            if (option.isPolicyExpenseChat && option.policyID && shouldRestrictUserBillableActions(option.policyID)) {
                Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(option.policyID));
                return;
            }

            if (isIOUSplit) {
                addParticipantToSelection(option);
                return;
            }

            addSingleParticipant(option);
        },
        [isIOUSplit, addParticipantToSelection, addSingleParticipant],
    );

    const footerContentAbovePaginationComponent = useMemo(() => {
        if (!showImportContacts) {
            return null;
        }
        return (
            <MenuItem
                title={translate('contact.importContacts')}
                icon={UserPlus}
                onPress={goToSettings}
                shouldShowRightIcon
                style={styles.mb3}
            />
        );
    }, [showImportContacts, styles.mb3, translate]);

    const ClickableImportContactTextComponent = useMemo(() => {
        if (debouncedSearchTerm.length || isSearchingForReports) {
            return;
        }
        return (
            <ImportContactButton
                showImportContacts={showImportContacts}
                inputHelperText={translate('contact.importContactsTitle')}
                isInSearch={false}
            />
        );
    }, [debouncedSearchTerm, isSearchingForReports, showImportContacts, translate]);
    const EmptySelectionListContentWithPermission = useMemo(() => {
        return (
            <>
                {ClickableImportContactTextComponent}
                <EmptySelectionListContent contentType={iouType} />;
            </>
        );
    }, [iouType, ClickableImportContactTextComponent]);

    return (
        <>
            <ContactPermissionModal
                onGrant={initiateContactImportAndSetState}
                onDeny={setContactPermissionState}
                onFocusTextInput={() => setTextInputAutoFocus(true)}
            />
            <SelectionList
                onConfirm={handleConfirmSelection}
                sections={areOptionsInitialized ? sections : CONST.EMPTY_ARRAY}
                ListItem={InviteMemberListItem}
                textInputValue={searchTerm}
                textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')}
                textInputHint={offlineMessage}
                onChangeText={setSearchTerm}
                shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                onSelectRow={onSelectRow}
                shouldSingleExecuteRowSelect
                headerContent={
                    <ImportContactButton
                        showImportContacts={showImportContacts}
                        inputHelperText={inputHelperText}
                        isInSearch
                    />
                }
                footerContent={footerContent}
                listEmptyContent={EmptySelectionListContentWithPermission}
                footerContentAbovePagination={footerContentAbovePaginationComponent}
                headerMessage={header}
                showLoadingPlaceholder={showLoadingPlaceholder}
                canSelectMultiple={isIOUSplit && isAllowedToSplit}
                isLoadingNewOptions={!!isSearchingForReports}
                shouldShowListEmptyContent={shouldShowListEmptyContent}
                textInputAutoFocus={textInputAutoFocus}
            />
        </>
    );
}

MoneyRequestParticipantsSelector.displayName = 'MoneyTemporaryForRefactorRequestParticipantsSelector';

export default memo(MoneyRequestParticipantsSelector, (prevProps, nextProps) => deepEqual(prevProps.participants, nextProps.participants) && prevProps.iouType === nextProps.iouType);
