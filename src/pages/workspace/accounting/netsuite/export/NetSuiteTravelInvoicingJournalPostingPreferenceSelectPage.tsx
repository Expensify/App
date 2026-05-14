import type {ValueOf} from 'type-fest';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import type {SelectorType} from '@components/SelectionScreen';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateNetSuiteTravelInvoicingJournalPostingPreference} from '@libs/actions/connections/NetSuiteCommands';
import {getLatestErrorField} from '@libs/ErrorUtils';
import {settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import {clearNetSuiteErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type MenuListItem = ListItem & {
    value: ValueOf<typeof CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE>;
};

function NetSuiteTravelInvoicingJournalPostingPreferenceSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? String(CONST.DEFAULT_NUMBER_ID);
    const config = policy?.connections?.netsuite?.options.config;

    const selectedValue =
        Object.values(CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE).find((value) => value === config?.travelInvoicingJournalPostingPreference) ??
        CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE;

    const data: MenuListItem[] = Object.values(CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE).map((postingPreference) => ({
        value: postingPreference,
        text: translate(`workspace.netsuite.journalPostingPreference.values.${postingPreference}`),
        keyForList: postingPreference,
        isSelected: selectedValue === postingPreference,
    }));

    const goBack = () => {
        Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_TRAVEL_INVOICING_CONFIGURATION.getRoute(policyID));
    };

    const selectPostingPreference = (row: MenuListItem) => {
        if (row.value !== config?.travelInvoicingJournalPostingPreference) {
            updateNetSuiteTravelInvoicingJournalPostingPreference(policyID, row.value, config?.travelInvoicingJournalPostingPreference);
        }
        goBack();
    };

    return (
        <SelectionScreen
            displayName="NetSuiteTravelInvoicingJournalPostingPreferenceSelectPage"
            title="workspace.netsuite.journalPostingPreference.label"
            data={data}
            onSelectRow={(selection: SelectorType) => selectPostingPreference(selection as MenuListItem)}
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            onBackButtonPress={goBack}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            pendingAction={settingsPendingAction([CONST.NETSUITE_CONFIG.TRAVEL_INVOICING_JOURNAL_POSTING_PREFERENCE], config?.pendingFields)}
            errors={getLatestErrorField(config, CONST.NETSUITE_CONFIG.TRAVEL_INVOICING_JOURNAL_POSTING_PREFERENCE)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.TRAVEL_INVOICING_JOURNAL_POSTING_PREFERENCE)}
        />
    );
}

export default withPolicyConnections(NetSuiteTravelInvoicingJournalPostingPreferenceSelectPage);
