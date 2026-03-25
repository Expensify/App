import {useRoute} from '@react-navigation/native';
import React, {useCallback} from 'react';
import type {ValueOf} from 'type-fest';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import type {SelectorType} from '@components/SelectionScreen';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateNetSuiteJournalPostingPreference} from '@libs/actions/connections/NetSuiteCommands';
import {getLatestErrorField} from '@libs/ErrorUtils';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import {clearNetSuiteErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type MenuListItem = ListItem & {
    value: ValueOf<typeof CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE>;
};

function NetSuiteExportExpensesJournalPostingPreferenceSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const config = policy?.connections?.netsuite?.options.config;

    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_EXPORT_EXPENSES_JOURNAL_POSTING_PREFERENCE_SELECT>>();
    const params = route.params;
    const backTo = params.backTo;
    const isReimbursable = params.expenseType === CONST.NETSUITE_EXPENSE_TYPE.REIMBURSABLE;

    const selectedValue =
        Object.values(CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE).find((value) => value === config?.journalPostingPreference) ??
        CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE;

    const data: MenuListItem[] = Object.values(CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE).map((postingPreference) => ({
        value: postingPreference,
        text: translate(`workspace.netsuite.journalPostingPreference.values.${postingPreference}`),
        keyForList: postingPreference,
        isSelected: selectedValue === postingPreference,
    }));

    const goBack = useCallback(() => {
        Navigation.goBack(backTo ?? ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES.getRoute(policyID, params.expenseType));
    }, [policyID, params.expenseType, backTo]);

    const selectPostingPreference = useCallback(
        (row: MenuListItem) => {
            if (row.value !== config?.journalPostingPreference && policyID) {
                updateNetSuiteJournalPostingPreference(policyID, row.value, config?.journalPostingPreference);
            }
            goBack();
        },
        [config?.journalPostingPreference, goBack, policyID],
    );

    return (
        <SelectionScreen
            displayName="NetSuiteExportExpensesJournalPostingPreferenceSelectPage"
            title="workspace.netsuite.journalPostingPreference.label"
            data={data}
            listItem={RadioListItem}
            onSelectRow={(selection: SelectorType) => selectPostingPreference(selection as MenuListItem)}
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            onBackButtonPress={goBack}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            shouldBeBlocked={
                isReimbursable
                    ? config?.reimbursableExpensesExportDestination !== CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY
                    : config?.nonreimbursableExpensesExportDestination !== CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY
            }
            pendingAction={settingsPendingAction([CONST.NETSUITE_CONFIG.JOURNAL_POSTING_PREFERENCE], config?.pendingFields)}
            errors={getLatestErrorField(config, CONST.NETSUITE_CONFIG.JOURNAL_POSTING_PREFERENCE)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.JOURNAL_POSTING_PREFERENCE)}
        />
    );
}

export default withPolicyConnections(NetSuiteExportExpensesJournalPostingPreferenceSelectPage);
