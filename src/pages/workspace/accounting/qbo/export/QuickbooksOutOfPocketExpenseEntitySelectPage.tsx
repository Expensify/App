import React, {useCallback} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import CONST from '@src/CONST';

const CARDS = {
    CHECK: 'check',
    JOURNAL_ENTRY: 'journal_entry',
    VENDOR_BILL: 'vendor_bill',
};

function QuickbooksOutOfPocketExpenseEntitySelectPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {nonReimbursableExpensesExportDestination, syncTaxes} = policy?.connections?.quickbooksOnline?.config ?? {};
    const isTaxesEnabled = Boolean(syncTaxes && syncTaxes !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE);

    // const policyID = policy?.id ?? '';
    const data = [
        {
            value: CARDS.CHECK,
            text: translate(`workspace.qbo.check`),
            keyForList: CARDS.CHECK,
            isSelected: nonReimbursableExpensesExportDestination === CARDS.CHECK,
            isShown: true,
        },
        {
            value: CARDS.JOURNAL_ENTRY,
            text: translate(`workspace.qbo.journalEntry`),
            keyForList: CARDS.JOURNAL_ENTRY,
            isSelected: nonReimbursableExpensesExportDestination === CARDS.JOURNAL_ENTRY,
            isShown: !isTaxesEnabled,
        },
        {
            value: CARDS.VENDOR_BILL,
            text: translate(`workspace.qbo.vendorBill`),
            keyForList: CARDS.VENDOR_BILL,
            isSelected: nonReimbursableExpensesExportDestination === CARDS.VENDOR_BILL,
            isShown: true,
        },
    ];

    const updateMode = useCallback((mode: {value: string}) => {
        // TODO add API call for change
    }, []);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={QuickbooksOutOfPocketExpenseEntitySelectPage.displayName}
        >
            <HeaderWithBackButton title={translate('workspace.qbo.exportAs')} />
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.qbo.optionBelow')}</Text>
            <ScrollView contentContainerStyle={styles.pb2}>
                <SelectionList
                    sections={[{data: data.filter((item) => item.isShown)}]}
                    ListItem={RadioListItem}
                    onSelectRow={updateMode}
                    initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
                />
                <Text style={[styles.mutedTextLabel, styles.pt2, styles.ph5]}>{translate('workspace.qbo.outOfPocketTaxEnabledDescription')}</Text>
            </ScrollView>
        </ScreenWrapper>
    );
}

QuickbooksOutOfPocketExpenseEntitySelectPage.displayName = 'QuickbooksOutOfPocketExpenseEntitySelectPage';

export default withPolicy(QuickbooksOutOfPocketExpenseEntitySelectPage);
