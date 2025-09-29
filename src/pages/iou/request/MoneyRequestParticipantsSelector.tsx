import reportsSelector from '@selectors/Attributes';
import {emailSelector} from '@selectors/Session';
import {deepEqual} from 'fast-equals';
import lodashPick from 'lodash/pick';
import React, {memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import type {Ref} from 'react';
import type {GestureResponderEvent} from 'react-native';
import {InteractionManager} from 'react-native';
import {RESULTS} from 'react-native-permissions';
import Button from '@components/Button';
import ContactPermissionModal from '@components/ContactPermissionModal';
import EmptySelectionListContent from '@components/EmptySelectionListContent';
import FormHelpMessage from '@components/FormHelpMessage';
import {UserPlus} from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import ReferralProgramCTA from '@components/ReferralProgramCTA';
import SelectionList from '@components/SelectionListWithSections';
import InviteMemberListItem from '@components/SelectionListWithSections/InviteMemberListItem';
import type {SelectionListHandle} from '@components/SelectionListWithSections/types';
import useContactImport from '@hooks/useContactImport';
import useDismissedReferralBanners from '@hooks/useDismissedReferralBanners';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import useSearchSelector from '@hooks/useSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import getPlatform from '@libs/getPlatform';
import goToSettings from '@libs/goToSettings';
import {isMovingTransactionFromTrackExpense} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {Option, Section} from '@libs/OptionsListUtils';
import {formatSectionsFromSearchTerm, getHeaderMessage, getParticipantsOption, getPersonalDetailSearchTerms, getPolicyExpenseReportOption, isCurrentUser} from '@libs/OptionsListUtils';
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

    /** Reference to the outer element */
    ref?: Ref<InputFocusRef>;
};

type InputFocusRef = {
    focus?: () => void;
};

