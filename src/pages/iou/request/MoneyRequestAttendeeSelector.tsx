import reportsSelector from '@selectors/Attributes';
import {deepEqual} from 'fast-equals';
import React, {memo, useEffect} from 'react';
import type {GestureResponderEvent} from 'react-native';
import Button from '@components/Button';
import EmptySelectionListContent from '@components/EmptySelectionListContent';
import FormHelpMessage from '@components/FormHelpMessage';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import InviteMemberListItem from '@components/SelectionList/ListItem/InviteMemberListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {Section} from '@components/SelectionList/SelectionListWithSections/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
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
import getEmptyArray from '@src/types/utils/getEmptyArray';
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
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserEmail = currentUserPersonalDetails.email ?? '';
    const currentUserAccountID = currentUserPersonalDetails.accountID;
    const isPaidGroupPolicy = isPaidGroupPolicyFn(policy);
    const recentAttendeeLists = getFilteredRecentAttendees(personalDetails, attendees, recentAttendees ?? [], currentUserEmail, currentUserAccountID);

    const initialSelectedOptions = attendees.map((attendee) => ({
        ...attendee,
        reportID: CONST.DEFAULT_NUMBER_ID.toString(),
        keyForList: String(attendee.accountID) ?? (attendee.email || attendee.displayName),
        selected: true,
        // Use || to fall back to displayName for name-only attendees (empty email)
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        login: attendee.email || attendee.displayName,
        ...getPersonalDetailByEmail(attendee.email),
    }));

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

    let orderedAvailableOptions;
    if (!isPaidGroupPolicy || !areOptionsInitialized) {
        orderedAvailableOptions = availableOptions;
    } else {
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
        orderedAvailableOptions = {
            ...availableOptions,
            recentReports: orderedOptions.recentReports,
            personalDetails: orderedOptions.personalDetails,
            workspaceChats: orderedOptions.workspaceChats,
        };
    }

    const shouldShowErrorMessage = selectedOptions.length < 1;

    const handleConfirmSelection = (_keyEvent?: GestureResponderEvent | KeyboardEvent, option?: OptionData) => {
        if (shouldShowErrorMessage || (!selectedOptions.length && !option)) {
            return;
        }

        onFinish(CONST.IOU.TYPE.SUBMIT);
    };

    const showLoadingPlaceholder = !areOptionsInitialized || !didScreenTransitionEnd;

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

    let sections: Array<Section<OptionData>>;
    let header: string;
    if (!areOptionsInitialized || !didScreenTransitionEnd) {
        sections = [];
        header = '';
    } else {
        const newSections: Array<Section<OptionData>> = [];
        const cleanSearchTerm = searchTerm.trim().toLowerCase();
        const formatResults = formatSectionsFromSearchTerm(
            cleanSearchTerm,
            initialSelectedOptions,
            orderedAvailableOptions.recentReports,
            orderedAvailableOptions.personalDetails,
            currentUserAccountID,
            personalDetails,
            true,
            undefined,
            reportAttributesDerived,
        );

        newSections.push({
            ...formatResults.section,
            sectionIndex: 0,
            data: formatResults.section.data as OptionData[],
        });

        if (orderedAvailableOptions.recentReports.length > 0) {
            newSections.push({
                title: translate('common.recents'),
                data: orderedAvailableOptions.recentReports,
                sectionIndex: 1,
            });
        }

        if (orderedAvailableOptions.personalDetails.length > 0) {
            newSections.push({
                title: translate('common.contacts'),
                data: orderedAvailableOptions.personalDetails,
                sectionIndex: 2,
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
                currentUserEmail,
            )
        ) {
            newSections.push({
                title: undefined,
                data: [orderedAvailableOptions.userToInvite].map((participant) => {
                    const isPolicyExpenseChat = participant?.isPolicyExpenseChat ?? false;
                    return isPolicyExpenseChat
                        ? getPolicyExpenseReportOption(participant, currentUserAccountID, personalDetails, reportAttributesDerived)
                        : getParticipantsOption(participant, personalDetails);
                }) as OptionData[],
                sectionIndex: 3,
            });
        }

        header = getHeaderMessage(
            formatResults.section.data.length + (orderedAvailableOptions.personalDetails ?? []).length + (orderedAvailableOptions.recentReports ?? []).length !== 0,
            !!orderedAvailableOptions?.userToInvite,
            cleanSearchTerm,
            countryCode,
            attendees.some((attendee) => getPersonalDetailSearchTerms(attendee, currentUserAccountID).join(' ').toLowerCase().includes(cleanSearchTerm)),
        );
        sections = newSections;
    }

    const optionLength = !areOptionsInitialized ? 0 : sections.reduce((acc, section) => acc + (section.data?.length ?? 0), 0);

    const shouldShowListEmptyContent = optionLength === 0 && !showLoadingPlaceholder;

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
            showLoadingPlaceholder={showLoadingPlaceholder}
            showListEmptyContent={shouldShowListEmptyContent}
            listEmptyContent={<EmptySelectionListContent contentType={iouType} />}
            shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
            onEndReached={onListEndReached}
            disableMaintainingScrollPosition
            shouldSingleExecuteRowSelect
            shouldShowTextInput
            canSelectMultiple
        />
    );
}

// eslint-disable-next-line rulesdir/no-deep-equal-in-memo -- attendees array is derived and may have unstable references
export default memo(MoneyRequestAttendeeSelector, (prevProps, nextProps) => deepEqual(prevProps.attendees, nextProps.attendees) && prevProps.iouType === nextProps.iouType);
