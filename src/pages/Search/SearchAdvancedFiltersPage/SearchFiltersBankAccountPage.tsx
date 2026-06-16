import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import getBankIcon from '@components/Icon/BankIcons';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchFilterPageFooterButtons from '@components/Search/SearchFilterPageFooterButtons';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import useDebouncedState from '@hooks/useDebouncedState';
import useInitiallyFocusedKey from '@hooks/useInitiallyFocusedKey';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getBankAccountSearchLabel, isSearchEligibleBankAccount} from '@libs/BankAccountUtils';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import {updateAdvancedFilters} from '@userActions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {BankAccountList} from '@src/types/onyx/BankAccount';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type BankAccountFilterItem = {
    text: string;
    keyForList: string;
    isSelected: boolean;
    leftElement: React.ReactNode;
    value: string;
};

type BankAccountPickerProps = {
    /** Full bank account list keyed by bankAccountID. */
    bankAccountList: BankAccountList | undefined;

    /** IDs already selected in the saved filter form. */
    initialSelectedIDs: string[];
};

function BankAccountPicker({bankAccountList, initialSelectedIDs}: BankAccountPickerProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isLargeScreenWidth} = useResponsiveLayout();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [selectedBankAccountIDs, setSelectedBankAccountIDs] = useState<string[]>(initialSelectedIDs);

    const buildItem = (bankAccount: OnyxTypes.BankAccount): BankAccountFilterItem | undefined => {
        const bankAccountID = bankAccount?.accountData?.bankAccountID;
        if (!bankAccountID) {
            return undefined;
        }
        const value = bankAccountID.toString();
        const bankName = bankAccount?.accountData?.additionalData?.bankName;
        const {icon, iconSize, iconStyles} = getBankIcon({bankName, styles, maxIconSize: isLargeScreenWidth ? variables.w28 : undefined});
        const leftElement = (
            <View style={[styles.mr3, styles.alignItemsCenter, styles.justifyContentCenter]}>
                <Icon
                    src={icon}
                    width={iconSize}
                    height={iconSize}
                    additionalStyles={iconStyles}
                />
            </View>
        );

        return {
            text: getBankAccountSearchLabel(bankAccount),
            keyForList: value,
            value,
            isSelected: selectedBankAccountIDs.includes(value),
            leftElement,
        };
    };

    const {openItems, closedItems} = useMemo(() => {
        const open: BankAccountFilterItem[] = [];
        const closed: BankAccountFilterItem[] = [];
        for (const bankAccount of Object.values(bankAccountList ?? {})) {
            // Personal accounts are never accepted by the backend search filter, so they are excluded from both sections.
            if (bankAccount?.accountData?.type !== CONST.BANK_ACCOUNT.TYPE.BUSINESS) {
                continue;
            }
            const item = buildItem(bankAccount);
            if (!item) {
                continue;
            }
            if (isSearchEligibleBankAccount(bankAccount)) {
                open.push(item);
            } else {
                closed.push(item);
            }
        }
        return {openItems: open, closedItems: closed};
    }, [bankAccountList, buildItem]);

    const totalItemCount = openItems.length + closedItems.length;
    const shouldShowSearchInput = totalItemCount >= CONST.STANDARD_LIST_ITEM_LIMIT;

    const searchFilter = useCallback((item: BankAccountFilterItem) => item.text.toLocaleLowerCase().includes(debouncedSearchTerm.toLocaleLowerCase()), [debouncedSearchTerm]);

    const sections = useMemo(() => {
        const result: Array<{title: string; data: BankAccountFilterItem[]; sectionIndex: number}> = [];
        const filteredOpen = openItems.filter(searchFilter);
        if (filteredOpen.length > 0) {
            result.push({title: translate('search.filters.bankAccount.banks'), data: filteredOpen, sectionIndex: 0});
        }
        const filteredClosed = closedItems.filter(searchFilter);
        if (filteredClosed.length > 0) {
            result.push({title: translate('search.filters.bankAccount.closedBankAccounts'), data: filteredClosed, sectionIndex: 1});
        }
        return result;
    }, [openItems, closedItems, searchFilter, translate]);

    const initiallyFocusedKey = useInitiallyFocusedKey(() => [...openItems, ...closedItems].find((item) => item.isSelected)?.keyForList);

    const applyChanges = () => {
        updateAdvancedFilters({bankAccount: selectedBankAccountIDs});
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
    };

    const resetChanges = () => {
        setSelectedBankAccountIDs([]);
    };

    const toggleSelection = (item: BankAccountFilterItem) => {
        setSelectedBankAccountIDs((prev) => (item.isSelected ? prev.filter((id) => id !== item.value) : [...prev, item.value]));
    };

    const textInputOptions = {
        value: searchTerm,
        label: translate('common.search'),
        onChangeText: setSearchTerm,
        headerMessage: debouncedSearchTerm.trim() && sections.every((section) => !section.data.length) ? translate('common.noResultsFound') : '',
    };

    const footerContent = (
        <SearchFilterPageFooterButtons
            applyChanges={applyChanges}
            resetChanges={resetChanges}
        />
    );

    return (
        <View style={[styles.flex1]}>
            <SelectionListWithSections<BankAccountFilterItem>
                sections={sections}
                ListItem={MultiSelectListItem}
                initiallyFocusedItemKey={initiallyFocusedKey}
                shouldUpdateFocusedIndex
                shouldClearInputOnSelect={false}
                onSelectRow={toggleSelection}
                footerContent={footerContent}
                shouldShowTextInput={shouldShowSearchInput}
                textInputOptions={textInputOptions}
                shouldStopPropagation
                shouldPreventAutoScrollOnSelect
                canSelectMultiple
            />
        </View>
    );
}

function SearchFiltersBankAccountPage() {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const [bankAccountList, bankAccountListMetadata] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [searchAdvancedFiltersForm, searchAdvancedFiltersFormResult] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);

    const isLoadingOnyxData = isLoadingOnyxValue(bankAccountListMetadata, searchAdvancedFiltersFormResult);

    return (
        <ScreenWrapper
            testID={SearchFiltersBankAccountPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('common.bankAccount')}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
                }}
            />
            {isLoadingOnyxData && (
                <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsCenter]}>
                    <ActivityIndicator
                        color={theme.spinner}
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={[styles.pl3]}
                        reasonAttributes={{context: 'SearchFiltersBankAccountPage', isLoadingFromOnyx: isLoadingOnyxData}}
                    />
                </View>
            )}
            {!isLoadingOnyxData && (
                <BankAccountPicker
                    bankAccountList={bankAccountList}
                    initialSelectedIDs={searchAdvancedFiltersForm?.bankAccount ?? []}
                />
            )}
        </ScreenWrapper>
    );
}

SearchFiltersBankAccountPage.displayName = 'SearchFiltersBankAccountPage';

export default SearchFiltersBankAccountPage;
