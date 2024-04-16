import React, {useCallback} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function QuickbooksOutOfPocketExpenseEntitySelectPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {exportEntity, syncTaxes} = policy?.connections?.quickbooksOnline?.config ?? {};
    const isTaxesEnabled = Boolean(syncTaxes && syncTaxes !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE);

    const policyID = policy?.id ?? '';
    const data = [
        {
            value: CONST.QUICKBOOKS_EXPORT_ENTITY.CHECK,
            text: translate(`workspace.qbo.check`),
            keyForList: CONST.QUICKBOOKS_EXPORT_ENTITY.CHECK,
            isSelected: exportEntity === CONST.QUICKBOOKS_EXPORT_ENTITY.CHECK,
            isShown: true,
        },
        {
            value: CONST.QUICKBOOKS_EXPORT_ENTITY.JOURNAL_ENTRY,
            text: translate(`workspace.qbo.journalEntry`),
            keyForList: CONST.QUICKBOOKS_EXPORT_ENTITY.JOURNAL_ENTRY,
            isSelected: exportEntity === CONST.QUICKBOOKS_EXPORT_ENTITY.JOURNAL_ENTRY,
            isShown: !isTaxesEnabled,
        },
        {
            value: CONST.QUICKBOOKS_EXPORT_ENTITY.VENDOR_BILL,
            text: translate(`workspace.qbo.vendorBill`),
            keyForList: CONST.QUICKBOOKS_EXPORT_ENTITY.VENDOR_BILL,
            isSelected: exportEntity === CONST.QUICKBOOKS_EXPORT_ENTITY.VENDOR_BILL,
            isShown: true,
        },
    ];

    const onSelectRow = useCallback(
        (row: {value: string}) => {
            if (exportEntity && row.value === exportEntity) {
                Navigation.goBack(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES.getRoute(policyID));
                return;
            }
            Policy.updatePolicyConnectionConfig(policyID, CONST.QUICK_BOOKS_CONFIG.EXPORT_ENTITY, row.value);
            Navigation.goBack(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES.getRoute(policyID));
        },
        [exportEntity, policyID],
    );

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
                    onSelectRow={onSelectRow}
                    initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
                />
                <Text style={[styles.mutedTextLabel, styles.pt2, styles.ph5]}>{translate('workspace.qbo.outOfPocketTaxEnabledDescription')}</Text>
            </ScrollView>
        </ScreenWrapper>
    );
}

QuickbooksOutOfPocketExpenseEntitySelectPage.displayName = 'QuickbooksOutOfPocketExpenseEntitySelectPage';

export default withPolicy(QuickbooksOutOfPocketExpenseEntitySelectPage);
