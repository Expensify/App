import {useRoute} from '@react-navigation/native';
import React, {useCallback, useMemo} from 'react';
import BlockingView from '@components/BlockingViews/BlockingView';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {SelectorType} from '@components/SelectionScreen';
import SelectionScreen from '@components/SelectionScreen';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateNetSuitePayableAcct, updateNetSuiteReimbursablePayableAccount} from '@libs/actions/connections/NetSuiteCommands';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getNetSuitePayableAccountOptions, settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import {clearNetSuiteErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

function NetSuiteExportExpensesPayableAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const policyID = policy?.id;
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_EXPORT_EXPENSES_PAYABLE_ACCOUNT_SELECT>>();
    const params = route.params;
    const backTo = params.backTo;
    const isReimbursable = params.expenseType === CONST.NETSUITE_EXPENSE_TYPE.REIMBURSABLE;

    const config = policy?.connections?.netsuite?.options.config;
    const currentSettingName = isReimbursable ? CONST.NETSUITE_CONFIG.REIMBURSABLE_PAYABLE_ACCOUNT : CONST.NETSUITE_CONFIG.PAYABLE_ACCT;
    const currentPayableAccountID = config?.[currentSettingName] ?? CONST.NETSUITE_PAYABLE_ACCOUNT_DEFAULT_VALUE;
    const netsuitePayableAccountOptions = useMemo<SelectorType[]>(() => getNetSuitePayableAccountOptions(policy ?? undefined, currentPayableAccountID), [currentPayableAccountID, policy]);

    const initiallyFocusedOptionKey = useMemo(() => netsuitePayableAccountOptions?.find((mode) => mode.isSelected)?.keyForList, [netsuitePayableAccountOptions]);

    const goBack = useCallback(() => {
        Navigation.goBack(backTo ?? ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES.getRoute(policyID, params.expenseType));
    }, [policyID, params.expenseType, backTo]);

    const updatePayableAccount = useCallback(
        ({value}: SelectorType) => {
            if (currentPayableAccountID !== value && policyID) {
                if (isReimbursable) {
                    updateNetSuiteReimbursablePayableAccount(policyID, value, currentPayableAccountID);
                } else {
                    updateNetSuitePayableAcct(policyID, value, currentPayableAccountID);
                }
            }
            goBack();
        },
        [currentPayableAccountID, policyID, goBack, isReimbursable],
    );

    const listEmptyContent = useMemo(
        () => (
            <BlockingView
                icon={illustrations.Telescope}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workspace.netsuite.noAccountsFound')}
                subtitle={translate('workspace.netsuite.noAccountsFoundDescription')}
                containerStyle={styles.pb10}
            />
        ),
        [translate, styles.pb10, illustrations.Telescope],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="NetSuiteExportExpensesPayableAccountSelectPage"
            data={netsuitePayableAccountOptions}
            listItem={RadioListItem}
            onSelectRow={updatePayableAccount}
            initiallyFocusedOptionKey={initiallyFocusedOptionKey}
            onBackButtonPress={goBack}
            title={isReimbursable ? 'workspace.netsuite.reimbursableJournalPostingAccount' : 'workspace.netsuite.nonReimbursableJournalPostingAccount'}
            listEmptyContent={listEmptyContent}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            shouldBeBlocked={
                isReimbursable
                    ? config?.reimbursableExpensesExportDestination !== CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY
                    : config?.nonreimbursableExpensesExportDestination !== CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY
            }
            pendingAction={settingsPendingAction([currentSettingName], config?.pendingFields)}
            errors={getLatestErrorField(config, currentSettingName)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearNetSuiteErrorField(policyID, currentSettingName)}
        />
    );
}

export default withPolicyConnections(NetSuiteExportExpensesPayableAccountSelectPage);
