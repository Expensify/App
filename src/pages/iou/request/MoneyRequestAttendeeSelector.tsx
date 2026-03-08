import {deepEqual} from 'fast-equals';
import React, {memo, useEffect, useMemo} from 'react';
import type {GestureResponderEvent} from 'react-native';
import Button from '@components/Button';
import EmptySelectionListContent from '@components/EmptySelectionListContent';
import FormHelpMessage from '@components/FormHelpMessage';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import InviteMemberListItem from '@components/SelectionList/ListItem/InviteMemberListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {Section} from '@components/SelectionList/SelectionListWithSections/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useInitialSelectionRef from '@hooks/useInitialSelectionRef';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useReportAttributes from '@hooks/useReportAttributes';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import useSearchSelector from '@hooks/useSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';
import useUserToInviteReports from '@hooks/useUserToInviteReports';
import {searchUserInServer} from '@libs/actions/Report';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {
    filteredPersonalDetailsOfRecentReports,
    getFilteredRecentAttendees,
    getHeaderMessage,
    getParticipantsOption,
    getPersonalDetailSearchTerms,
    getPolicyExpenseReportOption,
    isCurrentUser,
    orderOptions,
} from '@libs/OptionsListUtils';
import {isPaidGroupPolicy as isPaidGroupPolicyFn} from '@libs/PolicyUtils';
import type {OptionData} from '@libs/ReportUtils';
import type {IOUAction, IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Attendee} from '@src/types/onyx/IOU';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import SafeString from '@src/utils/SafeString';
import {buildMoneyRequestAttendeeSections, getAttendeeOptionIdentifier, normalizeAttendeeToOption} from './MoneyRequestAttendeeSelectorUtils';

type MoneyRequestAttendeesSelectorProps = {
    /** Callback to request parent modal to go to next step, which should be split */
    onFinish: (value?: string) => void;

    /** Callback to add participants in MoneyRequestModal */
    onAttendeesAdded: (value: Attendee[]) => void;

    /** Selected participants from MoneyRequestModal with login */
    attendees?: Attendee[];

    /** The type of IOU report, i.e. split, request, send, track */
    iouType: IOUType;

    /** The action of the IOU, i.e. create, split, move */
    action: IOUAction;
};

