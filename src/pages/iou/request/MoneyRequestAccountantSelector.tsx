import reportsSelector from '@selectors/Attributes';
import lodashPick from 'lodash/pick';
import React, {memo, useCallback, useEffect, useMemo} from 'react';
import type {GestureResponderEvent} from 'react-native';
import EmptySelectionListContent from '@components/EmptySelectionListContent';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
// eslint-disable-next-line no-restricted-imports
import SelectionList from '@components/SelectionListWithSections';
import InviteMemberListItem from '@components/SelectionListWithSections/InviteMemberListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePrivateIsArchivedMap from '@hooks/usePrivateIsArchivedMap';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import memoize from '@libs/memoize';
import type {Section} from '@libs/OptionsListUtils';
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
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const [betas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: false});
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});
    const {options, areOptionsInitialized} = useOptionsList({
        shouldInitialize: didScreenTransitionEnd,
    });
    const offlineMessage: string = isOffline ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : '';
    const [reportAttributesDerived] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {canBeMissing: true, selector: reportsSelector});
    const [draftComments] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT, {canBeMissing: true});
    const [nvpDismissedProductTraining] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {canBeMissing: true});
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST, {canBeMissing: true});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const privateIsArchivedMap = usePrivateIsArchivedMap();

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
            {
                betas,
                excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
                action,
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
        const newOptions = filterAndOrderOptions(defaultOptions, debouncedSearchTerm, countryCode, loginList, {
            excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
        });
        return newOptions;
    }, [areOptionsInitialized, defaultOptions, debouncedSearchTerm, countryCode, loginList]);

    /**
     * Returns the sections needed for the OptionsSelector
     */
    const [sections, header] = useMemo(() => {
        const newSections: Section[] = [];
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
            privateIsArchivedMap[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${chatOptions.recentReports.at(0)?.reportID}`],
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
            !isCurrentUser(
                {...chatOptions.userToInvite, accountID: chatOptions.userToInvite?.accountID ?? CONST.DEFAULT_NUMBER_ID, status: chatOptions.userToInvite?.status ?? undefined},
                loginList,
            )
        ) {
            newSections.push({
                title: undefined,
                data: [chatOptions.userToInvite].map((participant) => {
                    const isPolicyExpenseChat = participant?.isPolicyExpenseChat ?? false;
                    const privateIsArchived = privateIsArchivedMap[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${participant?.reportID}`];
                    return isPolicyExpenseChat ? getPolicyExpenseReportOption(participant, privateIsArchived, reportAttributesDerived) : getParticipantsOption(participant, personalDetails);
                }),
                shouldShow: true,
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
        privateIsArchivedMap,
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

export default memo(MoneyRequestAccountantSelector, (prevProps, nextProps) => prevProps.iouType === nextProps.iouType);
