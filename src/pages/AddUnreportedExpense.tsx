import React, {useMemo, useRef, useState} from 'react';
import type {ViewStyle} from 'react-native';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectCircle from '@components/SelectCircle';
import SelectionList from '@components/SelectionList';
import BaseListItem from '@components/SelectionList/BaseListItem';
import type {ListItem, SelectionListHandle, UserListItemProps} from '@components/SelectionList/types';
import TransactionItemRow from '@components/TransactionItemRow';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {Section} from '@libs/OptionsListUtils';
import navigation from '@navigation/Navigation';
import variables from '@styles/variables';
import {getAllTransactions} from '@userActions/Transaction';
import type Transaction from '@src/types/onyx/Transaction';
import NewChatSelectorPage from './NewChatSelectorPage';

const emptyStylesArray: ViewStyle[] = [];

function unreportedExpenseListItem<TItem extends ListItem>({item, isFocused, showTooltip, isDisabled, canSelectMultiple, onFocus, shouldSyncFocus}: UserListItemProps<TItem>) {
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
                />
                <View style={[styles.pb3, styles.justifyContentCenter, styles.alignItemsCenter, styles.expenseWidgetSelectCircle, styles.mln2, styles.pr2]}>
                    <SelectCircle isChecked={isSelected} />
                </View>
            </View>
        </BaseListItem>
    );
}

unreportedExpenseListItem.displayName = 'unreportedExpenseListItem';

function AddUnreportedExpense() {
    const styles = useThemeStyles();
    const [headerWithBackBtnContainerElement, setHeaderWithBackButtonContainerElement] = useState<HTMLElement | null>(null);
    const containerElements = useMemo(() => {
        return [headerWithBackBtnContainerElement].filter((element) => !!element) as HTMLElement[];
    }, [headerWithBackBtnContainerElement]);
    const selectionListRef = useRef<SelectionListHandle>(null);
    const unreportedExpensesList = Object.values(getAllTransactions()).filter((item) => item.reportID === '0');
    const sections: Section[] = [
        {
            shouldShow: true,
            data: unreportedExpensesList,
        },
    ];

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
                onSelectRow={() => {}}
                shouldShowTextInput={false}
                canSelectMultiple
                sections={sections}
                ListItem={unreportedExpenseListItem}
                confirmButtonStyles={[styles.justifyContentCenter]}
                showConfirmButton
                confirmButtonText="Add to report"
            />
        </ScreenWrapper>
    );
}

export default AddUnreportedExpense;
