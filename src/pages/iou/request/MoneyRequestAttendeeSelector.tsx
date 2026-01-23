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

    const recentAttendeeLists = useMemo(() => getFilteredRecentAttendees(personalDetails, attendees, recentAttendees ?? []), [personalDetails, attendees, recentAttendees]);
    const initialSelectedOptionsRef = useRef<OptionData[]>(
        attendees.map((attendee) => ({
            ...attendee,
            reportID: CONST.DEFAULT_NUMBER_ID.toString(),
            selected: true,
            login: attendee.email ? attendee.email : attendee.displayName,
            ...getPersonalDetailByEmail(attendee.email),
        })),
    );
    const initialSelectedLoginsRef = useRef(new Set(attendees.map((attendee) => attendee.email ?? attendee.login ?? attendee.displayName).filter(Boolean)));

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
     */
    const [sections, header] = useMemo(() => {
        const newSections: Array<SectionListDataType<OptionData>> = [];
        if (!areOptionsInitialized || !didScreenTransitionEnd) {
            return [newSections, ''];
        }

        const cleanSearchTerm = searchTerm.trim().toLowerCase();

        // Build a single combined list to avoid jumps; only reorder for initial selections when not searching
        const combined: OptionData[] = [];

        const selectedLogins = new Set(selectedOptions.map((option) => option.login));

        // Base options (recents + contacts)
        for (const option of orderedSearchOptions.recentReports) {
            combined.push(option);
        }
        for (const option of orderedSearchOptions.personalDetails) {
            combined.push(option);
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
                ? getPolicyExpenseReportOption(orderedSearchOptions.userToInvite, reportAttributesDerived)
                : getParticipantsOption(orderedSearchOptions.userToInvite, personalDetails);
            combined.push(participant);
        }

        // Add any selected options not present in combined list (defensive)
        const seenLogins = new Set(combined.map((option) => option.login));
        for (const option of selectedOptions) {
            if (option.login && seenLogins.has(option.login)) {
                continue;
            }
            combined.push(option);
            if (option.login) {
                seenLogins.add(option.login);
            }
        }

        if (!cleanSearchTerm && combined.length > CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD && initialSelectedLoginsRef.current.size > 0) {
            const initialItems: OptionData[] = [];
            const remainingItems: OptionData[] = [];
            for (const option of combined) {
                if (option.login && initialSelectedLoginsRef.current.has(option.login)) {
                    initialItems.push(option);
                } else {
                    remainingItems.push(option);
                }
            }
            combined.splice(0, combined.length, ...initialItems, ...remainingItems);
        }

        // Keep selection flags in place; do not reorder on toggle
        const data = combined.map((option) => ({
            ...option,
            isSelected: option.login ? selectedLogins.has(option.login) : option.isSelected,
        }));

        const headerMessage = getHeaderMessage(
            data.length !== 0,
            !!orderedSearchOptions?.userToInvite,
            cleanSearchTerm,
            countryCode,
            attendees.some((attendee) => getPersonalDetailSearchTerms(attendee).join(' ').toLowerCase().includes(cleanSearchTerm)),
        );

        return [
            [
                {
                    title: '',
                    data,
                    shouldShow: data.length > 0,
                },
            ],
            headerMessage,
        ];
    }, [areOptionsInitialized, didScreenTransitionEnd, searchTerm, attendees, orderedSearchOptions, personalDetails, reportAttributesDerived, loginList, countryCode, selectedOptions]);

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
        />
    );
}

// eslint-disable-next-line rulesdir/no-deep-equal-in-memo -- attendees array is derived and may have unstable references
export default memo(MoneyRequestAttendeeSelector, (prevProps, nextProps) => deepEqual(prevProps.attendees, nextProps.attendees) && prevProps.iouType === nextProps.iouType);
