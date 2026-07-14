import useInitialSelection from '@hooks/useInitialSelection';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalDetailSearchSelector from '@hooks/usePersonalDetailSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';

import {searchUserInServer} from '@libs/actions/Report';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import {filterOption, getHeaderMessage} from '@libs/PersonalDetailOptionsListUtils';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Participant} from '@src/types/onyx/IOU';
import type {BaseVacationDelegate} from '@src/types/onyx/VacationDelegate';

import {Str} from 'expensify-common';
import React, {useEffect} from 'react';
import {View} from 'react-native';

import FullPageOfflineBlockingView from './BlockingViews/FullPageOfflineBlockingView';
import DelegatorList from './DelegatorList';
import HeaderWithBackButton from './HeaderWithBackButton';
import UserListItem from './SelectionList/ListItem/UserListItem';
import SelectionList from './SelectionList/SelectionListWithSections';

/** Returns the row subtitle as the localized phone form for phone delegates, or `fallback`/login for emails. */
function getDelegateAlternateText(login: string | undefined, fallback: string | undefined): string {
    const formattedLogin = formatPhoneNumber(login ?? '');
    if (formattedLogin) {
        return formattedLogin;
    }
    return fallback ?? '';
}

type BaseVacationDelegateSelectionComponentProps = {
    /** Current vacation delegate */
    vacationDelegate?: BaseVacationDelegate;

    /** Callback when a row is selected */
    onSelectRow: (option: Participant) => void;

    /** Title for the header */
    headerTitle: string;

    /** Function to call when the back button is pressed */
    onBackButtonPress?: () => void;

    /** Message to display when the user can't set a vacation delegate */
    cannotSetDelegateMessage: string;

    /** Additional logins to exclude from the list */
    additionalExcludeLogins?: Record<string, boolean>;

    /** Whether to include the current user in the list */
    includeCurrentUser?: boolean;
};

