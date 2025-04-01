import React, {useRef} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import type {ListItem, SectionListDataType, SelectionListHandle} from '@components/SelectionList/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import {buildOptimisticMovedTransactionAction} from '@libs/ReportUtils';
import navigation from '@navigation/Navigation';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import {getAllTransactions} from '@userActions/Transaction';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type Transaction from '@src/types/onyx/Transaction';
import NewChatSelectorPage from './NewChatSelectorPage';
import UnreportedExpenseListItem from './UnreportedExpenseListItem';

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
    const selectedIds = new Set();

    Array.from(selectedIds).map((value) => buildOptimisticMovedTransactionAction(0, reportId, value.transactionId));

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
                    if (selectedIds.has(item)) {
                        selectedIds.delete(item);
                    } else {
                        selectedIds.add(item);
                    }
                }}
                shouldShowTextInput={false}
                canSelectMultiple
                sections={sections}
                ListItem={UnreportedExpenseListItem}
                confirmButtonStyles={[styles.justifyContentCenter]}
                showConfirmButton
                confirmButtonText="Add to report"
                onConfirm={() => {
                    const result = Array.from(selectedIds).reduce((acc, value) => {
                        console.log('Processing transactionID:', value.transactionID); // log transactionID
                        const action = buildOptimisticMovedTransactionAction('0', reportId, value.transactionID);
                        console.log('Action created:', action); // log action
                        acc[value.transactionID] = action;
                        return acc;
                    }, {});

                    debugger;

                    const resultStringArray = Array.from(selectedIds).map(
                        (element) => element.transactionID,
                        // `{${Object.entries(element)
                        //     .map(([key, value]) => `${key}: ${value}`)
                        //     .join(', ')}}`,
                    );

                    Navigation.goBack(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: reportId, backTo: Navigation.getActiveRoute()}));
                    API.write(WRITE_COMMANDS.CHANGE_TRANSACTIONS_REPORT, {
                        transactionList: resultStringArray.join("', '"),
                        reportID: reportId,
                        reportActionIDToThreadReportIDMap: JSON.stringify(result),
                    });
                }}
            />
        </ScreenWrapper>
    );
}

export default AddUnreportedExpense;
