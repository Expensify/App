import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import SelectionScreen from '@components/SelectionScreen';
import type {SelectorType} from '@components/SelectionScreen';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateNetSuiteExportJournalsTo} from '@libs/actions/connections/NetSuiteCommands';
import {getLatestErrorField} from '@libs/ErrorUtils';
import {settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import {clearNetSuiteErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type MenuListItem = ListItem & {
    value: ValueOf<typeof CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL>;
};

function NetSuiteJournalEntryApprovalLevelSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const policyID = policy?.id;
    const styles = useThemeStyles();
    const config = policy?.connections?.netsuite?.options.config;
    const data: MenuListItem[] = Object.values(CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL).map((approvalType) => ({
        value: approvalType,
        text: translate(`workspace.netsuite.advancedConfig.exportJournalsTo.values.${approvalType}`),
        keyForList: approvalType,
        isSelected: config?.syncOptions.exportJournalsTo === approvalType,
    }));

    const headerContent = useMemo(
        () => (
            <View>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.netsuite.advancedConfig.exportJournalsTo.description')}</Text>
            </View>
        ),
        [translate, styles.pb5, styles.ph5],
    );

    const selectJournalApprovalLevel = useCallback(
        (row: MenuListItem) => {
            if (row.value !== config?.syncOptions.exportJournalsTo && policyID) {
                updateNetSuiteExportJournalsTo(policyID, row.value, config?.syncOptions.exportJournalsTo ?? CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_ADVANCED.getRoute(policyID));
        },
        [config?.syncOptions.exportJournalsTo, policyID],
    );

    return (
        <SelectionScreen
            displayName="NetSuiteJournalEntryApprovalLevelSelectPage"
            title="workspace.netsuite.advancedConfig.exportJournalsTo.label"
            headerContent={headerContent}
            data={data}
            listItem={RadioListItem}
            onSelectRow={(selection: SelectorType) => selectJournalApprovalLevel(selection as MenuListItem)}
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_ADVANCED.getRoute(policyID))}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            shouldBeBlocked={
                config?.reimbursableExpensesExportDestination !== CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY &&
                config?.nonreimbursableExpensesExportDestination !== CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY
            }
            pendingAction={settingsPendingAction([CONST.NETSUITE_CONFIG.SYNC_OPTIONS.EXPORT_JOURNALS_TO], config?.pendingFields)}
            errors={getLatestErrorField(config, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.EXPORT_JOURNALS_TO)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.EXPORT_JOURNALS_TO)}
        />
    );
}

export default withPolicyConnections(NetSuiteJournalEntryApprovalLevelSelectPage);
