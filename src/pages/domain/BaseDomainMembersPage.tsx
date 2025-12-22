import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchBar from '@components/SearchBar';
import CustomListHeader from '@components/SelectionListWithModal/CustomListHeader';
// eslint-disable-next-line no-restricted-imports
import SelectionList from '@components/SelectionListWithSections';
import TableListItem from '@components/SelectionListWithSections/TableListItem';
import type {ListItem} from '@components/SelectionListWithSections/types';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';
import {sortAlphabetically} from '@libs/OptionsListUtils';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type IconAsset from '@src/types/utils/IconAsset';

type MemberOption = Omit<ListItem, 'accountID' | 'login'> & {
    accountID: number;
    login: string;
};

type BaseDomainMembersPageProps = {
    /** The list of accountIDs to display */
    accountIDs: number[];

    /** The title of the header */
    headerTitle: string;

    /** Placeholder text for the search bar */
    searchPlaceholder: string;

    /** Content to display in the header (e.g., Add/Settings buttons) */
    headerContent?: React.ReactNode;

    /** Callback fired when a row is selected */
    onSelectRow: (item: MemberOption) => void;

    hederIcon: IconAsset;
};

function BaseDomainMembersPage({accountIDs, headerTitle, searchPlaceholder, headerContent, onSelectRow, hederIcon}: BaseDomainMembersPageProps) {
    const {formatPhoneNumber, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar'] as const);

    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: true});

    const data: MemberOption[] = useMemo(() => {
        const options: MemberOption[] = [];
        for (const accountID of accountIDs) {
            const details = personalDetails?.[accountID];
            options.push({
                keyForList: String(accountID),
                accountID,
                login: details?.login ?? '',
                text: formatPhoneNumber(getDisplayNameOrDefault(details)),
                alternateText: formatPhoneNumber(details?.login ?? ''),
                icons: [
                    {
                        source: details?.avatar ?? icons.FallbackAvatar,
                        name: formatPhoneNumber(details?.login ?? ''),
                        type: CONST.ICON_TYPE_AVATAR,
                        id: accountID,
                    },
                ],
            });
        }
        return options;
    }, [accountIDs, personalDetails, formatPhoneNumber, icons.FallbackAvatar]);

    const filterMember = useCallback((option: MemberOption, searchQuery: string) => {
        const results = tokenizedSearch([option], searchQuery, (item) => [item.text ?? '', item.alternateText ?? '']);
        return results.length > 0;
    }, []);

    const sortMembers = useCallback((options: MemberOption[]) => sortAlphabetically(options, 'text', localeCompare), [localeCompare]);

    const [inputValue, setInputValue, filteredData] = useSearchResults(data, filterMember, sortMembers);

    const getCustomListHeader = () => {
        if (filteredData.length === 0) {
            return null;
        }
        return (
            <CustomListHeader
                canSelectMultiple={false}
                leftHeaderText={headerTitle}
            />
        );
    };

    const listHeaderContent =
        data.length > CONST.SEARCH_ITEM_LIMIT ? (
            <SearchBar
                inputValue={inputValue}
                onChangeText={setInputValue}
                label={searchPlaceholder}
                shouldShowEmptyState={!filteredData.length}
            />
        ) : null;

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldEnableMaxHeight
            shouldShowOfflineIndicatorInWideScreen
            testID={BaseDomainMembersPage.displayName}
        >
            <HeaderWithBackButton
                title={headerTitle}
                onBackButtonPress={Navigation.popToSidebar}
                icon={hederIcon}
                shouldShowBackButton={shouldUseNarrowLayout}
            >
                {!shouldUseNarrowLayout && !!headerContent && <View style={[styles.flexRow, styles.gap2]}>{headerContent}</View>}
            </HeaderWithBackButton>

            {shouldUseNarrowLayout && !!headerContent && <View style={[styles.pl5, styles.pr5, styles.flexRow, styles.gap2]}>{headerContent}</View>}

            <SelectionList
                sections={[{data: filteredData}]}
                shouldShowRightCaret
                canSelectMultiple={false}
                listHeaderContent={listHeaderContent}
                listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]}
                ListItem={TableListItem}
                onSelectRow={onSelectRow}
                shouldShowListEmptyContent={false}
                listItemTitleContainerStyles={shouldUseNarrowLayout ? undefined : [styles.pr3]}
                showScrollIndicator={false}
                addBottomSafeAreaPadding
                customListHeader={getCustomListHeader()}
                containerStyle={styles.flex1}
            />
        </ScreenWrapper>
    );
}

BaseDomainMembersPage.displayName = 'BaseDomainMembersPage';

export type {MemberOption};
export default BaseDomainMembersPage;
