import React, {useEffect} from 'react';
import {View} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSearchSelector from '@hooks/useSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';
import {searchUserInServer} from '@libs/actions/Report';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import {getHeaderMessage} from '@libs/OptionsListUtils';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Participant} from '@src/types/onyx/IOU';
import type {BaseVacationDelegate} from '@src/types/onyx/VacationDelegate';
import DelegatorList from './DelegatorList';
import HeaderWithBackButton from './HeaderWithBackButton';
import UserListItem from './SelectionList/ListItem/UserListItem';
import SelectionList from './SelectionList/SelectionListWithSections';

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
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false});

    const currentVacationDelegate = vacationDelegate?.delegate ?? '';
    const delegatePersonalDetails = getPersonalDetailByEmail(currentVacationDelegate);
    const hasActiveDelegations = !!vacationDelegate?.delegatorFor?.length;

    const excludeLogins = {
        ...CONST.EXPENSIFY_EMAILS_OBJECT,
        ...(currentVacationDelegate && {[currentVacationDelegate]: true}),
        ...additionalExcludeLogins,
    };

    const {searchTerm, debouncedSearchTerm, setSearchTerm, availableOptions, areOptionsInitialized, onListEndReached} = useSearchSelector({
        selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_SINGLE,
        maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
        searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
        excludeLogins,
        includeRecentReports: true,
        getValidOptionsConfig: {
            excludeLogins,
            includeCurrentUser,
        },
    });

    useEffect(() => {
        searchUserInServer(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    const sectionsList = [];

    if (currentVacationDelegate && delegatePersonalDetails) {
        sectionsList.push({
            title: undefined,
            sectionIndex: 0,
            data: [
                {
                    ...delegatePersonalDetails,
                    text: delegatePersonalDetails?.displayName ?? currentVacationDelegate,
                    alternateText: delegatePersonalDetails?.login ?? currentVacationDelegate,
                    login: delegatePersonalDetails.login ?? currentVacationDelegate,
                    keyForList: `vacationDelegate-${delegatePersonalDetails.login}`,
                    isDisabled: false,
                    isSelected: true,
                    shouldShowSubscript: undefined,
                    icons: [
                        {
                            source: delegatePersonalDetails?.avatar ?? icons.FallbackAvatar,
                            name: formatPhoneNumber(delegatePersonalDetails?.login ?? ''),
                            type: CONST.ICON_TYPE_AVATAR,
                            id: delegatePersonalDetails?.accountID,
                        },
                    ],
                },
            ],
        });
    }

    sectionsList.push({
        title: translate('common.recents'),
        sectionIndex: 1,
        data: availableOptions.recentReports,
    });
    sectionsList.push({
        title: translate('common.contacts'),
        sectionIndex: 2,
        data: availableOptions.personalDetails,
    });

    if (availableOptions.userToInvite) {
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
            text: option.text ?? option.displayName ?? '',
            alternateText: option.alternateText ?? option.login ?? undefined,
            keyForList: option.keyForList ?? '',
            isDisabled: option.isDisabled ?? undefined,
            isSelected: option.isSelected ?? undefined,
            login: option.login ?? undefined,
            shouldShowSubscript: option.shouldShowSubscript ?? undefined,
        })),
    }));

    const textInputOptions = {
        value: searchTerm,
        onChangeText: setSearchTerm,
        label: translate('selectionList.nameEmailOrPhoneNumber'),
        headerMessage: getHeaderMessage(
            (availableOptions.recentReports?.length || 0) + (availableOptions.personalDetails?.length || 0) !== 0,
            !!availableOptions.userToInvite,
            debouncedSearchTerm.trim(),
            countryCode,
            false,
        ),
    };

    return (
        <>
            <HeaderWithBackButton
                title={headerTitle}
                onBackButtonPress={onBackButtonPress}
            />
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
                        showLoadingPlaceholder={!areOptionsInitialized}
                        isLoadingNewOptions={!!isSearchingForReports}
                        onEndReached={onListEndReached}
                        shouldSingleExecuteRowSelect
                        shouldShowTextInput
                    />
                </View>
            )}
        </>
    );
}

export default BaseVacationDelegateSelectionComponent;
