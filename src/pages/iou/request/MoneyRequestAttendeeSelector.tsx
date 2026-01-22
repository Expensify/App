import reportsSelector from '@selectors/Attributes';
import {deepEqual} from 'fast-equals';
import React, {memo, useCallback, useEffect, useMemo} from 'react';
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
import usePrivateIsArchivedMap from '@hooks/usePrivateIsArchivedMap';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import useSearchSelector from '@hooks/useSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';
import {searchInServer} from '@libs/actions/Report';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {
    formatSectionsFromSearchTerm,
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
    const privateIsArchivedMap = usePrivateIsArchivedMap();

    const isPaidGroupPolicy = useMemo(() => isPaidGroupPolicyFn(policy), [policy]);

    const recentAttendeeLists = useMemo(() => getFilteredRecentAttendees(personalDetails, attendees, recentAttendees ?? []), [personalDetails, attendees, recentAttendees]);
    const initialSelectedOptions = useMemo(
        () =>
            attendees.map((attendee) => ({
                ...attendee,
                reportID: CONST.DEFAULT_NUMBER_ID.toString(),
                selected: true,
                // Use || to fall back to displayName for name-only attendees (empty email)
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                login: attendee.email || attendee.displayName,
                ...getPersonalDetailByEmail(attendee.email),
            })),
        [attendees],
    );

    const {searchTerm, debouncedSearchTerm, setSearchTerm, availableOptions, selectedOptions, toggleSelection, areOptionsInitialized, onListEndReached} = useSearchSelector({
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

    const orderedAvailableOptions = useMemo(() => {
        if (!isPaidGroupPolicy || !areOptionsInitialized) {
            return availableOptions;
        }

        const orderedOptions = orderOptions(
            {
                recentReports: availableOptions.recentReports,
                personalDetails: availableOptions.personalDetails,
                workspaceChats: availableOptions.workspaceChats ?? [],
            },
            searchTerm,
            {
                preferChatRoomsOverThreads: true,
                preferPolicyExpenseChat: !!action,
                preferRecentExpenseReports: action === CONST.IOU.ACTION.CREATE,
            },
        );

        return {
            ...availableOptions,
            recentReports: orderedOptions.recentReports,
            personalDetails: orderedOptions.personalDetails,
            workspaceChats: orderedOptions.workspaceChats,
        };
    }, [availableOptions, isPaidGroupPolicy, areOptionsInitialized, searchTerm, action]);

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
        const formatResults = formatSectionsFromSearchTerm(
            cleanSearchTerm,
            initialSelectedOptions,
            orderedAvailableOptions.recentReports,
            orderedAvailableOptions.personalDetails,
            privateIsArchivedMap[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${initialSelectedOptions.at(0)?.reportID}`],
            personalDetails,
            true,
            undefined,
            reportAttributesDerived,
        );

        newSections.push({
            ...formatResults.section,
            data: formatResults.section.data as OptionData[],
        });

        if (orderedAvailableOptions.recentReports.length > 0) {
            newSections.push({
                title: translate('common.recents'),
                data: orderedAvailableOptions.recentReports,
            });
        }

        if (orderedAvailableOptions.personalDetails.length > 0) {
            newSections.push({
                title: translate('common.contacts'),
                data: orderedAvailableOptions.personalDetails,
            });
        }

        if (
            orderedAvailableOptions.userToInvite &&
            !isCurrentUser(
                {
                    ...orderedAvailableOptions.userToInvite,
                    accountID: orderedAvailableOptions.userToInvite?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                    status: orderedAvailableOptions.userToInvite?.status ?? undefined,
                },
                loginList,
            )
        ) {
            newSections.push({
                title: undefined,
                data: [orderedAvailableOptions.userToInvite].map((participant) => {
                    const isPolicyExpenseChat = participant?.isPolicyExpenseChat ?? false;
                    const privateIsArchived = privateIsArchivedMap[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${participant?.reportID}`];
                    return isPolicyExpenseChat ? getPolicyExpenseReportOption(participant, privateIsArchived, reportAttributesDerived) : getParticipantsOption(participant, personalDetails);
                }) as OptionData[],
                shouldShow: true,
            });
        }

        const headerMessage = getHeaderMessage(
            formatResults.section.data.length + (orderedAvailableOptions.personalDetails ?? []).length + (orderedAvailableOptions.recentReports ?? []).length !== 0,
            !!orderedAvailableOptions?.userToInvite,
            cleanSearchTerm,
            countryCode,
            attendees.some((attendee) => getPersonalDetailSearchTerms(attendee).join(' ').toLowerCase().includes(cleanSearchTerm)),
        );

        return [newSections, headerMessage];
    }, [
        areOptionsInitialized,
        didScreenTransitionEnd,
        searchTerm,
        initialSelectedOptions,
        attendees,
        orderedAvailableOptions.recentReports,
        orderedAvailableOptions.personalDetails,
        orderedAvailableOptions.userToInvite,
        personalDetails,
        reportAttributesDerived,
        loginList,
        countryCode,
        translate,
        privateIsArchivedMap,
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
        />
    );
}

// eslint-disable-next-line rulesdir/no-deep-equal-in-memo -- attendees array is derived and may have unstable references
export default memo(MoneyRequestAttendeeSelector, (prevProps, nextProps) => deepEqual(prevProps.attendees, nextProps.attendees) && prevProps.iouType === nextProps.iouType);
