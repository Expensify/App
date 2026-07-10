import Button from '@components/Button';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import ReferralProgramCTA from '@components/ReferralProgramCTA';
import ScreenWrapper from '@components/ScreenWrapper';
import ListCheckbox from '@components/SelectionList/components/ListCheckbox';
import BareUserListItem from '@components/SelectionList/ListItem/BareUserListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {Section} from '@components/SelectionList/SelectionListWithSections/types';
import type {ListItem, SelectionListWithSectionsHandle} from '@components/SelectionList/types';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDismissedReferralBanners from '@hooks/useDismissedReferralBanners';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useSearchSelector from '@hooks/useSearchSelector';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';

import {navigateToAndOpenReport, searchInServer, setGroupDraft} from '@libs/actions/Report';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import {getHeaderMessage} from '@libs/OptionsListUtils';
import {doesPersonalDetailMatchSearchTerm} from '@libs/OptionsListUtils/searchMatchUtils';
import type {OptionWithKey} from '@libs/OptionsListUtils/types';
import type {OptionData} from '@libs/ReportUtils';
import {expensifyLoginsSelector} from '@libs/UserUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SelectedParticipant} from '@src/types/onyx/NewGroupChatDraft';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import KeyboardUtils from '@src/utils/keyboard';

import type {Ref} from 'react';

import {useFocusEffect} from '@react-navigation/native';
import {hasSeenTourSelector} from '@selectors/Onboarding';
import React, {useEffect, useImperativeHandle, useRef, useState} from 'react';
import {Keyboard} from 'react-native';

import useGroupChatDraftParticipantSync from './useGroupChatDraftParticipantSync';

const excludedGroupEmails = new Set<string>(CONST.EXPENSIFY_EMAILS.filter((value) => value !== CONST.EMAIL.CONCIERGE));

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
    const styles = useThemeStyles();
    const personalData = useCurrentUserPersonalDetails();
    const currentUserAccountID = personalData.accountID;
    const currentUserEmail = personalData.email ?? '';
    const {top} = useSafeAreaInsets();
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.RAM_ONLY_IS_SEARCHING_FOR_REPORTS);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [loginList] = useOnyx(ONYXKEYS.LOGINS, {selector: expensifyLoginsSelector});
    const selectionListRef = useRef<SelectionListWithSectionsHandle | null>(null);
    const allPersonalDetails = usePersonalDetails();
    const {singleExecution} = useSingleExecution();

    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [didScreenTransitionEnd, setDidScreenTransitionEnd] = useState(false);

    useImperativeHandle(ref, () => ({
        focus: selectionListRef.current?.focusTextInput,
    }));

    // Persist the current selection (plus the creator) to the group chat draft so an in-progress group survives navigation/reload.
    const updateGroupDraft = (newSelectedOptions: OptionData[]) => {
        if (!personalData?.login || !personalData?.accountID) {
            return;
        }
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
    };

    const {searchTerm, debouncedSearchTerm, setSearchTerm, availableOptions, selectedOptions, setSelectedOptions, toggleSelection, areOptionsInitialized, onListEndReached} =
        useSearchSelector({
            selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
            searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
            includeUserToInvite: true,
            includeSelfDM: true,
            maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
            enablePhoneContacts: true,
            // Keep selected options in place (marked with isSelected) so they stay put when toggled instead of jumping to a separate section.
            shouldKeepSelectedInAvailableOptions: true,
            shouldInitialize: didScreenTransitionEnd,
            onSelectionChange: updateGroupDraft,
            getValidOptionsConfig: {
                includeP2P: true,
                shouldAlwaysIncludeDM: true,
            },
        });

    useGroupChatDraftParticipantSync(areOptionsInitialized, allPersonalDetails, loginList, currentUserEmail, currentUserAccountID, translate, selectedOptions, setSelectedOptions);

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

    const {userToInvite, personalDetails, recentReports} = availableOptions;

    const cleanSearchTerm = debouncedSearchTerm.trim().toLowerCase();
    const headerMessage = getHeaderMessage(
        personalDetails.length + recentReports.length !== 0,
        !!userToInvite,
        debouncedSearchTerm.trim(),
        countryCode,
        selectedOptions.some((participant) => doesPersonalDetailMatchSearchTerm(participant, currentUserAccountID, cleanSearchTerm)),
    );

    // Selected rows are marked in place by the hook (isSelected), so the checkmark stays with the row instead of jumping to the top.
    // In group selection mode the self DM stays visible (so the list doesn't shift and jump the scroll position) but is made non-selectable.
    const recentReportsData = selectedOptions.length ? recentReports.map((option) => (option.isSelfDM ? {...option, isDisabled: true} : option)) : recentReports;

    const sections: Array<Section<OptionWithKey>> = [];

    // Existing selected users are already marked in place within Recents/Contacts (and remain reachable in the paginated list),
    // so they don't need a separate row here. A selected non-existing user (an invited contact created from the search term)
    // has no row in recents/contacts and disappears once the search input is cleared, so surface only those in a top section
    // to keep them visible and easy to deselect. The one already shown as the current invite row is excluded to avoid a duplicate.
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
        selectionListRef.current?.clearInputAfterSelect();
        if (!canUseTouchScreen()) {
            selectionListRef.current?.focusTextInput();
        }
        // The row item is a fully-built option coming from the search selector, so it is safe to treat it as an OptionData.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        toggleSelection(option as OptionData);
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
            singleExecution(() => navigateToAndOpenReport([login], allPersonalDetails, currentUserAccountID, introSelected, isSelfTourViewed, betas))();
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
                onEndReached={onListEndReached}
                onEndReachedThreshold={0.75}
                disableMaintainingScrollPosition
                addBottomSafeAreaPadding
            />
        </ScreenWrapper>
    );
}

export default NewChatPage;
