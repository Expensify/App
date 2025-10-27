import reportsSelector from '@selectors/Attributes';
import {deepEqual} from 'fast-equals';
import lodashReject from 'lodash/reject';
import React, {memo, useCallback, useEffect, useMemo} from 'react';
import type {GestureResponderEvent} from 'react-native';
import Button from '@components/Button';
import EmptySelectionListContent from '@components/EmptySelectionListContent';
import FormHelpMessage from '@components/FormHelpMessage';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import SelectionList from '@components/SelectionListWithSections';
import InviteMemberListItem from '@components/SelectionListWithSections/InviteMemberListItem';
import type {SectionListDataType} from '@components/SelectionListWithSections/types';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import useThemeStyles from '@hooks/useThemeStyles';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import type {Option} from '@libs/OptionsListUtils';
import {
    filterAndOrderOptions,
    formatSectionsFromSearchTerm,
    getAttendeeOptions,
    getEmptyOptions,
    getHeaderMessage,
    getParticipantsOption,
    getPersonalDetailSearchTerms,
    getPolicyExpenseReportOption,
    isCurrentUser,
    orderOptions,
} from '@libs/OptionsListUtils';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {isPaidGroupPolicy as isPaidGroupPolicyFn} from '@libs/PolicyUtils';
import {searchInServer} from '@userActions/Report';
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
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const {isOffline} = useNetwork();
    const personalDetails = usePersonalDetails();
    const {didScreenTransitionEnd} = useScreenWrapperTransitionStatus();
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const [betas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: false});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [recentAttendees] = useOnyx(ONYXKEYS.NVP_RECENT_ATTENDEES, {canBeMissing: true});
    const [draftComments] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT, {canBeMissing: true});
    const policy = usePolicy(activePolicyID);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});
    const {options, areOptionsInitialized} = useOptionsList({
        shouldInitialize: didScreenTransitionEnd,
    });
    const [reportAttributesDerived] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {canBeMissing: true, selector: reportsSelector});
    const cleanSearchTerm = useMemo(() => searchTerm.trim().toLowerCase(), [searchTerm]);
    const offlineMessage: string = isOffline ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : '';

    const isPaidGroupPolicy = useMemo(() => isPaidGroupPolicyFn(policy), [policy]);

    useEffect(() => {
        searchInServer(debouncedSearchTerm.trim());
    }, [debouncedSearchTerm]);

    const defaultOptions = useMemo(() => {
        if (!areOptionsInitialized || !didScreenTransitionEnd) {
            getEmptyOptions();
        }
        const optionList = getAttendeeOptions({
            reports: options.reports,
            personalDetails: options.personalDetails,
            betas,
            attendees,
            recentAttendees: recentAttendees ?? [],
            draftComments: draftComments ?? {},
            includeOwnedWorkspaceChats: iouType === CONST.IOU.TYPE.SUBMIT,
            includeP2P: true,
            includeInvoiceRooms: false,
            action,
            countryCode,
        });
        if (isPaidGroupPolicy) {
            const orderedOptions = orderOptions(optionList, searchTerm, {
                preferChatRoomsOverThreads: true,
                preferPolicyExpenseChat: !!action,
                preferRecentExpenseReports: action === CONST.IOU.ACTION.CREATE,
            });
            optionList.recentReports = orderedOptions.recentReports;
            optionList.personalDetails = orderedOptions.personalDetails;
        }
        return optionList;
    }, [
        areOptionsInitialized,
        didScreenTransitionEnd,
        options.reports,
        options.personalDetails,
        betas,
        attendees,
        recentAttendees,
        draftComments,
        iouType,
        action,
        isPaidGroupPolicy,
        searchTerm,
        countryCode,
    ]);

    const chatOptions = useMemo(() => {
        if (!areOptionsInitialized) {
            return {
                userToInvite: null,
                recentReports: [],
                personalDetails: [],
                currentUserOption: null,
                headerMessage: '',
            };
        }
        const newOptions = filterAndOrderOptions(defaultOptions, cleanSearchTerm, countryCode, {
            excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            preferPolicyExpenseChat: isPaidGroupPolicy,
            shouldAcceptName: true,
            selectedOptions: attendees.map((attendee) => ({
                ...attendee,
                reportID: CONST.DEFAULT_NUMBER_ID.toString(),
                selected: true,
                login: attendee.email,
                ...getPersonalDetailByEmail(attendee.email),
            })),
        });
        return newOptions;
    }, [areOptionsInitialized, defaultOptions, cleanSearchTerm, isPaidGroupPolicy, attendees, countryCode]);

    /**
     * Returns the sections needed for the OptionsSelector
     */
    const [sections, header] = useMemo(() => {
        const newSections: Array<SectionListDataType<Option>> = [];
        if (!areOptionsInitialized || !didScreenTransitionEnd) {
            return [newSections, ''];
        }

        const fiveRecents = [...chatOptions.recentReports].slice(0, 5);
        const restOfRecents = [...chatOptions.recentReports].slice(5);
        const contactsWithRestOfRecents = [...restOfRecents, ...chatOptions.personalDetails];

        const formatResults = formatSectionsFromSearchTerm(
            cleanSearchTerm,
            attendees.map((attendee) => ({
                ...attendee,
                reportID: CONST.DEFAULT_NUMBER_ID.toString(),
                selected: true,
                login: attendee.email,
                ...getPersonalDetailByEmail(attendee.email),
            })),
            chatOptions.recentReports,
            chatOptions.personalDetails,
            personalDetails,
            true,
            undefined,
            reportAttributesDerived,
        );
        newSections.push(formatResults.section);

        newSections.push({
            title: translate('common.recents'),
            data: fiveRecents,
            shouldShow: fiveRecents.length > 0,
        });

        newSections.push({
            title: translate('common.contacts'),
            data: contactsWithRestOfRecents,
            shouldShow: contactsWithRestOfRecents.length > 0,
        });

        if (
            chatOptions.userToInvite &&
            !isCurrentUser({...chatOptions.userToInvite, accountID: chatOptions.userToInvite?.accountID ?? CONST.DEFAULT_NUMBER_ID, status: chatOptions.userToInvite?.status ?? undefined})
        ) {
            newSections.push({
                title: undefined,
                data: [chatOptions.userToInvite].map((participant) => {
                    const isPolicyExpenseChat = participant?.isPolicyExpenseChat ?? false;
                    return isPolicyExpenseChat ? getPolicyExpenseReportOption(participant, reportAttributesDerived) : getParticipantsOption(participant, personalDetails);
                }),
                shouldShow: true,
            });
        }

        const headerMessage = getHeaderMessage(
            (chatOptions.personalDetails ?? []).length + (chatOptions.recentReports ?? []).length !== 0,
            !!chatOptions?.userToInvite,
            cleanSearchTerm,
            countryCode,
            attendees.some((attendee) => getPersonalDetailSearchTerms(attendee).join(' ').toLowerCase().includes(cleanSearchTerm)),
        );

        return [newSections, headerMessage];
    }, [
        areOptionsInitialized,
        didScreenTransitionEnd,
        chatOptions.recentReports,
        chatOptions.personalDetails,
        chatOptions.userToInvite,
        cleanSearchTerm,
        attendees,
        personalDetails,
        reportAttributesDerived,
        translate,
        countryCode,
    ]);

    const addAttendeeToSelection = useCallback(
        (option: Option) => {
            const isOptionSelected = (selectedOption: Attendee) => {
                if (selectedOption.accountID && selectedOption.accountID === option?.accountID) {
                    return true;
                }

                if (selectedOption.email && selectedOption.email === option?.login) {
                    return true;
                }

                return false;
            };
            const isOptionInList = attendees.some(isOptionSelected);
            let newSelectedOptions: Attendee[];

            if (isOptionInList) {
                newSelectedOptions = lodashReject(attendees, isOptionSelected);
            } else {
                const iconSource = option.icons?.[0]?.source;
                const icon = typeof iconSource === 'function' ? '' : SafeString(iconSource);
                newSelectedOptions = [
                    ...attendees,
                    {
                        accountID: option.accountID ?? CONST.DEFAULT_NUMBER_ID,
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        login: option.login || option.text,
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        email: option.login || (option.text ?? ''),
                        displayName: option.text ?? '',
                        selected: true,
                        searchText: option.searchText,
                        avatarUrl: option.avatarUrl ?? icon,
                        iouType,
                    },
                ];
            }
            onAttendeesAdded(newSelectedOptions);
        },
        [attendees, iouType, onAttendeesAdded],
    );

    const shouldShowErrorMessage = attendees.length < 1;

    const handleConfirmSelection = useCallback(
        (_keyEvent?: GestureResponderEvent | KeyboardEvent, option?: Option) => {
            if (shouldShowErrorMessage || (!attendees.length && !option)) {
                return;
            }

            onFinish(CONST.IOU.TYPE.SUBMIT);
        },
        [shouldShowErrorMessage, onFinish, attendees],
    );

    const showLoadingPlaceholder = useMemo(() => !areOptionsInitialized || !didScreenTransitionEnd, [areOptionsInitialized, didScreenTransitionEnd]);

    const optionLength = useMemo(() => {
        if (!areOptionsInitialized) {
            return 0;
        }
        return sections.reduce((acc, section) => acc + section.data.length, 0);
    }, [areOptionsInitialized, sections]);

    const shouldShowListEmptyContent = useMemo(() => optionLength === 0 && !showLoadingPlaceholder, [optionLength, showLoadingPlaceholder]);

    const footerContent = useMemo(() => {
        if (!shouldShowErrorMessage && !attendees.length) {
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
    }, [handleConfirmSelection, attendees.length, shouldShowErrorMessage, styles, translate]);

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
            onSelectRow={addAttendeeToSelection}
            shouldSingleExecuteRowSelect
            footerContent={footerContent}
            autoCorrect={false}
            listEmptyContent={<EmptySelectionListContent contentType={iouType} />}
            headerMessage={header}
            showLoadingPlaceholder={showLoadingPlaceholder}
            canSelectMultiple
            isLoadingNewOptions={!!isSearchingForReports}
            shouldShowListEmptyContent={shouldShowListEmptyContent}
        />
    );
}

MoneyRequestAttendeeSelector.displayName = 'MoneyRequestAttendeeSelector';

export default memo(MoneyRequestAttendeeSelector, (prevProps, nextProps) => deepEqual(prevProps.attendees, nextProps.attendees) && prevProps.iouType === nextProps.iouType);
