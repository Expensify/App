import ConnectionLayout from '@components/ConnectionLayout';
import FormHelpMessage from '@components/FormHelpMessage';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import OfflineWithFeedback from '@components/OfflineWithFeedback';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';

import {
    exportExpensesDestinationSettingName,
    shouldHideJournalPostingPreference,
    shouldHideNonReimbursableJournalPostingAccount,
    shouldHideReimbursableDefaultVendor,
    shouldHideReimbursableJournalPostingAccount,
} from '@pages/workspace/accounting/netsuite/utils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import {useRoute} from '@react-navigation/native';
import React, {useMemo} from 'react';

function DynamicNetSuiteExportExpensesPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_NETSUITE_EXPORT_EXPENSES>>();
    const params = route.params;
    const isReimbursable = params.expenseType === CONST.NETSUITE_EXPENSE_TYPE.REIMBURSABLE;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES.path);

    const config = policy?.connections?.netsuite?.options.config;

    const exportDestinationSettingName = exportExpensesDestinationSettingName(isReimbursable);
    const exportDestination = config?.[exportDestinationSettingName];
    const helperTextType = isReimbursable ? 'reimbursableDescription' : 'nonReimbursableDescription';

    const {vendors, payableList} = policy?.connections?.netsuite?.options?.data ?? {};

    const defaultVendor = useMemo(() => vendors?.find(({id}) => id === config?.defaultVendor), [vendors, config?.defaultVendor]);

    const selectedPayableAccount = useMemo(() => payableList?.find(({id}) => id === config?.payableAcct), [payableList, config?.payableAcct]);

    const selectedReimbursablePayableAccount = useMemo(() => payableList?.find(({id}) => id === config?.reimbursablePayableAccount), [payableList, config?.reimbursablePayableAccount]);

    const navigateToStep = (path: Parameters<typeof createDynamicRoute>[0]) => {
        if (!policyID) {
            return;
        }
        Navigation.navigate(createDynamicRoute(path));
    };

    return (
        <ConnectionLayout
            displayName="DynamicNetSuiteExportExpensesPage"
            onBackButtonPress={() => Navigation.goBack(backPath)}
            headerTitle={`workspace.accounting.${isReimbursable ? 'exportOutOfPocket' : 'exportCompanyCard'}`}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
        >
            <OfflineWithFeedback pendingAction={settingsPendingAction([exportDestinationSettingName], config?.pendingFields)}>
                <MenuItemField
                    name={translate('workspace.accounting.exportAs')}
                    value={exportDestination ? translate(`workspace.netsuite.exportDestination.values.${exportDestination}.label`) : undefined}
                    onPress={() => navigateToStep(DYNAMIC_ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_DESTINATION_SELECT.path)}
                >
                    {areSettingsInErrorFields([exportDestinationSettingName], config?.errorFields) && <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />}
                </MenuItemField>
                {!!exportDestination && (
                    <FormHelpMessage
                        isError={false}
                        shouldShowRedDotIndicator={false}
                        message={translate(`workspace.netsuite.exportDestination.values.${exportDestination}.${helperTextType}`)}
                        shouldRenderMessageAsHTML
                        style={[styles.mt0, styles.mb0, styles.ph5, styles.pb5]}
                    />
                )}
            </OfflineWithFeedback>
            {!shouldHideReimbursableDefaultVendor(isReimbursable, config) && (
                <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.NETSUITE_CONFIG.DEFAULT_VENDOR], config?.pendingFields)}>
                    <MenuItemField
                        name={translate('workspace.accounting.defaultVendor')}
                        value={defaultVendor?.name}
                        onPress={() => navigateToStep(DYNAMIC_ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_VENDOR_SELECT.path)}
                    >
                        {areSettingsInErrorFields([CONST.NETSUITE_CONFIG.DEFAULT_VENDOR], config?.errorFields) && (
                            <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                        )}
                    </MenuItemField>
                </OfflineWithFeedback>
            )}
            {!shouldHideNonReimbursableJournalPostingAccount(isReimbursable, config) && (
                <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.NETSUITE_CONFIG.PAYABLE_ACCT], config?.pendingFields)}>
                    <MenuItemField
                        name={translate('workspace.netsuite.nonReimbursableJournalPostingAccount')}
                        value={selectedPayableAccount?.name}
                        onPress={() => navigateToStep(DYNAMIC_ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_PAYABLE_ACCOUNT_SELECT.path)}
                    >
                        {areSettingsInErrorFields([CONST.NETSUITE_CONFIG.PAYABLE_ACCT], config?.errorFields) && (
                            <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                        )}
                    </MenuItemField>
                </OfflineWithFeedback>
            )}
            {!shouldHideReimbursableJournalPostingAccount(isReimbursable, config) && (
                <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.NETSUITE_CONFIG.REIMBURSABLE_PAYABLE_ACCOUNT], config?.pendingFields)}>
                    <MenuItemField
                        name={translate('workspace.netsuite.reimbursableJournalPostingAccount')}
                        value={selectedReimbursablePayableAccount?.name}
                        onPress={() => navigateToStep(DYNAMIC_ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_PAYABLE_ACCOUNT_SELECT.path)}
                    >
                        {areSettingsInErrorFields([CONST.NETSUITE_CONFIG.REIMBURSABLE_PAYABLE_ACCOUNT], config?.errorFields) && (
                            <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                        )}
                    </MenuItemField>
                </OfflineWithFeedback>
            )}
            {!shouldHideJournalPostingPreference(isReimbursable, config) && (
                <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.NETSUITE_CONFIG.JOURNAL_POSTING_PREFERENCE], config?.pendingFields)}>
                    <MenuItemField
                        name={translate('workspace.netsuite.journalPostingPreference.label')}
                        value={translate(
                            `workspace.netsuite.journalPostingPreference.values.${config?.journalPostingPreference ?? CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE}`,
                        )}
                        onPress={() => navigateToStep(DYNAMIC_ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_JOURNAL_POSTING_PREFERENCE_SELECT.path)}
                    >
                        {areSettingsInErrorFields([CONST.NETSUITE_CONFIG.JOURNAL_POSTING_PREFERENCE], config?.errorFields) && (
                            <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                        )}
                    </MenuItemField>
                </OfflineWithFeedback>
            )}
        </ConnectionLayout>
    );
}

export default withPolicyConnections(DynamicNetSuiteExportExpensesPage);
