import {Str} from 'expensify-common';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalDetailSearchSelector from '@hooks/usePersonalDetailSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';
import {searchUserInServer} from '@libs/actions/Report';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import {filterOption, getHeaderMessage} from '@libs/PersonalDetailOptionsListUtils';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {parsePhoneNumber} from '@libs/PhoneNumber';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Participant} from '@src/types/onyx/IOU';
import type {BaseVacationDelegate} from '@src/types/onyx/VacationDelegate';
import FullPageOfflineBlockingView from './BlockingViews/FullPageOfflineBlockingView';
import DelegatorList from './DelegatorList';
import HeaderWithBackButton from './HeaderWithBackButton';
import UserListItem from './SelectionList/ListItem/UserListItem';
import SelectionList from './SelectionList/SelectionListWithSections';

/** Returns the row subtitle as the national phone form for phone delegates, or `fallback`/login for emails. */
function getDelegateAlternateText(login: string | undefined, fallback: string | undefined): string {
    const sanitizedLogin = Str.removeSMSDomain(login ?? '');
    if (sanitizedLogin) {
        const parsed = parsePhoneNumber(sanitizedLogin);
        if (parsed.valid && parsed.number?.national) {
            return parsed.number.national;
        }
    }
    return fallback ?? sanitizedLogin;
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
    const delegatePersonalDetails = getPersonalDetailByEmail(currentVacationDelegate);
    const hasActiveDelegations = !!vacationDelegate?.delegatorFor?.length;

    const excludeLogins = {
        ...CONST.EXPENSIFY_EMAILS_OBJECT,
        ...(currentVacationDelegate && {[currentVacationDelegate]: true}),
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

    const sectionsList = (() => {
        const list = [];

        const delegateLogin = delegatePersonalDetails?.login ?? currentVacationDelegate;
        const delegateOption = currentVacationDelegate
            ? {
                  ...(delegatePersonalDetails ?? {}),
                  text: Str.removeSMSDomain(delegatePersonalDetails?.displayName ?? currentVacationDelegate),
                  alternateText: delegateLogin,
                  login: delegateLogin,
                  keyForList: `vacationDelegate-${delegateLogin}`,
                  isDisabled: false,
                  isSelected: true,
                  shouldShowSubscript: undefined,
                  accountID: delegatePersonalDetails?.accountID ?? CONST.DEFAULT_MISSING_ID,
                  icons: [
                      {
                          source: delegatePersonalDetails?.avatar ?? icons.FallbackAvatar,
                          name: formatPhoneNumber(delegateLogin),
                          type: CONST.ICON_TYPE_AVATAR,
                          id: delegatePersonalDetails?.accountID ?? CONST.DEFAULT_MISSING_ID,
                      },
                  ],
              }
            : undefined;

        // Only pin the current delegate when it matches the search term, mirroring how the hook filters the other sections
        if (delegateOption && filterOption(delegateOption, debouncedSearchTerm)) {
            list.push({
                title: undefined,
                sectionIndex: 0,
                data: [delegateOption],
            });
        }

        if (availableOptions.recentOptions.length) {
            list.push({
                title: translate('common.recents'),
                sectionIndex: 1,
                data: availableOptions.recentOptions,
            });
        }

        if (availableOptions.personalDetails.length) {
            list.push({
                title: translate('common.contacts'),
                sectionIndex: 2,
                data: availableOptions.personalDetails,
            });
        }

        if (availableOptions.userToInvite) {
            list.push({
                title: undefined,
                sectionIndex: 3,
                data: [availableOptions.userToInvite],
            });
        }

        return list;
    })();

    const sections = sectionsList.map((section) => ({
        ...section,
        data: (section.data ?? []).map((option) => ({
            ...option,
            text: option.text ?? '',
            alternateText: getDelegateAlternateText(option.login, option.alternateText),
            keyForList: option.keyForList ?? '',
            isDisabled: option.isDisabled ?? undefined,
            isSelected: option.isSelected ?? undefined,
            login: option.login ?? undefined,
            shouldShowSubscript: undefined,
        })),
    }));

    const searchValue = debouncedSearchTerm.trim().toLowerCase();
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
