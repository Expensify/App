import React, { useMemo, useRef, useState } from 'react';
import {Text, View} from 'react-native';
import Button from '@components/Button';
import FocusTrapContainerElement from '@components/FocusTrap/FocusTrapContainerElement';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import type {ListItem, SelectionListHandle} from '@components/SelectionList/types';
import navigation from '@navigation/Navigation';
import styles from '@src/styles';
import SelectionList from '@components/SelectionList';
import type {Option} from '@libs/OptionsListUtils';
import {getAllTransactions} from '@userActions/Transaction';
import NewChatSelectorPage from './NewChatSelectorPage';
import RadioListItem from '@components/SelectionList/RadioListItem';


function AddUnreportedExpense() {

    const [headerWithBackBtnContainerElement, setHeaderWithBackButtonContainerElement] = useState<HTMLElement | null>(null);
    const containerElements = useMemo(() => {
        return [headerWithBackBtnContainerElement].filter((element) => !!element) as HTMLElement[];
    }, [headerWithBackBtnContainerElement]);
    const selectionListRef = useRef<SelectionListHandle>(null);
    const unreportedExpensesList = Object.values(getAllTransactions()).filter((item)=>item.reportID==='0')
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
                <SelectionList<Option & ListItem>
                    ref={selectionListRef}
                    onSelectRow={() => {}}
                    shouldShowTextInput={false}
                    canSelectMultiple
                    sections={[]}
                    ListItem={RadioListItem}
                    items={unreportedExpensesList}/>

            </View>
            <Button
                text="Add to report"
                onPress={()=>{
                    console.log(unreportedExpensesList)
                }}
                style={styles.w100}
                success
                large
            />
        </ScreenWrapper>

    )
}

export default AddUnreportedExpense;
