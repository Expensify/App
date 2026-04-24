import lodashPick from 'lodash/pick';
import React, {useEffect} from 'react';
import type {Ref} from 'react';
import type {GestureResponderEvent} from 'react-native';
import {InteractionManager} from 'react-native';
import {RESULTS} from 'react-native-permissions';
import ContactPermissionModal from '@components/ContactPermissionModal';
import EmptySelectionListContent from '@components/EmptySelectionListContent';
import MenuItem from '@components/MenuItem';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import InviteMemberListItem from '@components/SelectionList/ListItem/InviteMemberListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {Section, SelectionListWithSectionsHandle} from '@components/SelectionList/SelectionListWithSections/types';
import useContactImport from '@hooks/useContactImport';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDismissedReferralBanners from '@hooks/useDismissedReferralBanners';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import usePrivateIsArchivedMap from '@hooks/usePrivateIsArchivedMap';
import useReportAttributes from '@hooks/useReportAttributes';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import useSearchSelector from '@hooks/useSearchSelector';
import useTransactionDraftValues from '@hooks/useTransactionDraftValues';
import useUserToInviteReports from '@hooks/useUserToInviteReports';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import goToSettings from '@libs/goToSettings';
import {isMovingTransactionFromTrackExpense} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {formatSectionsFromSearchTerm, getHeaderMessage, getParticipantsOption, getPolicyExpenseReportOption, isCurrentUser} from '@libs/OptionsListUtils';
import type {Option} from '@libs/OptionsListUtils';
import {doesPersonalDetailMatchSearchTerm} from '@libs/OptionsListUtils/searchMatchUtils';
import type {OptionWithKey} from '@libs/OptionsListUtils/types';
import {getActiveAdminWorkspaces, isPaidGroupPolicy as isPaidGroupPolicyUtil} from '@libs/PolicyUtils';
import type {OptionData} from '@libs/ReportUtils';
import {isInvoiceRoom} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {getInvoicePrimaryWorkspace} from '@userActions/Policy/Policy';
import {searchUserInServer} from '@userActions/Report';
import type {IOUAction, IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Participant} from '@src/types/onyx/IOU';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import ImportContactButton from './ImportContactButton';
import ParticipantSelectorFooter from './ParticipantSelectorFooter';

const sanitizedSelectedParticipant = (option: Option | OptionData, iouType: IOUType) => ({
    ...lodashPick(option, 'accountID', 'login', 'isPolicyExpenseChat', 'reportID', 'searchText', 'policyID', 'isSelfDM', 'text', 'phoneNumber', 'displayName'),
    selected: true,
    iouType,
});

type ParticipantSearchResultsProps = {
    /** The type of IOU report */
    iouType: IOUType;

    /** The IOU action (create, submit, share, categorize, etc.) */
    action: IOUAction;

    /** Selected participants */
    participants: Participant[] | typeof CONST.EMPTY_ARRAY;

    /** Whether the IOU is workspaces only */
    isWorkspacesOnly: boolean;

    /** Whether this is a per diem expense request */
    isPerDiemRequest: boolean;

    /** Whether this is a time expense request */
    isTimeRequest: boolean;

    /** Whether the platform is native (iOS/Android) */
    isNative: boolean;

    /** Whether this is a corporate card transaction */
    isCorporateCardTransaction: boolean;

    /** Forwarded ref for the SelectionList — used by the parent's useImperativeHandle */
    selectionListRef: Ref<SelectionListWithSectionsHandle | null>;

    /** Whether the text input should auto-focus */
    textInputAutoFocus: boolean;

    /** Setter to toggle textInputAutoFocus from the ContactPermissionModal */
    setTextInputAutoFocus: (value: boolean) => void;

    /** Callback to propagate selected participants to the parent flow */
    onParticipantsAdded: (value: Participant[]) => void;

    /** Callback to advance the parent flow */
    onFinish: (value?: string, participants?: Participant[]) => void;
};