function BaseVacationDelegateSelectionComponent({
    vacationDelegate,
    onSelectRow,
    headerTitle,
    onBackButtonPress,
    cannotSetDelegateMessage,
    additionalExcludeLogins,
    includeCurrentUser = true,
}: BaseVacationDelegateSelectionComponentProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.RAM_ONLY_IS_SEARCHING_FOR_REPORTS);

    const currentVacationDelegate = vacationDelegate?.delegate ?? '';
    const initialVacationDelegate = useInitialSelection(currentVacationDelegate || undefined, {resetOnFocus: true});
    const hasActiveDelegations = !!vacationDelegate?.delegatorFor?.length;

    const excludeLogins = {
        ...CONST.EXPENSIFY_EMAILS_OBJECT,
        ...additionalExcludeLogins,
    };

    const {searchTerm, debouncedSearchTerm, setSearchTerm, availableOptions, areOptionsInitialized} = usePersonalDetailSearchSelector({
        selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_SINGLE,
        maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
        excludeLogins,
        includeUserToInvite: true,
        includeRecentReports: true,
        includeCurrentUser,
    });

    useEffect(() => {
        searchUserInServer(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    const searchValue = debouncedSearchTerm.trim().toLowerCase();
    const pinnedVacationDelegate = searchValue ? currentVacationDelegate : (initialVacationDelegate ?? currentVacationDelegate);
    const pinnedDelegatePersonalDetails = getPersonalDetailByEmail(pinnedVacationDelegate);
    const pinnedDelegateLogin = pinnedDelegatePersonalDetails?.login ?? pinnedVacationDelegate;

    // Pin the current delegate even when personal details are missing (e.g. right after a cache
    // clear). Without this fallback the pinned row would be dropped entirely — the raw login and
    // DEFAULT_MISSING_ID keep the previously selected delegate visible on the page.
    const pinnedDelegateOption = pinnedVacationDelegate
        ? {
              ...(pinnedDelegatePersonalDetails ?? {}),
              text: Str.removeSMSDomain(pinnedDelegatePersonalDetails?.displayName ?? pinnedVacationDelegate),
              alternateText: pinnedDelegateLogin,
              login: pinnedDelegateLogin,
              keyForList: `vacationDelegate-${pinnedDelegateLogin}`,
              isDisabled: false,
              isSelected: pinnedVacationDelegate === currentVacationDelegate,
              shouldShowSubscript: undefined,
              accountID: pinnedDelegatePersonalDetails?.accountID ?? CONST.DEFAULT_MISSING_ID,
              icons: [
                  {
                      source: pinnedDelegatePersonalDetails?.avatar ?? icons.FallbackAvatar,
                      name: formatPhoneNumber(pinnedDelegateLogin),
                      type: CONST.ICON_TYPE_AVATAR,
                      id: pinnedDelegatePersonalDetails?.accountID ?? CONST.DEFAULT_MISSING_ID,
                  },
              ],
          }
        : undefined;

    const shouldShowPinnedVacationDelegate = !!pinnedDelegateOption && (!searchValue || !!filterOption(pinnedDelegateOption, debouncedSearchTerm));
    // Exclude the pinned delegate by both its raw delegate value and its resolved personal-details login.
    // Compare with the SMS domain stripped and lower-cased so a phone stored as `<phone>@expensify.sms`
    // still matches a freshly pasted `<phone>` (userToInvite), which would otherwise render the same
    // contact in both the pinned section and the recents/contacts/invite lists.
    const normalizeLoginForMatch = (login: string | undefined) => Str.removeSMSDomain(login ?? '').toLowerCase();
    const pinnedLogins =
        shouldShowPinnedVacationDelegate && pinnedVacationDelegate ? new Set([normalizeLoginForMatch(pinnedVacationDelegate), normalizeLoginForMatch(pinnedDelegateLogin)]) : undefined;
    const isPinnedDelegateLogin = (login: string | undefined) => !!pinnedLogins?.has(normalizeLoginForMatch(login));
    const filterPinnedVacationDelegateFromOptions = (options: typeof availableOptions.recentOptions) => {
        if (!pinnedLogins) {
            return options;
        }
        return options.filter((option) => !isPinnedDelegateLogin(option.login));
    };

    const sectionsList = [];

    if (pinnedDelegateOption && shouldShowPinnedVacationDelegate) {
        sectionsList.push({
            title: undefined,
            sectionIndex: 0,
            data: [pinnedDelegateOption],
        });
    }

    const recentOptions = filterPinnedVacationDelegateFromOptions(availableOptions.recentOptions);
    if (recentOptions.length) {
        sectionsList.push({
            title: translate('common.recents'),
            sectionIndex: 1,
            data: recentOptions,
        });
    }

    const personalDetails = filterPinnedVacationDelegateFromOptions(availableOptions.personalDetails);
    if (personalDetails.length) {
        sectionsList.push({
            title: translate('common.contacts'),
            sectionIndex: 2,
            data: personalDetails,
        });
    }

    // Skip the invite row when it resolves to the pinned delegate. Otherwise, right after selecting a
    // freshly pasted number, it briefly renders in both the pinned section and the invite section
    // (the search term clears on a debounce, so both can be present for one render).
    if (availableOptions.userToInvite && !isPinnedDelegateLogin(availableOptions.userToInvite.login)) {
        sectionsList.push({
            title: undefined,
            sectionIndex: 3,
            data: [availableOptions.userToInvite],
        });
    }

    const sections = sectionsList.map((section) => ({
        ...section,
        data: (section.data ?? []).map((option) => ({
            ...option,
            text: option.text ?? '',
            alternateText: getDelegateAlternateText(option.login, option.alternateText),
            keyForList: option.keyForList ?? '',
            isDisabled: option.isDisabled ?? undefined,
            isSelected: option.login === currentVacationDelegate,
            login: option.login ?? undefined,
            shouldShowSubscript: undefined,
        })),
    }));

    const headerMessage = (() => {
        if (sections.length > 0) {
            return '';
        }
        return getHeaderMessage(translate, searchValue, countryCode);
    })();

    const textInputOptions = {
        value: searchTerm,
        onChangeText: setSearchTerm,
        label: translate('selectionList.nameEmailOrPhoneNumber'),
        headerMessage,
    };

    return (
        <>
            <HeaderWithBackButton
                title={headerTitle}
                onBackButtonPress={onBackButtonPress}
            />
            <FullPageOfflineBlockingView>
                {hasActiveDelegations ? (
                    <View style={styles.mt6}>
                        <DelegatorList
                            delegators={vacationDelegate?.delegatorFor}
                            message={cannotSetDelegateMessage}
                        />
                    </View>
                ) : (
                    <View style={[styles.flex1, styles.w100, styles.pRelative]}>
                        <SelectionList
                            sections={areOptionsInitialized ? sections : []}
                            ListItem={UserListItem}
                            onSelectRow={(item) => {
                                // Clear search to prevent "No results found" after selection
                                setSearchTerm('');

                                onSelectRow(item);
                            }}
                            textInputOptions={textInputOptions}
                            shouldShowLoadingPlaceholder={!areOptionsInitialized}
                            isLoadingNewOptions={!!isSearchingForReports}
                            searchValueForFocusSync={debouncedSearchTerm}
                            initiallyFocusedItemKey={initialVacationDelegate ? `vacationDelegate-${pinnedDelegateLogin}` : undefined}
                            initialScrollIndex={0}
                            shouldUpdateFocusedIndex
                            shouldSingleExecuteRowSelect
                            shouldShowTextInput
                        />
                    </View>
                )}
            </FullPageOfflineBlockingView>
        </>
    );
}

export default BaseVacationDelegateSelectionComponent;
