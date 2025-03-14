import lodashPick from 'lodash/pick';
import React, {memo, useCallback, useEffect, useMemo} from 'react';
import type {GestureResponderEvent} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import EmptySelectionListContent from '@components/EmptySelectionListContent';
import {usePersonalDetails} from '@components/OnyxProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import SelectionList from '@components/SelectionList';
import InviteMemberListItem from '@components/SelectionList/InviteMemberListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useScreenWrapperTranstionStatus from '@hooks/useScreenWrapperTransitionStatus';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as Report from '@userActions/Report';
import type {IOUAction, IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Accountant} from '@src/types/onyx/IOU';

type MoneyRequestAccountantSelectorProps = {
    /** Callback to request parent modal to go to next step */
    onFinish: (value?: string) => void;

    /** Callback to set accountant in MoneyRequestModal */
    onAccountantSelected: (value: Accountant) => void;

    /** The type of IOU report, i.e. split, request, send, track */
    iouType: IOUType;

    /** The action of the IOU, i.e. create, split, move */
    action: IOUAction;
};

function MoneyRequestAccountantSelector({onFinish, onAccountantSelected, iouType, action}: MoneyRequestAccountantSelectorProps) {
    const {translate} = useLocalize();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const {isOffline} = useNetwork();
    const personalDetails = usePersonalDetails();
    const {didScreenTransitionEnd} = useScreenWrapperTranstionStatus();
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false});
    const {options, areOptionsInitialized} = useOptionsList({
        shouldInitialize: didScreenTransitionEnd,
    });
    const cleanSearchTerm = useMemo(() => debouncedSearchTerm.trim().toLowerCase(), [debouncedSearchTerm]);
    const offlineMessage: string = isOffline ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : '';

    useEffect(() => {
        Report.searchInServer(debouncedSearchTerm.trim());
    }, [debouncedSearchTerm]);

    const defaultOptions = useMemo(() => {
        if (!areOptionsInitialized || !didScreenTransitionEnd) {
            OptionsListUtils.getEmptyOptions();
        }

        const optionList = OptionsListUtils.getValidOptions(
            {
                reports: options.reports,
                personalDetails: options.personalDetails,
            },
            {
                betas,
                excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
                action,
            },
        );

        const orderedOptions = OptionsListUtils.orderOptions(optionList);

        return {
            ...optionList,
            ...orderedOptions,
        };
    }, [action, areOptionsInitialized, betas, didScreenTransitionEnd, iouType, options.personalDetails, options.reports]);

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
            excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
            shouldAcceptName: true,
        });
        return newOptions;
    }, [areOptionsInitialized, defaultOptions, debouncedSearchTerm]);

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

        const formatResults = OptionsListUtils.formatSectionsFromSearchTerm(debouncedSearchTerm, [], chatOptions.recentReports, chatOptions.personalDetails, personalDetails, true);
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
        );

        return [newSections, headerMessage];
    }, [
        areOptionsInitialized,
        didScreenTransitionEnd,
        debouncedSearchTerm,
        chatOptions.recentReports,
        chatOptions.personalDetails,
        chatOptions.userToInvite,
        personalDetails,
        translate,
        cleanSearchTerm,
    ]);

    const selectAccountant = useCallback(
        (option: Accountant) => {
            onAccountantSelected(lodashPick(option, 'accountID', 'login'));
            onFinish();
        },
        [iouType, onAccountantSelected, onFinish],
    );

    const handleConfirmSelection = useCallback(
        (keyEvent?: GestureResponderEvent | KeyboardEvent, option?: Accountant) => {
            if (!option) {
                return;
            }

            selectAccountant(option);
        },
        [selectAccountant],
    );

    const showLoadingPlaceholder = useMemo(() => !areOptionsInitialized || !didScreenTransitionEnd, [areOptionsInitialized, didScreenTransitionEnd]);

    const optionLength = useMemo(() => {
        if (!areOptionsInitialized) {
            return 0;
        }
        return sections.reduce((acc, section) => acc + section.data.length, 0);
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
            shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
            onSelectRow={selectAccountant}
            shouldSingleExecuteRowSelect
            listEmptyContent={<EmptySelectionListContent contentType={iouType} />}
            headerMessage={header}
            showLoadingPlaceholder={showLoadingPlaceholder}
            isLoadingNewOptions={!!isSearchingForReports}
            shouldShowListEmptyContent={shouldShowListEmptyContent}
        />
    );
}

MoneyRequestAccountantSelector.displayName = 'MoneyRequestAccountantSelector';

export default memo(MoneyRequestAccountantSelector, (prevProps, nextProps) => prevProps.iouType === nextProps.iouType);