function MoneyRequestParticipantsSelector({
    participants = CONST.EMPTY_ARRAY,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onFinish = (_value?: string) => {},
    onParticipantsAdded,
    iouType,
    action,
    isPerDiemRequest = false,
    ref,
}: MoneyRequestParticipantsSelectorProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {contactPermissionState, contacts, setContactPermissionState, importAndSaveContacts} = useContactImport();
    const platform = getPlatform();
    const isNative = platform === CONST.PLATFORM.ANDROID || platform === CONST.PLATFORM.IOS;
    const showImportContacts = isNative && !(contactPermissionState === RESULTS.GRANTED || contactPermissionState === RESULTS.LIMITED);
    const referralContentType = CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE;
    const {isOffline} = useNetwork();
    const personalDetails = usePersonalDetails();
    const {isDismissed} = useDismissedReferralBanners({referralContentType});
    const {didScreenTransitionEnd} = useScreenWrapperTransitionStatus();
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const policy = usePolicy(activePolicyID);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {canBeMissing: true, initWithStoredValues: false});
    const [currentUserLogin] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true, selector: emailSelector});
    const [reportAttributesDerived] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {canBeMissing: true, selector: reportsSelector});

    const [textInputAutoFocus, setTextInputAutoFocus] = useState<boolean>(!isNative);
    const selectionListRef = useRef<SelectionListHandle | null>(null);
    const offlineMessage: string = isOffline ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : '';

    const isPaidGroupPolicy = useMemo(() => isPaidGroupPolicyUtil(policy), [policy]);
    const isIOUSplit = iouType === CONST.IOU.TYPE.SPLIT;
    const isCategorizeOrShareAction = [CONST.IOU.ACTION.CATEGORIZE, CONST.IOU.ACTION.SHARE].some((option) => option === action);
    const [tryNewDot] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT, {canBeMissing: true});
    const hasBeenAddedToNudgeMigration = !!tryNewDot?.nudgeMigration?.timestamp;
    const canShowManagerMcTest = useMemo(() => !hasBeenAddedToNudgeMigration && action !== CONST.IOU.ACTION.SUBMIT, [hasBeenAddedToNudgeMigration, action]);

    /**
     * Adds a single participant to the expense
     *
     * @param {Object} option
     */
    const addSingleParticipant = useCallback(
        (option: Participant & Option) => {
            const newParticipants: Participant[] = [
                {
                    ...lodashPick(option, 'accountID', 'login', 'isPolicyExpenseChat', 'reportID', 'searchText', 'policyID', 'isSelfDM', 'text', 'phoneNumber', 'displayName'),
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

    const getValidOptionsConfig = useMemo(
        () => ({
            selectedOptions: participants as Participant[],
            excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            includeOwnedWorkspaceChats: iouType === CONST.IOU.TYPE.SUBMIT || iouType === CONST.IOU.TYPE.CREATE || iouType === CONST.IOU.TYPE.SPLIT,
            excludeNonAdminWorkspaces: action === CONST.IOU.ACTION.SHARE,
            includeP2P: !isCategorizeOrShareAction && !isPerDiemRequest,
            includeInvoiceRooms: iouType === CONST.IOU.TYPE.INVOICE,
            action,
            shouldSeparateSelfDMChat: iouType !== CONST.IOU.TYPE.INVOICE,
            shouldSeparateWorkspaceChat: true,
            includeSelfDM: !isMovingTransactionFromTrackExpense(action) && iouType !== CONST.IOU.TYPE.INVOICE,
            canShowManagerMcTest,
            isPerDiemRequest,
            showRBR: false,
            preferPolicyExpenseChat: isPaidGroupPolicy,
            preferRecentExpenseReports: action === CONST.IOU.ACTION.CREATE,
        }),
        [participants, iouType, action, isCategorizeOrShareAction, isPerDiemRequest, canShowManagerMcTest, isPaidGroupPolicy],
    );

    const {searchTerm, setSearchTerm, availableOptions, selectedOptions, selectedOptionsForDisplay, toggleSelection, areOptionsInitialized, onListEndReached, contactState} =
        useSearchSelector({
            selectionMode: isIOUSplit ? CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI : CONST.SEARCH_SELECTOR.SELECTION_MODE_SINGLE,
            searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
            includeUserToInvite: !isCategorizeOrShareAction && !isPerDiemRequest,
            excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            includeRecentReports: true,
            maxResultsPerPage: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
            getValidOptionsConfig,
            shouldInitialize: didScreenTransitionEnd,
            enablePhoneContacts: isNative,
            contactOptions: contacts,
            initialSelected: participants as OptionData[],
            onSelectionChange: (options: OptionData[]) => {
                if (!isIOUSplit) {
                    return;
                }
                onParticipantsAdded(options);
            },
            onSingleSelect: (option: OptionData) => {
                if (isIOUSplit) {
                    return;
                }
                addSingleParticipant(option);
            },
        });

    const cleanSearchTerm = useMemo(() => searchTerm.trim().toLowerCase(), [searchTerm]);

    useEffect(() => {
        searchInServer(searchTerm.trim());
    }, [searchTerm]);

    const inputHelperText = useMemo(
        () =>
            getHeaderMessage(
                (availableOptions.personalDetails ?? []).length + (availableOptions.recentReports ?? []).length + (availableOptions.workspaceChats ?? []).length !== 0 ||
                    !isEmptyObject(availableOptions.selfDMChat),
                !!availableOptions?.userToInvite,
                searchTerm.trim(),
                selectedOptions.some((participant) => getPersonalDetailSearchTerms(participant).join(' ').toLowerCase().includes(cleanSearchTerm)),
            ),
        [
            availableOptions.personalDetails,
            availableOptions.recentReports,
            availableOptions.selfDMChat,
            availableOptions?.userToInvite,
            availableOptions.workspaceChats,
            cleanSearchTerm,
            searchTerm,
            selectedOptions,
        ],
    );
    /**
     * Returns the sections needed for the OptionsSelector
     * @returns {Array}
     */
    const [sections, header] = useMemo(() => {
        const newSections: Section[] = [];
        if (!areOptionsInitialized) {
            return [newSections, ''];
        }

        // Selected options section (for multi-select mode)
        if (isIOUSplit && selectedOptionsForDisplay.length > 0) {
            const formatResults = formatSectionsFromSearchTerm(searchTerm, selectedOptionsForDisplay, [], [], personalDetails, true, undefined, reportAttributesDerived);
            newSections.push(formatResults.section);
        }

        newSections.push({
            title: translate('workspace.common.workspace'),
            data: availableOptions.workspaceChats ?? [],
            shouldShow: (availableOptions.workspaceChats ?? []).length > 0,
        });

        newSections.push({
            title: translate('workspace.invoices.paymentMethods.personal'),
            data: availableOptions.selfDMChat ? [availableOptions.selfDMChat] : [],
            shouldShow: !!availableOptions.selfDMChat,
        });

        newSections.push({
            title: translate('common.recents'),
            data: isPerDiemRequest ? availableOptions.recentReports.filter((report) => report.isPolicyExpenseChat) : availableOptions.recentReports,
            shouldShow: (isPerDiemRequest ? availableOptions.recentReports.filter((report) => report.isPolicyExpenseChat) : availableOptions.recentReports).length > 0,
        });

        newSections.push({
            title: translate('common.contacts'),
            data: availableOptions.personalDetails,
            shouldShow: availableOptions.personalDetails.length > 0 && !isPerDiemRequest,
        });

        if (
            availableOptions.userToInvite &&
            !isCurrentUser({
                ...availableOptions.userToInvite,
                accountID: availableOptions.userToInvite?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                status: availableOptions.userToInvite?.status ?? undefined,
            }) &&
            !isPerDiemRequest
        ) {
            newSections.push({
                title: undefined,
                data: [availableOptions.userToInvite].map((participant) => {
                    const isPolicyExpenseChat = participant?.isPolicyExpenseChat ?? false;
                    return isPolicyExpenseChat ? getPolicyExpenseReportOption(participant, reportAttributesDerived) : getParticipantsOption(participant, personalDetails);
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
        searchTerm,
        selectedOptionsForDisplay,
        availableOptions.recentReports,
        availableOptions.personalDetails,
        availableOptions.workspaceChats,
        availableOptions.selfDMChat,
        availableOptions.userToInvite,
        personalDetails,
        translate,
        isPerDiemRequest,
        showImportContacts,
        reportAttributesDerived,
        inputHelperText,
        isIOUSplit,
    ]);

    /**
     * Removes a selected option from list if already selected. If not already selected add this option to the list.
     * @param {Object} option
     */
    const addParticipantToSelection = useCallback(
        (option: Participant) => {
            toggleSelection(option as OptionData);
        },
        [toggleSelection],
    );

    // Right now you can't split a request with a workspace and other additional participants
    // This is getting properly fixed in https://github.com/Expensify/App/issues/27508, but as a stop-gap to prevent
    // the app from crashing on native when you try to do this, we'll going to hide the button if you have a workspace and other participants
    const hasPolicyExpenseChatParticipant = selectedOptions.some((participant) => participant.isPolicyExpenseChat);
    const shouldShowSplitBillErrorMessage = selectedOptions.length > 1 && hasPolicyExpenseChatParticipant;

    const isAllowedToSplit =
        ![CONST.IOU.TYPE.PAY, CONST.IOU.TYPE.TRACK, CONST.IOU.TYPE.INVOICE].some((option) => option === iouType) &&
        ![CONST.IOU.ACTION.SHARE, CONST.IOU.ACTION.SUBMIT, CONST.IOU.ACTION.CATEGORIZE].some((option) => option === action);

    const handleConfirmSelection = useCallback(
        (keyEvent?: GestureResponderEvent | KeyboardEvent, option?: Participant) => {
            const shouldAddSingleParticipant = option && !selectedOptions.length;
            if (shouldShowSplitBillErrorMessage || (!selectedOptions.length && !option)) {
                return;
            }

            if (shouldAddSingleParticipant) {
                addSingleParticipant(option);
                return;
            }

            onFinish(CONST.IOU.TYPE.SPLIT);
        },
        [shouldShowSplitBillErrorMessage, onFinish, addSingleParticipant, selectedOptions],
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
    }, [importAndSaveContacts, setContactPermissionState]);

    const footerContent = useMemo(() => {
        if (isDismissed && !shouldShowSplitBillErrorMessage && !selectedOptions.length) {
            return;
        }

        return (
            <>
                {shouldShowReferralBanner && !isCategorizeOrShareAction && (
                    <ReferralProgramCTA
                        referralContentType={referralContentType}
                        style={[styles.flexShrink0, !!selectedOptions.length && !shouldShowSplitBillErrorMessage && styles.mb5]}
                    />
                )}

                {shouldShowSplitBillErrorMessage && (
                    <FormHelpMessage
                        style={[styles.ph1, styles.mb2]}
                        isError
                        message={translate('iou.error.splitExpenseMultipleParticipantsErrorMessage')}
                    />
                )}

                {!!selectedOptions.length && !isCategorizeOrShareAction && (
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
        selectedOptions.length,
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
        const shouldShowImportContactsButton = contactState?.showImportUI ?? showImportContacts;
        if (!shouldShowImportContactsButton) {
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
    }, [contactState?.showImportUI, showImportContacts, styles.mb3, translate]);

    const ClickableImportContactTextComponent = useMemo(() => {
        if (searchTerm.length || isSearchingForReports) {
            return;
        }
        return (
            <ImportContactButton
                showImportContacts={contactState?.showImportUI ?? showImportContacts}
                inputHelperText={translate('contact.importContactsTitle')}
                isInSearch={false}
            />
        );
    }, [searchTerm, isSearchingForReports, contactState?.showImportUI, showImportContacts, translate]);
    const EmptySelectionListContentWithPermission = useMemo(() => {
        return (
            <>
                {ClickableImportContactTextComponent}
                <EmptySelectionListContent contentType={iouType} />
            </>
        );
    }, [iouType, ClickableImportContactTextComponent]);

    useImperativeHandle(ref, () => ({
        focus: () => {
            if (!textInputAutoFocus) {
                return;
            }
            selectionListRef.current?.focusTextInput?.();
        },
    }));

    return (
        <>
            <ContactPermissionModal
                onGrant={contactState?.importContacts ?? initiateContactImportAndSetState}
                onDeny={contactState?.setContactPermissionState ?? setContactPermissionState}
                onFocusTextInput={() => {
                    setTextInputAutoFocus(true);
                    selectionListRef.current?.focusTextInput?.();
                }}
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
                canShowProductTrainingTooltip={canShowManagerMcTest}
                headerContent={
                    <ImportContactButton
                        showImportContacts={contactState?.showImportUI ?? showImportContacts}
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
                textInputAutoFocus={!isNative}
                ref={selectionListRef}
                onEndReached={onListEndReached}
            />
        </>
    );
}

MoneyRequestParticipantsSelector.displayName = 'MoneyRequestParticipantsSelector';

export default memo(MoneyRequestParticipantsSelector, (prevProps, nextProps) => deepEqual(prevProps.participants, nextProps.participants) && prevProps.iouType === nextProps.iouType);
