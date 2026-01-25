import reportsSelector from '@selectors/Attributes';
import {deepEqual} from 'fast-equals';
import React, {memo, useCallback, useEffect, useMemo, useRef} from 'react';
import type {GestureResponderEvent} from 'react-native';
import Button from '@components/Button';
import EmptySelectionListContent from '@components/EmptySelectionListContent';
import FormHelpMessage from '@components/FormHelpMessage';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
// eslint-disable-next-line no-restricted-imports
import SelectionList from '@components/SelectionListWithSections';
import InviteMemberListItem from '@components/SelectionListWithSections/InviteMemberListItem';
import type {SectionListDataType} from '@components/SelectionListWithSections/types';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import useSearchSelector from '@hooks/useSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';
import {searchInServer} from '@libs/actions/Report';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {
    getFilteredRecentAttendees,
    getHeaderMessage,
    getParticipantsOption,
    getPersonalDetailSearchTerms,
    getPolicyExpenseReportOption,
    isCurrentUser,
    orderOptions,
} from '@libs/OptionsListUtils';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {isPaidGroupPolicy as isPaidGroupPolicyFn} from '@libs/PolicyUtils';
import type {OptionData} from '@libs/ReportUtils';
import type {IOUAction, IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Attendee} from '@src/types/onyx/IOU';
import SafeString from '@src/utils/SafeString';

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
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [recentAttendees] = useOnyx(ONYXKEYS.NVP_RECENT_ATTENDEES, {canBeMissing: true});
    const policy = usePolicy(activePolicyID);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});
    const [reportAttributesDerived] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {canBeMissing: true, selector: reportsSelector});
    const offlineMessage: string = isOffline ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : '';
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST, {canBeMissing: true});

    const isPaidGroupPolicy = useMemo(() => isPaidGroupPolicyFn(policy), [policy]);

    const initialAttendeesRef = useRef(attendees);
    const recentAttendeeLists = useMemo(() => getFilteredRecentAttendees(personalDetails, initialAttendeesRef.current, recentAttendees ?? []), [personalDetails, recentAttendees]);
    const initialSelectedOptionsRef = useRef<OptionData[]>(
        attendees.map((attendee) => ({
            ...attendee,
            reportID: CONST.DEFAULT_NUMBER_ID.toString(),
            selected: true,
            login: attendee.email ? attendee.email : attendee.displayName,
            ...getPersonalDetailByEmail(attendee.email),
        })),
    );

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
            includeSelectedOptions: true,
        },
        initialSelected: initialSelectedOptionsRef.current,
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

    const formattedInitialSelectedOptions = useMemo<OptionData[]>(
        () =>
            initialSelectedOptionsRef.current.map((option) => {
                const isPolicyExpenseChat = option.isPolicyExpenseChat ?? false;
                const participant = isPolicyExpenseChat
                    ? getPolicyExpenseReportOption(option, personalDetails, reportAttributesDerived)
                    : getParticipantsOption(option, personalDetails);
                return {
                    ...participant,
                    reportID: participant.reportID ?? CONST.DEFAULT_NUMBER_ID.toString(),
                };
            }),
        [personalDetails, reportAttributesDerived],
    );

    useEffect(() => {
        searchInServer(debouncedSearchTerm.trim());
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
    }, [searchOptions, isPaidGroupPolicy, areOptionsInitialized, searchTerm, action]);

    const shouldShowErrorMessage = selectedOptions.length < 1;

    const handleConfirmSelection = useCallback(
        (_keyEvent?: GestureResponderEvent | KeyboardEvent, option?: OptionData) => {
            if (shouldShowErrorMessage || (!selectedOptions.length && !option)) {
                return;
            }

            onFinish(CONST.IOU.TYPE.SUBMIT);
        },
        [shouldShowErrorMessage, onFinish, selectedOptions.length],
    );

    const showLoadingPlaceholder = useMemo(() => !areOptionsInitialized || !didScreenTransitionEnd, [areOptionsInitialized, didScreenTransitionEnd]);

    const footerContent = useMemo(() => {
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
                />
            </>
        );
    }, [handleConfirmSelection, selectedOptions.length, shouldShowErrorMessage, styles, translate]);

    /**
     * Returns the sections needed for the OptionsSelector
     *
     * Rules:
     * - While the modal is open, keep items in their source sections (no jump on toggle).
     * - Selected items are shown at the top section based on the incoming attendees (initialSelectedOptionsRef).
     * - New selections stay in recents/contacts; after closing and reopening, they appear in the top section via updated props.
     * - Search filters all sections.
     */
    const [sections, header] = useMemo(() => {
        const newSections: Array<SectionListDataType<OptionData>> = [];
        if (!areOptionsInitialized || !didScreenTransitionEnd) {
            return [newSections, ''];
        }

        const cleanSearchTerm = searchTerm.trim().toLowerCase();
        const matchesSearchTerm = (option: OptionData) => {
            if (!cleanSearchTerm) {
                return true;
            }
            const haystacks = [option.searchText, option.login, option.text, option.alternateText].filter(Boolean).map((value) => value?.toLowerCase());
            return haystacks.some((value) => value?.includes(cleanSearchTerm));
        };

        const selectedLogins = new Set(selectedOptions.map((option) => option.login));
        const selectedLoginSet = new Set(formattedInitialSelectedOptions.map((option) => option.login).filter(Boolean));

        const selectedSectionData = formattedInitialSelectedOptions
            .filter((option) => matchesSearchTerm(option))
            .map((option) => ({
                ...option,
                isSelected: option.login ? selectedLogins.has(option.login) : option.isSelected,
            }));

        const recents = orderedSearchOptions.recentReports
            .filter((option) => !selectedLoginSet.has(option.login) && matchesSearchTerm(option))
            .map((option) => ({
                ...option,
                isSelected: option.login ? selectedLogins.has(option.login) : option.isSelected,
            }));

        const recentLogins = new Set(recents.map((option) => option.login).filter(Boolean));

        const contacts = orderedSearchOptions.personalDetails
            .filter((option) => !selectedLoginSet.has(option.login) && !recentLogins.has(option.login) && matchesSearchTerm(option))
            .map((option) => ({
                ...option,
                isSelected: option.login ? selectedLogins.has(option.login) : option.isSelected,
            }));

        newSections.push({
            title: '',
            data: selectedSectionData,
            shouldShow: selectedSectionData.length > 0,
        });

        if (recents.length > 0) {
            newSections.push({
                title: translate('common.recents'),
                data: recents,
                shouldShow: true,
            });
        }

        if (contacts.length > 0) {
            newSections.push({
                title: translate('common.contacts'),
                data: contacts,
                shouldShow: true,
            });
        }

        if (
            orderedSearchOptions.userToInvite &&
            !isCurrentUser(
                {
                    ...orderedSearchOptions.userToInvite,
                    accountID: orderedSearchOptions.userToInvite?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                    status: orderedSearchOptions.userToInvite?.status ?? undefined,
                },
                loginList,
            )
        ) {
            const participant = orderedSearchOptions.userToInvite.isPolicyExpenseChat
                ? getPolicyExpenseReportOption(orderedSearchOptions.userToInvite, personalDetails, reportAttributesDerived)
                : getParticipantsOption(orderedSearchOptions.userToInvite, personalDetails);
            const participantOption: OptionData = {
                ...participant,
                reportID: participant.reportID ?? CONST.DEFAULT_NUMBER_ID.toString(),
            };
            if (matchesSearchTerm(participantOption)) {
                newSections.push({
                    title: undefined,
                    data: [participantOption],
                    shouldShow: true,
                });
            }
        }

        const totalRows = newSections.reduce((acc, section) => acc + (section.data?.length ?? 0), 0);
        const headerMessage = getHeaderMessage(
            totalRows !== 0,
            !!orderedSearchOptions?.userToInvite,
            cleanSearchTerm,
            countryCode,
            attendees.some((attendee) => getPersonalDetailSearchTerms(attendee).join(' ').toLowerCase().includes(cleanSearchTerm)),
        );

        return [newSections, headerMessage];
    }, [
        areOptionsInitialized,
        didScreenTransitionEnd,
        searchTerm,
        attendees,
        orderedSearchOptions.recentReports,
        orderedSearchOptions.personalDetails,
        orderedSearchOptions.userToInvite,
        personalDetails,
        reportAttributesDerived,
        loginList,
        countryCode,
        selectedOptions,
        translate,
    ]);

    const optionLength = useMemo(() => {
        if (!areOptionsInitialized) {
            return 0;
        }
        return sections.reduce((acc, section) => acc + (section.data?.length ?? 0), 0);
    }, [areOptionsInitialized, sections]);

    const shouldShowListEmptyContent = useMemo(() => optionLength === 0 && !showLoadingPlaceholder, [optionLength, showLoadingPlaceholder]);

    return (
        <SelectionList
            onConfirm={handleConfirmSelection}
            sections={areOptionsInitialized ? sections : CONST.EMPTY_ARRAY}
            ListItem={InviteMemberListItem}
            textInputValue={searchTerm}
            textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')}
            textInputHint={offlineMessage}
            onChangeText={setSearchTerm}
            shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
            onSelectRow={toggleSelection}
            shouldSingleExecuteRowSelect
            footerContent={footerContent}
            autoCorrect={false}
            listEmptyContent={<EmptySelectionListContent contentType={iouType} />}
            headerMessage={header}
            showLoadingPlaceholder={showLoadingPlaceholder}
            canSelectMultiple
            isLoadingNewOptions={!!isSearchingForReports}
            shouldShowListEmptyContent={shouldShowListEmptyContent}
            onEndReached={onListEndReached}
            shouldUpdateFocusedIndex={false}
            shouldScrollToTopOnSelect={false}
        />
    );
}

// eslint-disable-next-line rulesdir/no-deep-equal-in-memo -- attendees array is derived and may have unstable references
export default memo(MoneyRequestAttendeeSelector, (prevProps, nextProps) => deepEqual(prevProps.attendees, nextProps.attendees) && prevProps.iouType === nextProps.iouType);
