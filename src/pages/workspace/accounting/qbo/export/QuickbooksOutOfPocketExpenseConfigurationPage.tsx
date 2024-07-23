import React, {useMemo} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function QuickbooksOutOfPocketExpenseConfigurationPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const {syncLocations, syncTax, reimbursableExpensesAccount, reimbursableExpensesExportDestination, errorFields, pendingFields} = policy?.connections?.quickbooksOnline?.config ?? {};
    const isLocationEnabled = !!(syncLocations && syncLocations !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE);
    const isTaxesEnabled = !!syncTax;
    const shouldShowTaxError = isTaxesEnabled && reimbursableExpensesExportDestination === CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY;
    const shouldShowLocationError = isLocationEnabled && reimbursableExpensesExportDestination !== CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY;
    const hasErrors = !!errorFields?.reimbursableExpensesExportDestination || shouldShowTaxError || shouldShowLocationError;
    const [exportHintText, accountDescription] = useMemo(() => {
        let hintText: string | undefined;
        let description: string | undefined;
        switch (reimbursableExpensesExportDestination) {
            case CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK:
                hintText = isLocationEnabled ? undefined : translate('workspace.qbo.exportCheckDescription');
                description = translate('workspace.qbo.bankAccount');
                break;
            case CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY:
                hintText = isTaxesEnabled ? undefined : translate('workspace.qbo.exportJournalEntryDescription');
                description = translate('workspace.qbo.account');
                break;
            case CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL:
                hintText = isLocationEnabled ? undefined : translate('workspace.qbo.exportVendorBillDescription');
                description = translate('workspace.qbo.accountsPayable');
                break;
            default:
                break;
        }

        return [hintText, description];
    }, [translate, reimbursableExpensesExportDestination, isLocationEnabled, isTaxesEnabled]);

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                testID={QuickbooksOutOfPocketExpenseConfigurationPage.displayName}
            >
                <HeaderWithBackButton title={translate('workspace.accounting.exportOutOfPocket')} />
                <ScrollView contentContainerStyle={styles.pb2}>
                    <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.qbo.exportOutOfPocketExpensesDescription')}</Text>
                    <OfflineWithFeedback pendingAction={pendingFields?.reimbursableExpensesExportDestination}>
                        <MenuItemWithTopDescription
                            title={reimbursableExpensesExportDestination ? translate(`workspace.qbo.accounts.${reimbursableExpensesExportDestination}`) : undefined}
                            description={translate('workspace.accounting.exportAs')}
                            errorText={hasErrors && reimbursableExpensesExportDestination ? translate(`workspace.qbo.accounts.${reimbursableExpensesExportDestination}Error`) : undefined}
                            onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_SELECT.getRoute(policyID))}
                            brickRoadIndicator={hasErrors ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                            shouldShowRightIcon
                            hintText={exportHintText}
                        />
                    </OfflineWithFeedback>
                    <OfflineWithFeedback pendingAction={pendingFields?.reimbursableExpensesAccount}>
                        <MenuItemWithTopDescription
                            title={reimbursableExpensesAccount?.name}
                            description={accountDescription}
                            onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_ACCOUNT_SELECT.getRoute(policyID))}
                            brickRoadIndicator={errorFields?.exportAccount ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                            shouldShowRightIcon
                            errorText={errorFields?.exportAccount ? translate('common.genericErrorMessage') : undefined}
                        />
                    </OfflineWithFeedback>
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

QuickbooksOutOfPocketExpenseConfigurationPage.displayName = 'QuickbooksExportOutOfPocketExpensesPage';

export default withPolicyConnections(QuickbooksOutOfPocketExpenseConfigurationPage);
