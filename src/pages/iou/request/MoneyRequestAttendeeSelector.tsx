import lodashIsEqual from 'lodash/isEqual';
import lodashReject from 'lodash/reject';
import React, {memo, useCallback, useEffect, useMemo} from 'react';
import type {GestureResponderEvent} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import EmptySelectionListContent from '@components/EmptySelectionListContent';
import FormHelpMessage from '@components/FormHelpMessage';
import {usePersonalDetails, useSession} from '@components/OnyxProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import SelectionList from '@components/SelectionList';
import InviteMemberListItem from '@components/SelectionList/InviteMemberListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePolicy from '@hooks/usePolicy';
import useScreenWrapperTranstionStatus from '@hooks/useScreenWrapperTransitionStatus';
import useThemeStyles from '@hooks/useThemeStyles';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as Report from '@userActions/Report';
import type {IOUAction, IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Attendee} from '@src/types/onyx/IOU';

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
    const {didScreenTransitionEnd} = useScreenWrapperTranstionStatus();
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const session = useSession();
    const isCurrentUserAttendee = attendees.some((attendee) => attendee.accountID === session?.accountID);
    const [recentAttendees] = useOnyx(ONYXKEYS.NVP_RECENT_ATTENDEES);
    const policy = usePolicy(activePolicyID);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false});
    const {options, areOptionsInitialized} = useOptionsList({
        shouldInitialize: didScreenTransitionEnd,
    });
    const cleanSearchTerm = useMemo(() => debouncedSearchTerm.trim().toLowerCase(), [debouncedSearchTerm]);
    const offlineMessage: string = isOffline ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : '';

    const isPaidGroupPolicy = useMemo(() => PolicyUtils.isPaidGroupPolicy(policy), [policy]);
    const isCategorizeOrShareAction = [CONST.IOU.ACTION.CATEGORIZE, CONST.IOU.ACTION.SHARE].some((option) => option === action);

    useEffect(() => {
        Report.searchInServer(debouncedSearchTerm.trim());
    }, [debouncedSearchTerm]);

    const defaultOptions = useMemo(() => {
        if (!areOptionsInitialized || !didScreenTransitionEnd) {
            OptionsListUtils.getEmptyOptions();
        }
        const optionList = OptionsListUtils.getAttendeeOptions(
            options.reports,
            options.personalDetails,
            betas,
            attendees,
            recentAttendees ?? [],
            iouType === CONST.IOU.TYPE.SUBMIT && action !== CONST.IOU.ACTION.SUBMIT,
            !isCategorizeOrShareAction,
            iouType === CONST.IOU.TYPE.INVOICE,
            action,
        );
        if (isPaidGroupPolicy) {
            const orderedOptions = OptionsListUtils.orderOptions(optionList, searchTerm, {
                preferChatroomsOverThreads: true,
                preferPolicyExpenseChat: !!action,
                preferRecentExpenseReports: action === CONST.IOU.ACTION.CREATE,
            });
            optionList.recentReports = orderedOptions.recentReports;
            optionList.personalDetails = orderedOptions.personalDetails;
        }
        if (optionList.currentUserOption && !isCurrentUserAttendee) {
            optionList.recentReports = [optionList.currentUserOption, ...optionList.personalDetails];
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
        iouType,
        action,
        isCategorizeOrShareAction,
        isPaidGroupPolicy,
        isCurrentUserAttendee,
        searchTerm,
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
        const newOptions = OptionsListUtils.filterAndOrderOptions(defaultOptions, debouncedSearchTerm, {
            excludeLogins: CONST.EXPENSIFY_EMAILS,
            maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
            preferPolicyExpenseChat: isPaidGroupPolicy,
            shouldAcceptName: true,
        });
        return newOptions;
    }, [areOptionsInitialized, defaultOptions, debouncedSearchTerm, isPaidGroupPolicy]);

    /**
     * Returns the sections needed for the OptionsSelector
     */
    const [sections, header] = useMemo(() => {
        const newSections: OptionsListUtils.Section[] = [];
        if (!areOptionsInitialized || !didScreenTransitionEnd) {
            return [newSections, ''];
        }
        const fiveRecents = [...chatOptions.recentReports].slice(0, 5);
        const restOfRecents = [...chatOptions.recentReports].slice(5);
        const contactsWithRestOfRecents = [...restOfRecents, ...chatOptions.personalDetails];

        const formatResults = OptionsListUtils.formatSectionsFromSearchTerm(
            debouncedSearchTerm,
            attendees.map((attendee) => ({...attendee, reportID: attendee.reportID ?? '-1'})),
            chatOptions.recentReports,
            chatOptions.personalDetails,
            personalDetails,
            true,
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

        const headerMessage = OptionsListUtils.getHeaderMessage(
            (chatOptions.personalDetails ?? []).length + (chatOptions.recentReports ?? []).length !== 0,
            !!chatOptions?.userToInvite,
            debouncedSearchTerm.trim(),
            attendees.some((attendee) => OptionsListUtils.getPersonalDetailSearchTerms(attendee).join(' ').toLowerCase().includes(cleanSearchTerm)),
        );

        return [newSections, headerMessage];
    }, [
        areOptionsInitialized,
        didScreenTransitionEnd,
        debouncedSearchTerm,
        attendees,
        chatOptions.recentReports,
        chatOptions.personalDetails,
        chatOptions.userToInvite,
        personalDetails,
        translate,
        cleanSearchTerm,
    ]);

    const addAttendeeToSelection = useCallback(
        (option: Attendee) => {
            const isOptionSelected = (selectedOption: Attendee) => {
                if (selectedOption.accountID && selectedOption.accountID === option?.accountID) {
                    return true;
                }

                return false;
            };
            const isOptionInList = attendees.some(isOptionSelected);
            let newSelectedOptions: Attendee[];

            if (isOptionInList) {
                newSelectedOptions = lodashReject(attendees, isOptionSelected);
            } else {
                newSelectedOptions = [
                    ...attendees,
                    {
                        accountID: option.accountID ?? -1,
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        login: option.login || option.text,
                        displayName: option.text,
                        selected: true,
                        searchText: option.searchText,
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
        (_keyEvent?: GestureResponderEvent | KeyboardEvent, option?: Attendee) => {
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

                {!isCategorizeOrShareAction && (
                    <Button
                        success
                        text={translate('common.save')}
                        onPress={handleConfirmSelection}
                        pressOnEnter
                        large
                        isDisabled={shouldShowErrorMessage}
                    />
                )}
            </>
        );
    }, [handleConfirmSelection, attendees.length, shouldShowErrorMessage, styles, translate, isCategorizeOrShareAction]);

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
            onSelectRow={addAttendeeToSelection}
            shouldSingleExecuteRowSelect
            footerContent={footerContent}
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

export default memo(MoneyRequestAttendeeSelector, (prevProps, nextProps) => lodashIsEqual(prevProps.attendees, nextProps.attendees) && prevProps.iouType === nextProps.iouType);
