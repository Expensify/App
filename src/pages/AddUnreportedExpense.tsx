import React, {useCallback, useMemo, useRef, useState} from 'react';
import { Text, View } from 'react-native';
import Button from '@components/Button';
import FocusTrapContainerElement from '@components/FocusTrap/FocusTrapContainerElement';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import BaseListItem from '@components/SelectionList/BaseListItem';
import type { ListItem, SelectionListHandle, UserListItemProps } from '@components/SelectionList/types';
import useThemeStyles from '@hooks/useThemeStyles';
import navigation from '@navigation/Navigation';
import { getAllTransactions } from '@userActions/Transaction';
import type {Option, Section} from '@libs/OptionsListUtils';
import UserListItem from '@components/SelectionList/UserListItem';
import TransactionItemComponent from '@components/TransactionItemComponent';
import ScrollView from '@components/ScrollView';
import SelectCircle from '@components/SelectCircle';
import NewChatSelectorPage from './NewChatSelectorPage';


function unreportedExpenseListItem<TItem extends ListItem>({
                                                  item,
                                                  isFocused,
                                                  showTooltip,
                                                  isDisabled,
                                                  canSelectMultiple,
                                                  onSelectRow,
                                                  onCheckboxPress,
                                                  onDismissError,
                                                  shouldPreventEnterKeySubmit,
                                                  rightHandSideComponent,
                                                  onFocus,
                                                  shouldSyncFocus,
                                                  wrapperStyle,
                                                  pressableStyle,
                                              }: UserListItemProps<TItem>) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const styles = useThemeStyles();
    const [isSelected,setIsSelected] = useState<boolean>(false);
    return (
        <BaseListItem
            item={item}
            wrapperStyle={[styles.m5]}
            isFocused={isFocused}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            canSelectMultiple={canSelectMultiple}
            onSelectRow={onSelectRow}
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
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <TransactionItemComponent transactionItem={item} isLargeScreenWidth={false} isSelected={false}/>
                <SelectCircle isChecked={isSelected}/>
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
    const unreportedExpensesList = Object.values(getAllTransactions()).filter((item)=>item.reportID==='0')
    const sections: Section[] = [
        {
            title:"expense",
            shouldShow:true,
            data: unreportedExpensesList
        }
    ]


    return (
        <ScreenWrapper
            shouldEnableKeyboardAvoidingView={false}
            includeSafeAreaPaddingBottom={false}
            shouldShowOfflineIndicator={false}
            shouldEnableMaxHeight
            testID={NewChatSelectorPage.displayName}
            focusTrapSettings={{containerElements}}
        >
            <FocusTrapContainerElement
                onContainerElementChanged={setHeaderWithBackButtonContainerElement}
                style={[styles.w100]}
            >
                <HeaderWithBackButton
                    title="Add unreported expanse"
                    onBackButtonPress={navigation.goBack}
                />
            </FocusTrapContainerElement>
            <View>
                <ScrollView>
                <SelectionList<Option & ListItem>
                    ref={selectionListRef}
                    onSelectRow={() => {}}
                    shouldShowTextInput={false}
                    canSelectMultiple
                    sections={sections}
                    ListItem={unreportedExpenseListItem}
                    onConfirm={()=>{console.log(unreportedExpensesList)}}
                    confirmButtonStyles={styles.mb5}
                    />
                </ScrollView>
            </View>
            {/* {unreportedExpensesList.map((item) => ( */}
            {/*     <View style={styles.m5}> */}
            {/*         <TransactionItemComponent transactionItem={item} isLargeScreenWidth={false} isSelected={false}/> */}
            {/*     </View> */}
            {/* ))} */}
            {/* <Button */}
            {/*     text="Add to report" */}
            {/*     onPress={()=>{ */}
            {/*         console.log(unreportedExpensesList) */}
            {/*     }} */}
            {/*     style={styles.w100} */}
            {/*     success */}
            {/*     large */}
            {/* /> */}
        </ScreenWrapper>

    )
}

export default AddUnreportedExpense;
