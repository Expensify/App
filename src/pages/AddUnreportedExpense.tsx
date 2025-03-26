import React, {useRef, useState} from 'react';
import type {ViewStyle} from 'react-native';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectCircle from '@components/SelectCircle';
import SelectionList from '@components/SelectionList';
import BaseListItem from '@components/SelectionList/BaseListItem';
import type {ListItem, ListItemProps, SectionListDataType, SelectionListHandle} from '@components/SelectionList/types';
import TransactionItemRow from '@components/TransactionItemRow';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {Section} from '@libs/OptionsListUtils';
import navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import variables from '@styles/variables';
import {getAllTransactions} from '@userActions/Transaction';
import type SCREENS from '@src/SCREENS';
import type Transaction from '@src/types/onyx/Transaction';
import NewChatSelectorPage from './NewChatSelectorPage';

const emptyStylesArray: ViewStyle[] = [];

function unreportedExpenseListItem<TItem extends ListItem & Transaction>({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    canSelectMultiple,
    onFocus,
    shouldSyncFocus,
    onSelectRow,
}: ListItemProps<TItem>) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const styles = useThemeStyles();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isSelected, setIsSelected] = useState<boolean>(false);
    const theme = useTheme();

    const backgroundColor = isSelected ? styles.buttonDefaultBG : styles.highlightBG;

    const animatedHighlightStyle = useAnimatedHighlightStyle({
        borderRadius: variables.componentBorderRadius,
        shouldHighlight: item?.shouldAnimateInHighlight ?? false,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: theme.highlightBG,
    });

    return (
        <BaseListItem
            item={item}
            isFocused={isFocused}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            canSelectMultiple={canSelectMultiple}
            pendingAction={item.pendingAction}
            keyForList={item.keyForList}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
            hoverStyle={item.isSelected && styles.activeComponentBG}
            pressableWrapperStyle={[animatedHighlightStyle, backgroundColor]}
            onSelectRow={() => {
                onSelectRow(item);
                setIsSelected((val) => !val);
            }}
            containerStyle={[styles.p3, styles.mbn4, styles.expenseWidgetRadius]}
        >
            <View style={[{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}]}>
                <TransactionItemRow
                    transactionItem={item}
                    shouldUseNarrowLayout
                    isSelected={isSelected}
                    containerStyles={emptyStylesArray}
                    shouldShowTooltip={false}
                />
                <View style={[styles.pb3, styles.justifyContentCenter, styles.alignItemsCenter, styles.expenseWidgetSelectCircle, styles.mln2, styles.pr2]}>
                    <SelectCircle isChecked={isSelected} />
                </View>
            </View>
        </BaseListItem>
    );
}

unreportedExpenseListItem.displayName = 'unreportedExpenseListItem';

type AddUnreportedExpensePageType = PlatformStackScreenProps<AddUnreportedExpensesParamList, typeof SCREENS.ADD_UNREPORTED_EXPENSES_ROOT>;

type AddUnreportedExpensesParamList = {
    [SCREENS.ADD_UNREPORTED_EXPENSES_ROOT]: {
        reportID: string;
    };
};

function AddUnreportedExpense({route}: AddUnreportedExpensePageType) {
    const styles = useThemeStyles();
    const selectionListRef = useRef<SelectionListHandle>(null);
    const unreportedExpensesList: Transaction[] = Object.values(getAllTransactions()).filter((item) => item.reportID === '0');
    const sections: Array<SectionListDataType<Transaction & ListItem>> = [
        {
            shouldShow: true,
            data: unreportedExpensesList,
        },
    ];
    const reportId = route.params.reportID;
    const seectedIds = new Set();
    return (
        <ScreenWrapper
            shouldEnableKeyboardAvoidingView={false}
            includeSafeAreaPaddingBottom
            shouldShowOfflineIndicator={false}
            includePaddingTop={false}
            shouldEnablePickerAvoiding={false}
            testID={NewChatSelectorPage.displayName}
            focusTrapSettings={{active: false}}
        >
            <HeaderWithBackButton
                title="Add unreported expanse"
                onBackButtonPress={navigation.goBack}
            />
            <SelectionList<Transaction & ListItem>
                ref={selectionListRef}
                onSelectRow={(item) => {
                    if (seectedIds.has(item.transactionID)) {
                        seectedIds.delete(item.transactionID);
                    } else {
                        seectedIds.add(item.transactionID);
                    }
                }}
                shouldShowTextInput={false}
                canSelectMultiple
                sections={sections}
                ListItem={unreportedExpenseListItem}
                confirmButtonStyles={[styles.justifyContentCenter]}
                showConfirmButton
                confirmButtonText="Add to report"
                onConfirm={() => {
                    console.log('__________________');
                    console.log(seectedIds);
                    console.log(reportId);
                    console.log('__________________');
                }}
            />
        </ScreenWrapper>
    );
}

export default AddUnreportedExpense;
