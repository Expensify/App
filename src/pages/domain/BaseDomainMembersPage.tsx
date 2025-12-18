import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchBar from '@components/SearchBar';
import CustomListHeader from '@components/SelectionListWithModal/CustomListHeader';
import SelectionList from '@components/SelectionListWithSections';
import TableListItem from '@components/SelectionListWithSections/TableListItem';
import type {ListItem} from '@components/SelectionListWithSections/types';
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
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';

type MemberOption = Omit<ListItem, 'accountID' | 'login'> & {
    accountID: number;
    login: string;
};

type BaseDomainMembersPageProps = {
    /** The ID of the domain used for the not found wrapper */
    domainAccountID: number;

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

    /** Icon displayed in the header of the tab */
    headerIcon?: IconAsset;

    /** Function to render a custom right element for a row */
    getCustomRightElement?: (accountID: number) => React.ReactNode;

    /** Whether the data is still loading */
    isLoading?: boolean;
};

function BaseDomainMembersPage({
                                   domainAccountID,
                                   accountIDs,
                                   headerTitle,
                                   searchPlaceholder,
                                   headerContent,
                                   onSelectRow,
                                   headerIcon,
                                   getCustomRightElement,
                                   isLoading = false,
                               }: BaseDomainMembersPageProps) {
    const {formatPhoneNumber, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: true});
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);
    const data: MemberOption[] = accountIDs.map((accountID) => {
        const details = personalDetails?.[accountID];
        const login = details?.login ?? '';

        return {
            keyForList: String(accountID),
            accountID,
            login,
            text: formatPhoneNumber(getDisplayNameOrDefault(details)),
            alternateText: formatPhoneNumber(login),
            icons: [
                {
                    source: details?.avatar ?? icons.FallbackAvatar,
                    name: formatPhoneNumber(login),
                    type: CONST.ICON_TYPE_AVATAR,
                    id: accountID,
                },
            ],
            rightElement: getCustomRightElement?.(accountID),
        };
    });

    const filterMember = (memberOption: MemberOption, searchQuery: string) => {
        const results = tokenizedSearch([memberOption], searchQuery, (option) => [option.text ?? '', option.alternateText ?? '']);
        return results.length > 0;
    };

    const sortMembers = (options: MemberOption[]) => sortAlphabetically(options, 'text', localeCompare);

    const [inputValue, setInputValue, filteredData] = useSearchResults(data, filterMember, sortMembers);

    const getCustomListHeader = () => {
        if (filteredData.length === 0) {
            return null;
        }
        return <CustomListHeader canSelectMultiple={false} leftHeaderText={headerTitle} />;
    };

    const listHeaderContent =
        data.length > CONST.SEARCH_ITEM_LIMIT ? (
            <SearchBar inputValue={inputValue} onChangeText={setInputValue} label={searchPlaceholder} shouldShowEmptyState={!filteredData.length} />
        ) : null;

    if (isLoading) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <DomainNotFoundPageWrapper domainAccountID={domainAccountID}>
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                shouldShowOfflineIndicatorInWideScreen
                testID={BaseDomainMembersPage.displayName}
            >
                <HeaderWithBackButton title={headerTitle} onBackButtonPress={Navigation.popToSidebar} icon={headerIcon} shouldShowBackButton={shouldUseNarrowLayout}>
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
        </DomainNotFoundPageWrapper>
    );
}

BaseDomainMembersPage.displayName = 'BaseDomainMembersPage';

export type {MemberOption};
export default BaseDomainMembersPage;
