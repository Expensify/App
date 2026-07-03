import Button from '@components/Button';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import ReferralProgramCTA from '@components/ReferralProgramCTA';
import ScreenWrapper from '@components/ScreenWrapper';
import ListCheckbox from '@components/SelectionList/components/ListCheckbox';
import BareUserListItem from '@components/SelectionList/ListItem/BareUserListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {Section} from '@components/SelectionList/SelectionListWithSections/types';
import type {ListItem, SelectionListWithSectionsHandle} from '@components/SelectionList/types';

import useContactImport from '@hooks/useContactImport';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useDismissedReferralBanners from '@hooks/useDismissedReferralBanners';
import useFilteredOptions from '@hooks/useFilteredOptions';
import useIsFocusedRef from '@hooks/useIsFocusedRef';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedData from '@hooks/usePaginatedData';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useSingleExecution from '@hooks/useSingleExecution';
import useSortedActions from '@hooks/useSortedActions';
import useThemeStyles from '@hooks/useThemeStyles';

import {navigateToAndOpenReport, searchInServer, setGroupDraft} from '@libs/actions/Report';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import {filterAndOrderOptions, getHeaderMessage, getValidOptions} from '@libs/OptionsListUtils';
import {doesPersonalDetailMatchSearchTerm} from '@libs/OptionsListUtils/searchMatchUtils';
import type {OptionWithKey} from '@libs/OptionsListUtils/types';
import type {OptionData} from '@libs/ReportUtils';
import {expensifyLoginsSelector} from '@libs/UserUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ReportAttributesDerivedValue} from '@src/types/onyx/DerivedValues';
import type {SelectedParticipant} from '@src/types/onyx/NewGroupChatDraft';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import KeyboardUtils from '@src/utils/keyboard';

import type {Ref} from 'react';

import {useFocusEffect} from '@react-navigation/native';
import {guidedSetupAndTourStatusSelector} from '@selectors/Onboarding';
import passthroughPolicyTagListSelector from '@selectors/PolicyTagList';
import reject from 'lodash/reject';
import React, {useEffect, useImperativeHandle, useRef, useState} from 'react';
import {Keyboard} from 'react-native';

import type SelectedOption from './types';

import mergeAndSortPersonalDetailsWithContacts from './mergeAndSortPersonalDetailsWithContacts';
import useGroupChatDraftParticipantSync from './useGroupChatDraftParticipantSync';

const excludedGroupEmails = new Set<string>(CONST.EXPENSIFY_EMAILS.filter((value) => value !== CONST.EMAIL.CONCIERGE));
const PAGINATION_SIZE = CONST.MAX_SELECTION_LIST_PAGE_LENGTH;

