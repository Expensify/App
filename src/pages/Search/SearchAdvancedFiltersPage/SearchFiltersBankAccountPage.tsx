import React from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import getBankIcon from '@components/Icon/BankIcons';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchMultipleSelectionPicker from '@components/Search/SearchMultipleSelectionPicker';
import type {SearchMultipleSelectionPickerItem} from '@components/Search/SearchMultipleSelectionPicker';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getBankAccountSearchLabel} from '@libs/BankAccountUtils';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import {updateAdvancedFilters} from '@userActions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

function SearchFiltersBankAccountPage() {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {isLargeScreenWidth} = useResponsiveLayout();
    const [bankAccountList, bankAccountListMetadata] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [searchAdvancedFiltersForm, searchAdvancedFiltersFormResult] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const isLoadingOnyxData = isLoadingOnyxValue(bankAccountListMetadata, searchAdvancedFiltersFormResult);
    const selectedBankAccountIDs = searchAdvancedFiltersForm?.bankAccount ?? [];

    const bankAccountItems: Array<SearchMultipleSelectionPickerItem<string>> = [];
    for (const bankAccount of Object.values(bankAccountList ?? {})) {
        const bankAccountID = bankAccount?.accountData?.bankAccountID;
        if (!bankAccountID) {
            continue;
        }
        const bankName = bankAccount?.accountData?.additionalData?.bankName;
        const label = getBankAccountSearchLabel(bankAccount);
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

        bankAccountItems.push({
            name: label,
            value: bankAccountID.toString(),
            leftElement,
        });
    }

    const initiallySelectedItems = bankAccountItems.filter((item) => selectedBankAccountIDs.includes(item.value));

    const onSaveSelection = (values: string[]) => updateAdvancedFilters({bankAccount: values});

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
                    />
                </View>
            )}
            {!isLoadingOnyxData && (
                <View style={[styles.flex1]}>
                    <SearchMultipleSelectionPicker
                        items={bankAccountItems}
                        initiallySelectedItems={initiallySelectedItems}
                        onSaveSelection={onSaveSelection}
                        shouldShowTextInput={bankAccountItems.length >= CONST.STANDARD_LIST_ITEM_LIMIT}
                    />
                </View>
            )}
        </ScreenWrapper>
    );
}

SearchFiltersBankAccountPage.displayName = 'SearchFiltersBankAccountPage';

export default SearchFiltersBankAccountPage;
