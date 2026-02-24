import lodashPick from 'lodash/pick';
import React, {memo, useCallback, useEffect, useMemo} from 'react';
import type {GestureResponderEvent} from 'react-native';
import EmptySelectionListContent from '@components/EmptySelectionListContent';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import InviteMemberListItem from '@components/SelectionList/ListItem/InviteMemberListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useReportAttributes from '@hooks/useReportAttributes';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import memoize from '@libs/memoize';
import {
    filterAndOrderOptions,
    formatSectionsFromSearchTerm,
    getEmptyOptions,
    getHeaderMessage,
    getParticipantsOption,
    getPolicyExpenseReportOption,
    getValidOptions,
    isCurrentUser,
    orderOptions,
} from '@libs/OptionsListUtils';
import type {SelectionListSections} from '@libs/OptionsListUtils/types';
import {searchInServer} from '@userActions/Report';
import type {IOUAction, IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Accountant} from '@src/types/onyx/IOU';

const memoizedGetValidOptions = memoize(getValidOptions, {maxSize: 5, monitoringName: 'MoneyRequestAccountantSelector.getValidOptions'});

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
    const {didScreenTransitionEnd} = useScreenWrapperTransitionStatus();
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false});
    const {options, areOptionsInitialized} = useOptionsList({
        shouldInitialize: didScreenTransitionEnd,
    });
    const offlineMessage: string = isOffline ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : '';
    const reportAttributesDerived = useReportAttributes();
    const [draftComments] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT);
    const [nvpDismissedProductTraining] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING);
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserEmail = currentUserPersonalDetails.email ?? '';
    const currentUserAccountID = currentUserPersonalDetails.accountID;
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

    useEffect(() => {
        searchInServer(debouncedSearchTerm.trim());
    }, [debouncedSearchTerm]);

    const defaultOptions = useMemo(() => {
        if (!areOptionsInitialized || !didScreenTransitionEnd) {
            getEmptyOptions();
        }

        const optionList = memoizedGetValidOptions(
            {
                reports: options.reports,
                personalDetails: options.personalDetails,
            },
            allPolicies,
            draftComments,
            nvpDismissedProductTraining,
            loginList,
            currentUserAccountID,
            currentUserEmail,
            {
                betas,
                excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
                action,
                personalDetails,
            },
            countryCode,
        );

        const orderedOptions = orderOptions(optionList);

        return {
            ...optionList,
            ...orderedOptions,
        };
    }, [
        areOptionsInitialized,
        didScreenTransitionEnd,
        options.reports,
        options.personalDetails,
        allPolicies,
        draftComments,
        nvpDismissedProductTraining,
        loginList,
        betas,
        action,
        countryCode,
        currentUserAccountID,
        currentUserEmail,
        personalDetails,
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
        const newOptions = filterAndOrderOptions(defaultOptions, debouncedSearchTerm, countryCode, loginList, currentUserEmail, currentUserAccountID, personalDetails, {
            excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
        });
        return newOptions;
    }, [areOptionsInitialized, defaultOptions, debouncedSearchTerm, countryCode, loginList, currentUserAccountID, currentUserEmail, personalDetails]);

    /**
     * Returns the sections needed for the OptionsSelector
     */
    const [sections, header] = useMemo(() => {
        const newSections: SelectionListSections = [];
        if (!areOptionsInitialized || !didScreenTransitionEnd) {
            return [newSections, ''];
        }
        const fiveRecents = [...chatOptions.recentReports].slice(0, 5);
        const restOfRecents = [...chatOptions.recentReports].slice(5);
        const contactsWithRestOfRecents = [...restOfRecents, ...chatOptions.personalDetails];

        const formatResults = formatSectionsFromSearchTerm(
            debouncedSearchTerm,
            [],
            chatOptions.recentReports,
            chatOptions.personalDetails,
            currentUserAccountID,
            personalDetails,
            true,
            undefined,
            reportAttributesDerived,
        );
        newSections.push({...formatResults.section, sectionIndex: 0});

        newSections.push({
            title: translate('common.recents'),
            data: fiveRecents,
            sectionIndex: 1,
        });

        newSections.push({
            title: translate('common.contacts'),
            data: contactsWithRestOfRecents,
            sectionIndex: 2,
        });

        if (
            chatOptions.userToInvite &&
            !isCurrentUser(
                {...chatOptions.userToInvite, accountID: chatOptions.userToInvite?.accountID ?? CONST.DEFAULT_NUMBER_ID, status: chatOptions.userToInvite?.status ?? undefined},
                loginList,
                currentUserEmail,
            )
        ) {
            newSections.push({
                data: [chatOptions.userToInvite].map((participant) => {
                    const isPolicyExpenseChat = participant?.isPolicyExpenseChat ?? false;
                    return isPolicyExpenseChat
                        ? getPolicyExpenseReportOption(participant, currentUserAccountID, personalDetails, reportAttributesDerived)
                        : getParticipantsOption(participant, personalDetails);
                }),
                sectionIndex: 3,
            });
        }

        const headerMessage = getHeaderMessage(
            (chatOptions.personalDetails ?? []).length + (chatOptions.recentReports ?? []).length !== 0,
            !!chatOptions?.userToInvite,
            debouncedSearchTerm.trim(),
            countryCode,
            false,
        );

        return [newSections, headerMessage];
    }, [
        areOptionsInitialized,
        didScreenTransitionEnd,
        chatOptions.recentReports,
        chatOptions.personalDetails,
        chatOptions.userToInvite,
        debouncedSearchTerm,
        personalDetails,
        reportAttributesDerived,
        translate,
        loginList,
        countryCode,
        currentUserAccountID,
        currentUserEmail,
    ]);

    const selectAccountant = useCallback(
        (option: Accountant) => {
            onAccountantSelected(lodashPick(option, 'accountID', 'login'));
            onFinish();
        },
        [onAccountantSelected, onFinish],
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

    const textInputOptions = {
        value: searchTerm,
        label: translate('selectionList.nameEmailOrPhoneNumber'),
        onChangeText: setSearchTerm,
        headerMessage: header,
        hint: offlineMessage,
    };

    return (
        <SelectionListWithSections
            sections={areOptionsInitialized ? sections : []}
            ListItem={InviteMemberListItem}
            shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
            onSelectRow={selectAccountant}
            confirmButtonOptions={{
                onConfirm: handleConfirmSelection,
            }}
            shouldShowTextInput
            shouldSingleExecuteRowSelect
            textInputOptions={textInputOptions}
            listEmptyContent={<EmptySelectionListContent contentType={iouType} />}
            showLoadingPlaceholder={showLoadingPlaceholder}
            isLoadingNewOptions={!!isSearchingForReports}
            showListEmptyContent={shouldShowListEmptyContent}
        />
    );
}

export default memo(MoneyRequestAccountantSelector, (prevProps, nextProps) => prevProps.iouType === nextProps.iouType);
