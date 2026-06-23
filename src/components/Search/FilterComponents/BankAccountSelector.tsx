import React from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import Icon from '@components/Icon';
import getBankIcon from '@components/Icon/BankIcons';
import type {SearchFilterCommonProps} from '@components/Search/types';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {TextInputOptions} from '@components/SelectionList/types';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getBankAccountSearchLabel, isBankAccountPartiallySetup} from '@libs/BankAccountUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import ListFilterView from './ListFilterViewWrapper';

type BankAccountSelectorProps = SearchFilterCommonProps<string[] | undefined>;

/** Row item rendered by SelectionListWithSections for a single bank account. */
type BankAccountFilterItem = {
    /** Display label, e.g. `Chase xx1234`. */
    text: string;
    /** Bank account ID stringified — used as both the stable list key and the filter value. */
    keyForList: string;
    /** Same as keyForList; kept on the item so onChange logic mirrors CardSelector. */
    value: string;
    /** Whether this account is currently selected in the filter. */
    isSelected: boolean;
    /** Bank icon wrapper rendered at the start of the row. */
    leftElement: React.JSX.Element;
    /** Last four digits of the account number — searched in addition to the display text. */
    lastFour: string;
};

function BankAccountSelector({value = [], selectionListTextInputStyle, selectionListStyle, autoFocus, footer, onChange}: BankAccountSelectorProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isLargeScreenWidth} = useResponsiveLayout();
    const [bankAccountList, bankAccountListMetadata] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');

    const openItems: BankAccountFilterItem[] = [];
    const closedItems: BankAccountFilterItem[] = [];
    for (const bankAccount of Object.values(bankAccountList ?? {})) {
        const bankAccountID = bankAccount?.accountData?.bankAccountID;
        if (!bankAccountID) {
            continue;
        }
        if (bankAccount?.accountData?.type !== CONST.BANK_ACCOUNT.TYPE.BUSINESS) {
            continue;
        }
        if (isBankAccountPartiallySetup(bankAccount?.accountData?.state)) {
            continue;
        }

        const key = bankAccountID.toString();
        const bankName = bankAccount?.accountData?.additionalData?.bankName;
        const accountNumber = bankAccount?.accountData?.accountNumber ?? '';
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

        const item: BankAccountFilterItem = {
            text: getBankAccountSearchLabel(bankAccount),
            keyForList: key,
            value: key,
            isSelected: value.includes(key),
            leftElement,
            lastFour: accountNumber.slice(-4),
        };

        if (bankAccount?.accountData?.state === CONST.BANK_ACCOUNT.STATE.OPEN) {
            openItems.push(item);
        } else {
            closedItems.push(item);
        }
    }

    const shouldShowSearchInput = openItems.length + closedItems.length >= CONST.STANDARD_LIST_ITEM_LIMIT;

    const searchFunction = (item: BankAccountFilterItem) =>
        item.text.toLocaleLowerCase().includes(debouncedSearchTerm.toLocaleLowerCase()) || item.lastFour.toLocaleLowerCase().includes(debouncedSearchTerm.toLocaleLowerCase());

    const selectedData = [...openItems, ...closedItems].filter((item) => item.isSelected && searchFunction(item));
    const unselectedOpenData = openItems.filter((item) => !item.isSelected && searchFunction(item));
    const unselectedClosedData = closedItems.filter((item) => !item.isSelected && searchFunction(item));

    const itemCount = selectedData.length + unselectedOpenData.length + unselectedClosedData.length;
    const sectionHeaderCount = unselectedClosedData.length > 0 ? 1 : 0;

    const sections = [
        {
            title: undefined,
            data: selectedData,
            sectionIndex: 0,
        },
        {
            title: undefined,
            data: unselectedOpenData,
            sectionIndex: 1,
        },
        {
            title: translate('search.filters.bankAccount.closedBankAccounts'),
            data: unselectedClosedData,
            sectionIndex: 2,
        },
    ];

    const updateSelection = (item: BankAccountFilterItem) => {
        if (!item.keyForList) {
            return;
        }
        if (item.isSelected) {
            onChange(value.filter((id) => id !== item.keyForList));
            return;
        }
        onChange([...value, item.keyForList]);
    };

    const textInputOptions: TextInputOptions = {
        value: searchTerm,
        label: translate('common.search'),
        onChangeText: setSearchTerm,
        headerMessage: debouncedSearchTerm.trim() && sections.every((section) => !section.data.length) ? translate('common.noResultsFound') : '',
        style: {
            containerStyle: selectionListTextInputStyle,
        },
        disableAutoFocus: !autoFocus,
    };

    const isLoadingOnyxData = isLoadingOnyxValue(bankAccountListMetadata);
    const reasonAttributes: SkeletonSpanReasonAttributes = {context: 'SearchFiltersBankAccountPage', isLoadingFromOnyx: isLoadingOnyxData};

    return (
        <ListFilterView
            itemCount={itemCount}
            itemHeight={variables.optionRowHeight}
            isSearchable={shouldShowSearchInput}
            extraHeight={28 * sectionHeaderCount}
        >
            {isLoadingOnyxData ? (
                <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsCenter]}>
                    <ActivityIndicator
                        color={theme.spinner}
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={[styles.pl3]}
                        reasonAttributes={reasonAttributes}
                    />
                </View>
            ) : (
                <SelectionListWithSections<BankAccountFilterItem>
                    sections={sections}
                    ListItem={MultiSelectListItem}
                    onSelectRow={updateSelection}
                    shouldPreventDefaultFocusOnSelectRow={false}
                    shouldShowTextInput={shouldShowSearchInput}
                    textInputOptions={textInputOptions}
                    shouldStopPropagation
                    canSelectMultiple
                    style={selectionListStyle}
                    footerContent={footer}
                />
            )}
        </ListFilterView>
    );
}

export default BankAccountSelector;
