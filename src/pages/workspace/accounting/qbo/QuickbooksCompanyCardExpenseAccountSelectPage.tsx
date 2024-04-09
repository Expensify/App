import React, {useCallback} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';

const CARDS = {
    CREDIT_CARD: 'credit_card',
    DEBIT_CARD: 'debit_card',
    VENDOR_BILL: 'vendor_bill',
};

function QuickbooksCompanyCardExpenseAccountSelectPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {nonReimbursableExpensesExportDestination} = policy?.connections?.quickbooksOnline?.config ?? {};
    // const policyID = policy?.id ?? '';
    const data = [
        {
            value: CARDS.CREDIT_CARD,
            text: translate(`workspace.qbo.creditCard`),
            keyForList: CARDS.CREDIT_CARD,
            isSelected: nonReimbursableExpensesExportDestination === CARDS.CREDIT_CARD,
        },
        {
            value: CARDS.DEBIT_CARD,
            text: translate(`workspace.qbo.debitCard`),
            keyForList: CARDS.DEBIT_CARD,
            isSelected: nonReimbursableExpensesExportDestination === CARDS.DEBIT_CARD,
        },
        {
            value: CARDS.VENDOR_BILL,
            text: translate(`workspace.qbo.vendorBill`),
            keyForList: CARDS.VENDOR_BILL,
            isSelected: nonReimbursableExpensesExportDestination === CARDS.VENDOR_BILL,
        },
    ];

    const updateMode = useCallback((mode: {value: string}) => {
        // TODO add API call for change
    }, []);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={QuickbooksCompanyCardExpenseAccountSelectPage.displayName}
        >
            <HeaderWithBackButton title={translate('workspace.qbo.exportAs')} />
            <ScrollView contentContainerStyle={styles.pb2}>
                <SelectionList
                    sections={[{data}]}
                    ListItem={RadioListItem}
                    onSelectRow={updateMode}
                    initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
                />
            </ScrollView>
        </ScreenWrapper>
    );
}

QuickbooksCompanyCardExpenseAccountSelectPage.displayName = 'QuickbooksCompanyCardExpenseAccountSelectPage';

export default withPolicy(QuickbooksCompanyCardExpenseAccountSelectPage);