function useOptions(reportAttributesDerived: ReportAttributesDerivedValue['reports'] | undefined) {
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [loginList] = useOnyx(ONYXKEYS.LOGINS, {selector: expensifyLoginsSelector});
    const personalData = useCurrentUserPersonalDetails();
    const currentUserAccountID = personalData.accountID;
    const currentUserEmail = personalData.email ?? '';
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [didScreenTransitionEnd, setDidScreenTransitionEnd] = useState(false);
    const {contacts} = useContactImport();
    const [draftComments] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT);
    const allPersonalDetails = usePersonalDetails();
    const isScreenFocusedRef = useIsFocusedRef();
    const sortedActions = useSortedActions();
    const [allPolicyTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS, {selector: passthroughPolicyTagListSelector});
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    const isSearching = !!debouncedSearchTerm.trim();

    const {
        options: listOptions,
        isLoading,
        loadMore: loadMoreReports,
        hasMore: hasMoreFilteredOptions,
    } = useFilteredOptions({
        maxRecentReports: 500,
        enabled: didScreenTransitionEnd,
        includeP2P: true,
        batchSize: 100,
        enablePagination: true,
        isSearching,
        betas,
    });

    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

    const reports = listOptions?.reports ?? [];

    const allPersonalDetailOptions = listOptions?.personalDetails ?? [];

    // Dedupe and sort the union of Onyx personal details and imported contacts so pagination uses an alphabetical prefix.
    const sortedPersonalDetailOptionsWithContacts = mergeAndSortPersonalDetailsWithContacts(allPersonalDetailOptions, contacts);

    // usePaginatedData resets to page 1 whenever resetKey changes. Encode browse and search as "false" and "true", respectively,
    // so that we only reset when the user enters or leaves search, not on every debounced keystroke.
    const browsePaginationResetKey = String(isSearching);

    // Limits raw personal details entering getValidOptions to reduce processing cost on initial load.
    // Bypassed during search to avoid repeatedly calling loadMore and prevent FlashList onEndReached infinite loop.
    const {
        paginatedData: personalDetails,
        loadMore: loadMorePersonalDetails,
        hasMore: hasMorePersonalDetails,
    } = usePaginatedData(sortedPersonalDetailOptionsWithContacts, PAGINATION_SIZE, {
        resetKey: browsePaginationResetKey,
        skipPagination: isSearching,
    });

    useGroupChatDraftParticipantSync(allPersonalDetailOptions, !isLoading, allPersonalDetails, loginList, currentUserEmail, currentUserAccountID, selectedOptions, setSelectedOptions);

    const {options: defaultOptions} = getValidOptions(
        {
            reports,
            personalDetails,
        },
        allPolicies,
        draftComments,
        loginList,
        currentUserAccountID,
        currentUserEmail,
        conciergeReportID,
        {
            betas: betas ?? [],
            includeSelfDM: true,
            shouldAlwaysIncludeDM: true,
            personalDetails: allPersonalDetails,
            allPolicyTags,
            countryCode,
            reportAttributesDerived,
            sortedActions,
            selectedOptions,
            includeSelectedOptions: true,
        },
    );

    const areOptionsInitialized = !isLoading;

    // Keep selected options in the list (don't filter them out) so they stay in place when toggled, rather than jumping to a separate section at the top.
    const options = filterAndOrderOptions(defaultOptions, debouncedSearchTerm, countryCode, loginList, currentUserEmail, currentUserAccountID, allPersonalDetails, {
        selectedOptions,
        maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
    });

    const cleanSearchTerm = debouncedSearchTerm.trim().toLowerCase();

    // Visual pagination — limits how many filtered personal details are passed to FlashList at once.
    const {
        paginatedData: paginatedFilteredPersonalDetails,
        loadMore: loadMoreFilteredPersonalDetails,
        hasMore: hasMoreFilteredPersonalDetails,
    } = usePaginatedData(options.personalDetails, PAGINATION_SIZE, {resetKey: cleanSearchTerm, skipPagination: !isSearching});

    const headerMessage = getHeaderMessage(
        options.personalDetails.length + options.recentReports.length !== 0,
        !!options.userToInvite,
        debouncedSearchTerm.trim(),
        countryCode,
        selectedOptions.some((participant) => doesPersonalDetailMatchSearchTerm(participant, currentUserAccountID, cleanSearchTerm)),
    );

    useFocusEffect(() => {
        focusTimeoutRef.current = setTimeout(() => {
            setDidScreenTransitionEnd(true);
        }, CONST.ANIMATED_TRANSITION);

        return () => focusTimeoutRef.current && clearTimeout(focusTimeoutRef.current);
    });

    useEffect(() => {
        if (!debouncedSearchTerm.length) {
            return;
        }

        searchInServer(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    const handleEndReached = () => {
        const hasNoDataToLoad = !hasMoreFilteredPersonalDetails && !hasMorePersonalDetails && !hasMoreFilteredOptions;
        if (hasNoDataToLoad || !areOptionsInitialized || !isScreenFocusedRef.current) {
            return;
        }

        if (hasMoreFilteredPersonalDetails) {
            loadMoreFilteredPersonalDetails();
        }

        if (hasMorePersonalDetails) {
            loadMorePersonalDetails();
        }

        if (options.recentReports.length < CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW && hasMoreFilteredOptions) {
            loadMoreReports();
        }
    };

    return {
        ...options,
        personalDetails: paginatedFilteredPersonalDetails,
        searchTerm,
        debouncedSearchTerm,
        setSearchTerm,
        areOptionsInitialized,
        selectedOptions,
        setSelectedOptions,
        headerMessage,
        handleEndReached,
    };
}

type NewChatPageRef = {
    focus?: () => void;
};

type NewChatPageProps = {
    /** Reference to the outer element */
    ref?: Ref<NewChatPageRef>;
};
function NewChatPage({ref}: NewChatPageProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to show offline indicator on small screen only

    const styles = useThemeStyles();
    const personalData = useCurrentUserPersonalDetails();
    const currentUserAccountID = personalData.accountID;
    const {top} = useSafeAreaInsets();
    const [isSearchingForReports] = useOnyx(ONYXKEYS.RAM_ONLY_IS_SEARCHING_FOR_REPORTS);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [guidedSetupAndTourStatus] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: guidedSetupAndTourStatusSelector});
    const selectionListRef = useRef<SelectionListWithSectionsHandle | null>(null);
    const allPersonalDetails = usePersonalDetails();

    const [reportAttributesDerivedFull] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);

    const reportAttributesDerived = reportAttributesDerivedFull?.reports;

    const {singleExecution} = useSingleExecution();

    useImperativeHandle(ref, () => ({
        focus: selectionListRef.current?.focusTextInput,
    }));

    const {
        headerMessage,
        searchTerm,
        debouncedSearchTerm,
        handleEndReached,
        setSearchTerm,
        selectedOptions,
        setSelectedOptions,
        recentReports,
        personalDetails,
        userToInvite,
        areOptionsInitialized,
    } = useOptions(reportAttributesDerived);

    // Selected rows are marked in place by getValidOptions (isSelected), so the checkmark stays with the row instead of jumping to the top.
    // In group selection mode the self DM stays visible (so the list doesn't shift and jump the scroll position) but is made non-selectable.
    const recentReportsData = selectedOptions.length ? recentReports.map((option) => (option.isSelfDM ? {...option, isDisabled: true} : option)) : recentReports;

    const sections: Array<Section<OptionWithKey>> = [];

    // Existing selected users are already marked in place within Recents/Contacts (and remain reachable in the paginated list),
    // so they don't need a separate row here. A selected non-existing user (an invited contact created from the search term)
    // has no row in recents/contacts and disappears once the search input is cleared, so surface only those in a top section
    // to keep them visible and easy to deselect. The one already shown as the current invite row is excluded to avoid a duplicate.
    const cleanSearchTerm = debouncedSearchTerm.trim().toLowerCase();
    const selectedSection = selectedOptions.filter(
        (option) =>
            !!option.isOptimisticAccount && !(userToInvite && option.login === userToInvite.login) && doesPersonalDetailMatchSearchTerm(option, currentUserAccountID, cleanSearchTerm),
    );

    if (selectedSection.length) {
        sections.push({
            title: undefined,
            data: selectedSection,
            sectionIndex: 0,
        });
    }

    sections.push({
        title: translate('common.recents'),
        data: recentReportsData,
        sectionIndex: 1,
    });

    sections.push({
        title: translate('common.contacts'),
        data: personalDetails,
        sectionIndex: 2,
    });

    if (userToInvite) {
        sections.push({
            title: undefined,
            data: [userToInvite],
            sectionIndex: 3,
        });
    }

    /**
     * Removes a selected option from list if already selected. If not already selected add this option to the list.
     */
    const toggleOption = (option: ListItem & Partial<OptionData>) => {
        const isOptionInList = !!option.isSelected;

        let newSelectedOptions: SelectedOption[];

        if (isOptionInList) {
            newSelectedOptions = reject(selectedOptions, (selectedOption) => selectedOption.login === option.login);
        } else {
            newSelectedOptions = [...selectedOptions, {...option, isSelected: true, reportID: option.reportID, keyForList: `${option.keyForList ?? option.reportID}`}];
        }

        selectionListRef.current?.clearInputAfterSelect();
        if (!canUseTouchScreen()) {
            selectionListRef.current?.focusTextInput();
        }
        setSelectedOptions(newSelectedOptions);

        if (personalData?.login && personalData?.accountID) {
            const participants: SelectedParticipant[] = [
                ...newSelectedOptions.map((selectedOption) => ({
                    login: selectedOption.login,
                    accountID: selectedOption.accountID ?? CONST.DEFAULT_NUMBER_ID,
                })),
                {
                    login: personalData.login,
                    accountID: personalData.accountID,
                },
            ];
            setGroupDraft({participants});
        }
    };

    /**
     * If there are selected options already then it will toggle the option otherwise
     * creates a new 1:1 chat with the option and the current user,
     * or navigates to the existing chat if one with those participants already exists.
     */
    const selectOption = (option?: OptionWithKey) => {
        if (option?.isSelfDM) {
            if (!option.reportID) {
                Navigation.dismissModal();
                return;
            }
            Navigation.dismissModalWithReport({reportID: option.reportID});
            return;
        }

        if (selectedOptions.length && option) {
            // Prevent excluded emails from being added to groups
            if (option?.login && excludedGroupEmails.has(option.login)) {
                return;
            }
            toggleOption(option);
            return;
        }

        if (option?.reportID) {
            Navigation.dismissModal({
                afterTransition: () => {
                    Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(option?.reportID));
                },
            });
            return;
        }

        let login = '';

        if (option?.login) {
            login = option.login;
        } else if (selectedOptions.length === 1) {
            login = selectedOptions.at(0)?.login ?? '';
        }
        if (!login) {
            Log.warn('Tried to create chat with empty login');
            return;
        }
        KeyboardUtils.dismiss().then(() => {
            singleExecution(() =>
                navigateToAndOpenReport(
                    [login],
                    allPersonalDetails,
                    currentUserAccountID,
                    introSelected,
                    guidedSetupAndTourStatus?.isSelfTourViewed,
                    guidedSetupAndTourStatus?.hasCompletedGuidedSetupFlow,
                    betas,
                ),
            )();
        });
    };

    const itemRightSideComponent = (item: OptionWithKey, isFocused?: boolean) => {
        if (item.isSelfDM) {
            return null;
        }

        if (item.isSelected) {
            return (
                <ListCheckbox
                    item={item}
                    onSelectRow={toggleOption}
                    disabled={!!item.isDisabled}
                    accessibilityLabel={item.text ? translate('selectionList.userSelected', item.text) : ''}
                    style={styles.ml5}
                />
            );
        }

        // "Add to group" only makes sense for eligible (login-bearing, non-excluded) users
        if (!item.login || excludedGroupEmails.has(item.login)) {
            return null;
        }

        const buttonInnerStyles = isFocused ? styles.buttonDefaultHovered : {};
        return (
            <Button
                onPress={() => toggleOption(item)}
                style={[styles.pl2]}
                text={translate('newChatPage.addToGroup')}
                accessibilityLabel={item.text ? translate('newChatPage.addUserToGroup', item.text) : ''}
                innerStyles={buttonInnerStyles}
                small
            />
        );
    };

    const createGroup = () => {
        if (!personalData?.login || !personalData.accountID) {
            return;
        }
        const selectedParticipants: SelectedParticipant[] = selectedOptions.map((option) => ({
            login: option?.login,
            accountID: option.accountID ?? CONST.DEFAULT_NUMBER_ID,
        }));
        const logins = [...selectedParticipants, {login: personalData.login, accountID: personalData.accountID}];
        setGroupDraft({participants: logins});
        Keyboard.dismiss();
        Navigation.navigate(ROUTES.NEW_CHAT_CONFIRM);
    };
    const {isDismissed} = useDismissedReferralBanners({referralContentType: CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT});

    const footerContent = (!isDismissed || selectedOptions.length > 0) && (
        <>
            <ReferralProgramCTA
                referralContentType={CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT}
                style={selectedOptions.length ? styles.mb5 : undefined}
            />

            {!!selectedOptions.length && (
                <Button
                    success
                    large
                    text={translate('common.next')}
                    onPress={createGroup}
                    pressOnEnter
                />
            )}
        </>
    );

    const textInputOptions = {
        label: translate('selectionList.nameEmailOrPhoneNumber'),
        hint: isOffline ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : '',
        value: searchTerm,
        onChangeText: setSearchTerm,
        headerMessage,
        disableAutoFocus: true,
        shouldInterceptSwipe: true,
    };

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            includePaddingTop={false}
            shouldEnablePickerAvoiding={false}
            disableOfflineIndicatorSafeAreaPadding
            shouldShowOfflineIndicator={false}
            keyboardVerticalOffset={variables.contentHeaderHeight + top + variables.tabSelectorButtonHeight + variables.tabSelectorButtonPadding}
            // Disable the focus trap of this page to activate the parent focus trap in `NewChatSelectorPage`.
            focusTrapSettings={{active: false}}
            testID="NewChatPage"
        >
            <SelectionListWithSections<OptionWithKey>
                ref={selectionListRef}
                ListItem={BareUserListItem}
                sections={areOptionsInitialized ? sections : getEmptyArray<Section<OptionWithKey>>()}
                onSelectRow={selectOption}
                shouldShowTextInput
                textInputOptions={textInputOptions}
                canSelectMultiple
                shouldPreventAutoScrollOnSelect
                shouldClearInputOnSelect={false}
                shouldUpdateFocusedIndex
                shouldSingleExecuteRowSelect
                confirmButtonOptions={{
                    onConfirm: (e, option) => (selectedOptions.length > 0 ? createGroup() : selectOption(option)),
                }}
                rightHandSideComponent={itemRightSideComponent}
                footerContent={footerContent}
                shouldShowLoadingPlaceholder={!areOptionsInitialized}
                shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                isLoadingNewOptions={!!isSearchingForReports}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.75}
                disableMaintainingScrollPosition
                addBottomSafeAreaPadding
            />
        </ScreenWrapper>
    );
}

export default NewChatPage;
