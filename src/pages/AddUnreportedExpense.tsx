import React, {useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import FocusTrapContainerElement from '@components/FocusTrap/FocusTrapContainerElement';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ImportedStateIndicator from '@components/ImportedStateIndicator';
import KeyboardAvoidingView from '@components/KeyboardAvoidingView';
import OfflineIndicator from '@components/OfflineIndicator';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SelectCircle from '@components/SelectCircle';
import SelectionList from '@components/SelectionList';
import BaseListItem from '@components/SelectionList/BaseListItem';
import type {ListItem, SelectionListHandle, UserListItemProps} from '@components/SelectionList/types';
import UserListItem from '@components/SelectionList/UserListItem';
import TransactionItemComponent from '@components/TransactionItemComponent';
import useThemeStyles from '@hooks/useThemeStyles';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import type {Option, Section} from '@libs/OptionsListUtils';
import navigation from '@navigation/Navigation';
import variables from '@styles/variables';
import {getAllTransactions} from '@userActions/Transaction';
import CONST from '@src/CONST';
import type Transaction from '@src/types/onyx/Transaction';
import NewChatSelectorPage from './NewChatSelectorPage';

function unreportedExpenseListItem<TItem extends ListItem>({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    canSelectMultiple,
    onDismissError,
    shouldPreventEnterKeySubmit,
    rightHandSideComponent,
    onFocus,
    shouldSyncFocus,
    pressableStyle,
}: UserListItemProps<TItem>) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const styles = useThemeStyles();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isSelected, setIsSelected] = useState<boolean>(false);

    const backgroundColor = isSelected || isFocused ? styles.buttonDefaultBG : styles.highlightBG;

    return (
        <BaseListItem
            item={item}
            isFocused={false}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            canSelectMultiple={canSelectMultiple}
            onSelectRow={() => {
                setIsSelected((selected) => !selected);
            }}
            onDismissError={onDismissError}
            shouldPreventEnterKeySubmit={shouldPreventEnterKeySubmit}
            rightHandSideComponent={rightHandSideComponent}
            errors={item.errors}
            pendingAction={item.pendingAction}
            pressableStyle={pressableStyle}
            keyForList={item.keyForList}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
        >
            <View style={[{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}, styles.mb3]}>
                <TransactionItemComponent
                    transactionItem={item}
                    shouldUseNarrowLayout
                    isSelected={isSelected}
                />
                <View style={[backgroundColor, styles.minHeight22, styles.justifyContentCenter, styles.alignItemsCenter, styles.expenseWidgetSelectCircle, styles.mln2, styles.pr2]}>
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
            title: 'expense',
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
            // Disable the focus trap of this page to activate the parent focus trap in `NewChatSelectorPage`.
            focusTrapSettings={{active: false}}
        >
            <HeaderWithBackButton
                title="Add unreported expanse"
                onBackButtonPress={navigation.goBack}
            />
            <KeyboardAvoidingView
                style={styles.flex1}
                behavior="padding"
                // Offset is needed as KeyboardAvoidingView in nested inside of TabNavigator instead of wrapping whole screen.
                // This is because when wrapping whole screen the screen was freezing when changing Tabs.
                keyboardVerticalOffset={variables.contentHeaderHeight + top + variables.tabSelectorButtonHeight + variables.tabSelectorButtonPadding}
            >
                <SelectionList<Transaction & ListItem>
                    ref={selectionListRef}
                    onSelectRow={() => {}}
                    shouldShowTextInput={false}
                    canSelectMultiple
                    sections={sections}
                    ListItem={unreportedExpenseListItem}
                    confirmButtonStyles={styles.mb5}
                />
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}

export default AddUnreportedExpense;