function MoneyRequestAttendeeSelector({attendees = [], onFinish, onAttendeesAdded, iouType, action}: MoneyRequestAttendeesSelectorProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const personalDetails = usePersonalDetails();
    const {didScreenTransitionEnd} = useScreenWrapperTransitionStatus();
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [recentAttendees] = useOnyx(ONYXKEYS.NVP_RECENT_ATTENDEES);
    const policy = usePolicy(activePolicyID);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false});
    const reportAttributesDerived = useReportAttributes();
    const offlineMessage: string = isOffline ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : '';
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserEmail = currentUserPersonalDetails.email ?? '';
    const currentUserAccountID = currentUserPersonalDetails.accountID;
    const isPaidGroupPolicy = isPaidGroupPolicyFn(policy);
    const initialAttendeesSnapshot = useInitialSelectionRef(attendees, {resetOnFocus: true});
    const recentAttendeeLists = useMemo(
        () => getFilteredRecentAttendees(personalDetails, initialAttendeesSnapshot, recentAttendees ?? [], currentUserEmail, currentUserAccountID),
        [currentUserAccountID, currentUserEmail, initialAttendeesSnapshot, personalDetails, recentAttendees],
    );

    const initialSelectedOptions = useMemo(
        () => initialAttendeesSnapshot.map((attendee) => normalizeAttendeeToOption(attendee, personalDetails)),
        [initialAttendeesSnapshot, personalDetails],
    );
    const initialSelectedKeys = useMemo(() => initialSelectedOptions.map(getAttendeeOptionIdentifier).filter(Boolean), [initialSelectedOptions]);

    const {searchTerm, debouncedSearchTerm, setSearchTerm, searchOptions, selectedOptions, toggleSelection, areOptionsInitialized, onListEndReached} = useSearchSelector({
        selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
        searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_ATTENDEES,
        includeUserToInvite: true,
        excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
        includeRecentReports: false,
        includeCurrentUser: true,
        getValidOptionsConfig: {
            includeSelfDM: false,
            includeInvoiceRooms: false,
            action,
            recentAttendees: recentAttendeeLists,
        },
        initialSelected: initialSelectedOptions,
        prioritizeSelectedOnToggle: false,
        initialSelectedKeys,
        shouldInitialize: didScreenTransitionEnd,
        onSelectionChange: (newSelectedOptions) => {
            const newAttendees: Attendee[] = newSelectedOptions.map((option) => {
                const iconSource = option.icons?.[0]?.source;
                const icon = typeof iconSource === 'function' ? '' : SafeString(iconSource);
                return {
                    accountID: option.accountID ?? CONST.DEFAULT_NUMBER_ID,
                    login: option.login,
                    email: option.login ?? '',
                    displayName: option.displayName ?? option.text ?? option.login ?? '',
                    selected: true,
                    searchText: option.searchText,
                    avatarUrl: option.avatarUrl ?? icon,
                    iouType,
                };
            });
            onAttendeesAdded(newAttendees);
        },
        maxRecentReportsToShow: 5,
    });

    useEffect(() => {
        searchUserInServer(debouncedSearchTerm.trim());
    }, [debouncedSearchTerm]);

    const orderedSearchOptions = useMemo(() => {
        if (!isPaidGroupPolicy || !areOptionsInitialized) {
            return searchOptions;
        }

        const orderedOptions = orderOptions(
            {
                recentReports: searchOptions.recentReports,
                personalDetails: searchOptions.personalDetails,
                workspaceChats: searchOptions.workspaceChats ?? [],
            },
            searchTerm,
            {
                preferChatRoomsOverThreads: true,
                preferPolicyExpenseChat: !!action,
                preferRecentExpenseReports: action === CONST.IOU.ACTION.CREATE,
            },
        );

        return {
            ...searchOptions,
            recentReports: orderedOptions.recentReports,
            personalDetails: orderedOptions.personalDetails,
            workspaceChats: orderedOptions.workspaceChats,
        };
    }, [action, areOptionsInitialized, isPaidGroupPolicy, searchOptions, searchTerm]);
    const dedupedSearchOptions = useMemo(
        () => ({
            ...orderedSearchOptions,
            personalDetails: filteredPersonalDetailsOfRecentReports(orderedSearchOptions.recentReports, orderedSearchOptions.personalDetails),
        }),
        [orderedSearchOptions],
    );

    const {userToInviteExpenseReport, userToInviteChatReport} = useUserToInviteReports(dedupedSearchOptions?.userToInvite);

    const shouldShowErrorMessage = selectedOptions.length < 1;

    const handleConfirmSelection = (_keyEvent?: GestureResponderEvent | KeyboardEvent, option?: OptionData) => {
        if (shouldShowErrorMessage || (!selectedOptions.length && !option)) {
            return;
        }

        onFinish(CONST.IOU.TYPE.SUBMIT);
    };

    const shouldShowLoadingPlaceholder = !areOptionsInitialized || !didScreenTransitionEnd;

    const getFooterContent = () => {
        if (!shouldShowErrorMessage && !selectedOptions.length) {
            return;
        }

        return (
            <>
                {shouldShowErrorMessage && (
                    <FormHelpMessage
                        style={[styles.ph1, styles.mb2]}
                        isError
                        message={translate('iou.error.atLeastOneAttendee')}
                    />
                )}
                <Button
                    success
                    text={translate('common.save')}
                    onPress={handleConfirmSelection}
                    pressOnEnter
                    large
                    isDisabled={shouldShowErrorMessage}
                    sentryLabel={CONST.SENTRY_LABEL.MONEY_REQUEST.ATTENDEES_SAVE_BUTTON}
                />
            </>
        );
    };
    const footerContent = getFooterContent();

    const cleanSearchTerm = useMemo(() => searchTerm.trim().toLowerCase(), [searchTerm]);
    const hasInitializedSections = areOptionsInitialized && didScreenTransitionEnd;
    const userToInvite = useMemo(() => {
        if (
            !dedupedSearchOptions.userToInvite ||
            isCurrentUser(
                {
                    ...dedupedSearchOptions.userToInvite,
                    accountID: dedupedSearchOptions.userToInvite?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                    status: dedupedSearchOptions.userToInvite?.status ?? undefined,
                },
                loginList,
                currentUserEmail,
            )
        ) {
            return null;
        }

        const isPolicyExpenseChat = dedupedSearchOptions.userToInvite?.isPolicyExpenseChat ?? false;
        return isPolicyExpenseChat
            ? getPolicyExpenseReportOption(dedupedSearchOptions.userToInvite, currentUserAccountID, personalDetails, userToInviteExpenseReport, userToInviteChatReport, reportAttributesDerived)
            : getParticipantsOption(dedupedSearchOptions.userToInvite, personalDetails);
    }, [
        currentUserAccountID,
        currentUserEmail,
        loginList,
        dedupedSearchOptions.userToInvite,
        personalDetails,
        reportAttributesDerived,
        userToInviteChatReport,
        userToInviteExpenseReport,
    ]);

    const sections = useMemo(
        () =>
            buildMoneyRequestAttendeeSections({
                searchTerm: cleanSearchTerm,
                recentReports: dedupedSearchOptions.recentReports,
                personalDetails: dedupedSearchOptions.personalDetails,
                userToInvite,
                selectedOptions,
                initialSelectedOptions,
                areOptionsInitialized: hasInitializedSections,
                translate,
            }),
        [cleanSearchTerm, dedupedSearchOptions.personalDetails, dedupedSearchOptions.recentReports, hasInitializedSections, initialSelectedOptions, selectedOptions, translate, userToInvite],
    );

    const header = useMemo(() => {
        if (!hasInitializedSections) {
            return '';
        }

        return getHeaderMessage(
            sections.reduce((count, section) => count + section.data.length, 0) > 0,
            !!userToInvite,
            cleanSearchTerm,
            countryCode,
            attendees.some((attendee) => getPersonalDetailSearchTerms(attendee, currentUserAccountID).join(' ').toLowerCase().includes(cleanSearchTerm)),
        );
    }, [attendees, cleanSearchTerm, countryCode, currentUserAccountID, hasInitializedSections, sections, userToInvite]);

    const optionLength = useMemo(() => {
        if (!hasInitializedSections) {
            return 0;
        }

        return sections.reduce((acc, section) => acc + (section.data?.length ?? 0), 0);
    }, [hasInitializedSections, sections]);

    const shouldShowListEmptyContent = optionLength === 0 && !shouldShowLoadingPlaceholder;

    const textInputOptions = {
        label: translate('selectionList.nameEmailOrPhoneNumber'),
        hint: offlineMessage,
        value: searchTerm,
        onChangeText: setSearchTerm,
        headerMessage: header,
        disableAutoCorrect: true,
    };

    return (
        <SelectionListWithSections
            sections={areOptionsInitialized ? sections : getEmptyArray<Section<OptionData>>()}
            ListItem={InviteMemberListItem}
            onSelectRow={toggleSelection}
            textInputOptions={textInputOptions}
            confirmButtonOptions={{
                onConfirm: handleConfirmSelection,
            }}
            footerContent={footerContent}
            isLoadingNewOptions={!!isSearchingForReports}
            shouldShowLoadingPlaceholder={shouldShowLoadingPlaceholder}
            shouldShowListEmptyContent={shouldShowListEmptyContent}
            listEmptyContent={<EmptySelectionListContent contentType={iouType} />}
            shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
            onEndReached={onListEndReached}
            shouldSingleExecuteRowSelect
            shouldShowTextInput
            canSelectMultiple
            shouldScrollToTopOnSelect={false}
        />
    );
}

// eslint-disable-next-line rulesdir/no-deep-equal-in-memo -- attendees array is derived and may have unstable references
export default memo(MoneyRequestAttendeeSelector, (prevProps, nextProps) => deepEqual(prevProps.attendees, nextProps.attendees) && prevProps.iouType === nextProps.iouType);
export {MoneyRequestAttendeeSelector};
