import lodashIsEqual from 'lodash/isEqual';
import lodashReject from 'lodash/reject';
import React, {memo, useCallback, useEffect, useMemo} from 'react';
import type {GestureResponderEvent} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import EmptySelectionListContent from '@components/EmptySelectionListContent';
import FormHelpMessage from '@components/FormHelpMessage';
import {usePersonalDetails} from '@components/OnyxProvider';
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
    attendees?: Attendee[] | typeof CONST.EMPTY_ARRAY;

    /** The type of IOU report, i.e. split, request, send, track */
    iouType: IOUType;

    /** The action of the IOU, i.e. create, split, move */
    action: IOUAction;
};

function MoneyRequestAttendeeSelector({attendees = CONST.EMPTY_ARRAY, onFinish, onAttendeesAdded, iouType, action}: MoneyRequestAttendeesSelectorProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const {isOffline} = useNetwork();
    const personalDetails = usePersonalDetails();
    const {didScreenTransitionEnd} = useScreenWrapperTranstionStatus();
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
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

        const optionList = OptionsListUtils.getFilteredOptions(
            options.reports,
            options.personalDetails,
            betas,
            '',
            attendees as Attendee[],
            CONST.EXPENSIFY_EMAILS,

            // If we are using this component in the "Submit expense" flow then we pass the includeOwnedWorkspaceChats argument so that the current user
            // sees the option to submit an expense from their admin on their own Workspace Chat.
            iouType === CONST.IOU.TYPE.SUBMIT && action !== CONST.IOU.ACTION.SUBMIT,

            !isCategorizeOrShareAction,
            false,
            {},
            [],
            false,
            {},
            [],
            !isCategorizeOrShareAction,
            false,
            false,
            0,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            iouType === CONST.IOU.TYPE.INVOICE,
            action,
            isPaidGroupPolicy,
        );

        return optionList;
    }, [action, areOptionsInitialized, betas, didScreenTransitionEnd, iouType, isCategorizeOrShareAction, options.personalDetails, options.reports, attendees, isPaidGroupPolicy]);

    const chatOptions = useMemo(() => {
        if (!areOptionsInitialized) {
            return {
                userToInvite: null,
                recentReports: [],
                personalDetails: [],
                currentUserOption: null,
                headerMessage: '',
                categoryOptions: [],
                tagOptions: [],
                taxRatesOptions: [],
            };
        }

        const newOptions = OptionsListUtils.filterOptions(defaultOptions, debouncedSearchTerm, {
            selectedOptions: attendees as Attendee[],
            excludeLogins: CONST.EXPENSIFY_EMAILS,
            maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
            preferPolicyExpenseChat: isPaidGroupPolicy,
            shouldAcceptName: true,
        });
        return newOptions;
    }, [areOptionsInitialized, defaultOptions, debouncedSearchTerm, attendees, isPaidGroupPolicy]);

    /**
     * Returns the sections needed for the OptionsSelector
     * @returns {Array}
     */
    const [sections, header] = useMemo(() => {
        const newSections: OptionsListUtils.CategorySection[] = [];
        if (!areOptionsInitialized || !didScreenTransitionEnd) {
            return [newSections, ''];
        }

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
            data: chatOptions.recentReports,
            shouldShow: chatOptions.recentReports.length > 0,
        });

        newSections.push({
            title: translate('common.contacts'),
            data: chatOptions.personalDetails,
            shouldShow: chatOptions.personalDetails.length > 0,
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

    /**
     * Removes a selected option from list if already selected. If not already selected add this option to the list.
     * @param {Object} option
     */
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
                        login: option.login && option.login !== '' ? option.login : option.text,
                        displayName: option.text,
                        selected: true,
                        searchText: option.searchText,
                        iouType,
                    },
                ];
            }

            onAttendeesAdded(newSelectedOptions);
        },
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- we don't want to trigger this callback when iouType changes
        [attendees, onAttendeesAdded],
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