function ParticipantSearchResults({
    iouType,
    action,
    participants,
    isWorkspacesOnly,
    isPerDiemRequest,
    isTimeRequest,
    isNative,
    isCorporateCardTransaction,
    selectionListRef,
    textInputAutoFocus,
    setTextInputAutoFocus,
    onParticipantsAdded,
    onFinish,
}: ParticipantSearchResultsProps) {
    const isIOUSplit = iouType === CONST.IOU.TYPE.SPLIT;
    const isCategorizeOrShareAction = action === CONST.IOU.ACTION.CATEGORIZE || action === CONST.IOU.ACTION.SHARE;
    const isAllowedToSplit =
        iouType !== CONST.IOU.TYPE.PAY &&
        iouType !== CONST.IOU.TYPE.TRACK &&
        iouType !== CONST.IOU.TYPE.INVOICE &&
        action !== CONST.IOU.ACTION.SHARE &&
        action !== CONST.IOU.ACTION.SUBMIT &&
        action !== CONST.IOU.ACTION.CATEGORIZE;
    const icons = useMemoizedLazyExpensifyIcons(['UserPlus']);
    const {translate} = useLocalize();
    const {contactPermissionState, contacts, setContactPermissionState, importAndSaveContacts} = useContactImport();
    const {isOffline} = useNetwork();
    const personalDetails = usePersonalDetails();
    const {didScreenTransitionEnd} = useScreenWrapperTransitionStatus();
    const [isSearchingForReports] = useOnyx(ONYXKEYS.RAM_ONLY_IS_SEARCHING_FOR_REPORTS);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserEmail = currentUserPersonalDetails.email ?? '';
    const currentUserAccountID = currentUserPersonalDetails.accountID;
    const currentUserLogin = currentUserPersonalDetails.login;
    const reportAttributesDerived = useReportAttributes();
    const privateIsArchivedMap = usePrivateIsArchivedMap();

    // Policy and billing data — owned here, used for getValidOptionsConfig and billing gate in onSelectRow
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`];
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [hasBeenAddedToNudgeMigration] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT, {
        selector: (tryNewDot) => !!tryNewDot?.nudgeMigration?.timestamp,
    });
    const {isRestrictedToPreferredPolicy, preferredPolicyID} = usePreferredPolicy();
    const optimisticTransactions = useTransactionDraftValues();

    const {isDismissed: isDismissedReferralBanner} = useDismissedReferralBanners({referralContentType: CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE});

    const isPaidGroupPolicy = isPaidGroupPolicyUtil(policy);
    const activeAdminWorkspaces = getActiveAdminWorkspaces(allPolicies, currentUserLogin);

    // This is necessary to prevent showing the Manager McTest when there are multiple transactions being created
    const hasMultipleTransactions = optimisticTransactions.length > 1;
    const canShowManagerMcTest = !hasBeenAddedToNudgeMigration && action !== CONST.IOU.ACTION.SUBMIT && !hasMultipleTransactions;

    const getValidOptionsConfig = {
        selectedOptions: participants as Participant[],
        excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
        includeOwnedWorkspaceChats: iouType === CONST.IOU.TYPE.SUBMIT || iouType === CONST.IOU.TYPE.CREATE || iouType === CONST.IOU.TYPE.SPLIT || iouType === CONST.IOU.TYPE.TRACK,
        excludeNonAdminWorkspaces: action === CONST.IOU.ACTION.SHARE,
        includeP2P: !isCategorizeOrShareAction && !isPerDiemRequest && !isTimeRequest && !isCorporateCardTransaction,
        includeInvoiceRooms: iouType === CONST.IOU.TYPE.INVOICE,
        action,
        shouldSeparateSelfDMChat: iouType !== CONST.IOU.TYPE.INVOICE,
        shouldSeparateWorkspaceChat: true,
        includeSelfDM: !isMovingTransactionFromTrackExpense(action) && iouType !== CONST.IOU.TYPE.INVOICE,
        canShowManagerMcTest,
        isPerDiemRequest,
        isTimeRequest,
        showRBR: false,
        preferPolicyExpenseChat: isPaidGroupPolicy,
        preferRecentExpenseReports: action === CONST.IOU.ACTION.CREATE,
        isRestrictedToPreferredPolicy,
        preferredPolicyID,
    };

    /**
     * Adds a single participant to the expense
     */
    const addSingleParticipant = (option: Participant & Option) => {
        const newParticipants: Participant[] = [sanitizedSelectedParticipant(option, iouType)];

        if (iouType === CONST.IOU.TYPE.INVOICE) {
            const policyID = option.item && isInvoiceRoom(option.item) ? option.policyID : getInvoicePrimaryWorkspace(policy, activeAdminWorkspaces)?.id;
            newParticipants.push({
                policyID,
                isSender: true,
                selected: false,
                iouType,
            });
        }

        onParticipantsAdded(newParticipants);

        if (!option.isSelfDM) {
            onFinish(undefined, newParticipants);
        }
    };

    const offlineMessage: string = isOffline ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : '';

    const handleSelectionChange = (options: OptionData[]) => {
        if (!isIOUSplit) {
            return;
        }
        const sanitizedParticipants: Participant[] = options.map((option) => sanitizedSelectedParticipant(option, iouType));
        onParticipantsAdded(sanitizedParticipants);
    };

    const {searchTerm, debouncedSearchTerm, setSearchTerm, availableOptions, selectedOptions, toggleSelection, areOptionsInitialized, onListEndReached, contactState} = useSearchSelector({
        selectionMode: isIOUSplit ? CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI : CONST.SEARCH_SELECTOR.SELECTION_MODE_SINGLE,
        searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
        includeUserToInvite: !isCategorizeOrShareAction && !isPerDiemRequest && !isTimeRequest,
        excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
        includeRecentReports: true,
        maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
        getValidOptionsConfig,
        shouldInitialize: didScreenTransitionEnd,
        enablePhoneContacts: isNative,
        contactOptions: contacts,
        initialSelected: participants as OptionData[],
        onSelectionChange: handleSelectionChange,
        onSingleSelect: (option: OptionData) => {
            if (isIOUSplit) {
                return;
            }
            addSingleParticipant(option);
        },
    });

    const cleanSearchTerm = debouncedSearchTerm.trim().toLowerCase();

    const {userToInviteExpenseReport} = useUserToInviteReports(availableOptions?.userToInvite);
    const userToInviteExpenseReportPolicy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${userToInviteExpenseReport?.policyID}`];

    useEffect(() => {
        searchUserInServer(debouncedSearchTerm.trim());
    }, [debouncedSearchTerm]);

    const hasListOptions = (availableOptions.personalDetails?.length ?? 0) + (availableOptions.recentReports?.length ?? 0) + (availableOptions.workspaceChats?.length ?? 0) > 0;
    const hasAvailableOptions = hasListOptions || !isEmptyObject(availableOptions.selfDMChat);

    const inputHelperText = getHeaderMessage(
        hasAvailableOptions,
        !!availableOptions?.userToInvite,
        debouncedSearchTerm.trim(),
        countryCode,
        participants.some((participant) => doesPersonalDetailMatchSearchTerm(participant, currentUserAccountID, cleanSearchTerm)),
    );

    const showImportContacts =
        isNative &&
        !isCategorizeOrShareAction &&
        !(contactPermissionState === RESULTS.GRANTED || contactPermissionState === RESULTS.LIMITED) &&
        inputHelperText === translate('common.noResultsFound');

    /**
     * Returns the sections needed for the OptionsSelector
     * @returns {Array}
     */
    const sections: Array<Section<OptionWithKey>> = [];
    let header = '';
    if (areOptionsInitialized && didScreenTransitionEnd) {
        const formatResults = formatSectionsFromSearchTerm(
            searchTerm,
            participants.map((participant) => ({...participant, reportID: participant.reportID})) as OptionData[],
            [],
            [],
            privateIsArchivedMap,
            currentUserAccountID,
            allPolicies,
            personalDetails,
            true,
            undefined,
            reportAttributesDerived,
        );
        sections.push({...formatResults.section, sectionIndex: 0});

        if ((availableOptions.workspaceChats ?? []).length > 0) {
            sections.push({
                title: translate('workspace.common.workspace'),
                data: availableOptions.workspaceChats ?? [],
                sectionIndex: 1,
            });
        }

        if (availableOptions.selfDMChat) {
            sections.push({
                title: translate('workspace.invoices.paymentMethods.personal'),
                data: availableOptions.selfDMChat ? [availableOptions.selfDMChat] : [],
                sectionIndex: 2,
            });
        }

        if (!isWorkspacesOnly) {
            const shouldFilterRecentReportsToWorkspaceOnly = isPerDiemRequest || isTimeRequest;
            const recentReports = shouldFilterRecentReportsToWorkspaceOnly ? availableOptions.recentReports.filter((report) => report.isPolicyExpenseChat) : availableOptions.recentReports;
            if (recentReports.length > 0) {
                sections.push({
                    title: translate('common.recents'),
                    data: recentReports,
                    sectionIndex: 3,
                });
            }

            if (availableOptions.personalDetails.length > 0 && !isPerDiemRequest && !isTimeRequest) {
                sections.push({
                    title: translate('common.contacts'),
                    data: availableOptions.personalDetails,
                    sectionIndex: 4,
                });
            }
        }

        if (
            !isWorkspacesOnly &&
            availableOptions.userToInvite &&
            !isCurrentUser(
                {
                    ...availableOptions.userToInvite,
                    accountID: availableOptions.userToInvite?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                    status: availableOptions.userToInvite?.status ?? undefined,
                },
                loginList,
                currentUserEmail,
            ) &&
            !isPerDiemRequest &&
            !isTimeRequest
        ) {
            sections.push({
                title: undefined,
                data: [availableOptions.userToInvite].map((participant) => {
                    const isPolicyExpenseChat = participant?.isPolicyExpenseChat ?? false;
                    const privateIsArchived = privateIsArchivedMap[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${userToInviteExpenseReport?.reportID}`];
                    return isPolicyExpenseChat
                        ? getPolicyExpenseReportOption(participant, privateIsArchived, personalDetails, userToInviteExpenseReport, userToInviteExpenseReportPolicy, reportAttributesDerived)
                        : getParticipantsOption(participant, personalDetails);
                }),
                sectionIndex: 5,
            });
        }

        if (!showImportContacts) {
            header = inputHelperText ?? '';
        }
    }

    /**
     * Removes a selected option from list if already selected. If not already selected add this option to the list.
     * @param option
     */
    const addParticipantToSelection = (option: Participant) => {
        toggleSelection(option as OptionData);
    };

    // Right now you can't split a request with a workspace and other additional participants
    // This is getting properly fixed in https://github.com/Expensify/App/issues/27508, but as a stop-gap to prevent
    // the app from crashing on native when you try to do this, we'll going to hide the button if you have a workspace and other participants
    const hasPolicyExpenseChatParticipant = selectedOptions.some((participant) => participant.isPolicyExpenseChat);
    const shouldShowSplitBillErrorMessage = selectedOptions.length > 1 && hasPolicyExpenseChatParticipant;

    const handleConfirmSelection = (keyEvent?: GestureResponderEvent | KeyboardEvent, option?: Participant) => {
        const shouldAddSingleParticipant = option && !selectedOptions.length;
        if (shouldShowSplitBillErrorMessage || (!selectedOptions.length && !option)) {
            return;
        }

        if (shouldAddSingleParticipant) {
            addSingleParticipant(option);
            return;
        }

        onFinish(CONST.IOU.TYPE.SPLIT);
    };

    const shouldShowLoadingPlaceholder = !areOptionsInitialized || !didScreenTransitionEnd;

    let optionLength = 0;
    if (areOptionsInitialized) {
        for (const section of sections) {
            optionLength += section.data.length;
        }
    }

    const shouldShowListEmptyContent = optionLength === 0 && !shouldShowLoadingPlaceholder;

    const initiateContactImportAndSetState = () => {
        setContactPermissionState(RESULTS.GRANTED);
        // `InteractionManager.runAfterInteractions` is marked deprecated in RN types but remains the
        // supported primitive for deferring work until native animations/gestures settle. No
        // replacement exists in the RN API we can migrate to today.
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(importAndSaveContacts);
    };

    const footerContent =
        isDismissedReferralBanner && !shouldShowSplitBillErrorMessage && !selectedOptions.length ? undefined : (
            <ParticipantSelectorFooter
                iouType={iouType}
                isCategorizeOrShareAction={isCategorizeOrShareAction}
                selectedOptionsLength={selectedOptions.length}
                shouldShowSplitBillErrorMessage={shouldShowSplitBillErrorMessage}
                shouldShowListEmptyContent={shouldShowListEmptyContent}
                isDismissedReferralBanner={isDismissedReferralBanner}
                onConfirmSelection={handleConfirmSelection}
                onNewWorkspace={() => onFinish()}
            />
        );

    const onSelectRow = (option: Participant) => {
        if (option.isPolicyExpenseChat && option.policyID && shouldRestrictUserBillableActions(option.policyID, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed)) {
            Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(option.policyID));
            return;
        }

        if (isIOUSplit) {
            addParticipantToSelection(option);
            return;
        }

        addSingleParticipant(option);
    };

    const shouldShowImportContactsButton = contactState?.showImportUI ?? showImportContacts;
    const importContactsButtonComponent = shouldShowImportContactsButton ? (
        <MenuItem
            title={translate('contact.importContacts')}
            icon={icons.UserPlus}
            onPress={goToSettings}
            shouldShowRightIcon
            sentryLabel={CONST.SENTRY_LABEL.MONEY_REQUEST.PARTICIPANTS_IMPORT_CONTACTS_ITEM}
        />
    ) : null;

    const ClickableImportContactTextComponent =
        !searchTerm.length && !isSearchingForReports ? (
            <ImportContactButton
                showImportContacts={contactState?.showImportUI ?? showImportContacts}
                inputHelperText={translate('contact.importContactsTitle')}
                isInSearch={false}
            />
        ) : undefined;

    const EmptySelectionListContentWithPermission = (
        <>
            {ClickableImportContactTextComponent}
            <EmptySelectionListContent contentType={iouType} />
        </>
    );

    const textInputOptions = {
        value: searchTerm,
        label: translate('selectionList.nameEmailOrPhoneNumber'),
        hint: offlineMessage,
        onChangeText: setSearchTerm,
        disableAutoFocus: !textInputAutoFocus,
        headerMessage: header,
    };

    return (
        <>
            <ContactPermissionModal
                onGrant={contactState?.importContacts ?? initiateContactImportAndSetState}
                onDeny={contactState?.setContactPermissionState ?? setContactPermissionState}
                onFocusTextInput={() => {
                    setTextInputAutoFocus(true);
                }}
            />
            <SelectionListWithSections
                confirmButtonOptions={{
                    onConfirm: handleConfirmSelection,
                }}
                sections={sections}
                ListItem={InviteMemberListItem}
                textInputOptions={textInputOptions}
                shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                onSelectRow={onSelectRow}
                shouldSingleExecuteRowSelect
                canShowProductTrainingTooltip={canShowManagerMcTest}
                customListHeaderContent={importContactsButtonComponent}
                customHeaderContent={
                    <ImportContactButton
                        showImportContacts={contactState?.showImportUI ?? showImportContacts}
                        inputHelperText={inputHelperText}
                        isInSearch
                    />
                }
                footerContent={footerContent}
                listEmptyContent={EmptySelectionListContentWithPermission}
                shouldShowLoadingPlaceholder={shouldShowLoadingPlaceholder}
                shouldShowTextInput
                canSelectMultiple={isIOUSplit && isAllowedToSplit}
                isLoadingNewOptions={!!isSearchingForReports}
                shouldShowListEmptyContent={shouldShowListEmptyContent}
                ref={selectionListRef}
                onEndReached={onListEndReached}
                onEndReachedThreshold={0.75}
            />
        </>
    );
}

export default ParticipantSearchResults;
export {sanitizedSelectedParticipant};
export type {ParticipantSearchResultsProps};
