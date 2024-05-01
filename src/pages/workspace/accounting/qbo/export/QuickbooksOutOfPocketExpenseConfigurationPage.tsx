import React from 'react';
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
    const policyID = policy?.id ?? '';
    const {syncLocations, exportAccount, exportEntity, errorFields, syncTax, pendingFields} = policy?.connections?.quickbooksOnline?.config ?? {};
    const isLocationEnabled = Boolean(syncLocations && syncLocations !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE);
    const isTaxesEnabled = Boolean(syncTax);
    const shouldShowTaxError = isTaxesEnabled && exportEntity === CONST.QUICKBOOKS_EXPORT_ENTITY.JOURNAL_ENTRY;
    const shouldShowLocationError = isLocationEnabled && exportEntity !== CONST.QUICKBOOKS_EXPORT_ENTITY.JOURNAL_ENTRY;
    const hasErrors = Boolean(errorFields?.exportEntity) || shouldShowTaxError || shouldShowLocationError;

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
                <HeaderWithBackButton title={translate('workspace.qbo.exportExpenses')} />
                <ScrollView contentContainerStyle={styles.pb2}>
                    {!isLocationEnabled && <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.qbo.exportOutOfPocketExpensesDescription')}</Text>}
                    <OfflineWithFeedback pendingAction={pendingFields?.exportEntity}>
                        <MenuItemWithTopDescription
                            title={exportEntity ? translate(`workspace.qbo.${exportEntity}`) : undefined}
                            description={translate('workspace.qbo.exportAs')}
                            error={hasErrors && exportEntity ? translate(`workspace.qbo.${exportEntity}Error`) : undefined}
                            onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_SELECT.getRoute(policyID))}
                            brickRoadIndicator={hasErrors ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                            shouldShowRightIcon
                        />
                    </OfflineWithFeedback>
                    {exportEntity === CONST.QUICKBOOKS_EXPORT_ENTITY.VENDOR_BILL && !isLocationEnabled && (
                        <Text style={[styles.ph5, styles.mutedNormalTextLabel, styles.pt1, styles.pb2]}>{translate('workspace.qbo.exportVendorBillDescription')}</Text>
                    )}
                    {isLocationEnabled && <Text style={[styles.ph5, styles.mutedNormalTextLabel, styles.pt1]}>{translate('workspace.qbo.outOfPocketLocationEnabledDescription')}</Text>}
                    {!isLocationEnabled && (
                        <OfflineWithFeedback pendingAction={pendingFields?.exportAccount}>
                            <MenuItemWithTopDescription
                                title={exportAccount}
                                description={translate('workspace.qbo.accountsPayable')}
                                onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_ACCOUNT_SELECT.getRoute(policyID))}
                                brickRoadIndicator={errorFields?.exportAccount ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                                shouldShowRightIcon
                                error={errorFields?.exportAccount ? translate('common.genericErrorMessage') : undefined}
                                // TODO uncomment when errorText will be fixed
                                // errorText={errors?.exportAccount}
                            />
                        </OfflineWithFeedback>
                    )}
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

QuickbooksOutOfPocketExpenseConfigurationPage.displayName = 'QuickbooksExportOutOfPocketExpensesPage';

export default withPolicyConnections(QuickbooksOutOfPocketExpenseConfigurationPage);
