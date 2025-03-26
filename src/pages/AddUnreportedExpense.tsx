import React, {useRef} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import type {ListItem, SectionListDataType, SelectionListHandle} from '@components/SelectionList/types';
import useThemeStyles from '@hooks/useThemeStyles';
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
                    if (selectedIds.has(item.transactionID)) {
                        selectedIds.delete(item.transactionID);
                    } else {
                        selectedIds.add(item.transactionID);
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
                    Navigation.goBack(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: reportId, backTo: Navigation.getActiveRoute()}));
                }}
            />
        </ScreenWrapper>
    );
}

export default AddUnreportedExpense;
