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
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function QuickbooksOutOfPocketExpenseConfigurationPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '';
    const {syncLocations, exportAccount, exportEntity, errors, syncTaxes, pendingFields} = policy?.connections?.quickbooksOnline?.config ?? {};
    const isLocationEnabled = Boolean(syncLocations && syncLocations !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE);
    const isTaxesEnabled = Boolean(syncTaxes && syncTaxes !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE);
    const shouldShowTaxError = isTaxesEnabled && exportEntity === CONST.QUICKBOOKS_EXPORT_ENTITY.JOURNAL_ENTRY;
    const shouldShowLocationError = isLocationEnabled && exportEntity !== CONST.QUICKBOOKS_EXPORT_ENTITY.JOURNAL_ENTRY;
    const hasErrors = Boolean(errors?.exportEntity) || shouldShowTaxError || shouldShowLocationError;

    return (
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
                        error={exportEntity && (shouldShowTaxError || shouldShowLocationError) ? translate(`workspace.qbo.${exportEntity}Error`) : undefined}
                        onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_SELECT.getRoute(policyID))}
                        brickRoadIndicator={hasErrors ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                        shouldShowRightIcon
                    />
                </OfflineWithFeedback>
                {exportEntity === CONST.QUICKBOOKS_EXPORT_ENTITY.VENDOR_BILL && !isLocationEnabled && (
                    <Text style={[styles.ph5, styles.mutedNormalTextLabel, styles.pt1, styles.pb1]}>{translate('workspace.qbo.exportVendorBillDescription')}</Text>
                )}
                {isLocationEnabled && <Text style={[styles.ph5, styles.mutedNormalTextLabel, styles.pt1]}>{translate('workspace.qbo.outOfPocketLocationEnabledDescription')}</Text>}
                {!isLocationEnabled && (
                    <OfflineWithFeedback pendingAction={pendingFields?.exportAccount}>
                        <MenuItemWithTopDescription
                            title={exportAccount}
                            description={translate('workspace.qbo.accountsPayable')}
                            onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_ACCOUNT_SELECT.getRoute(policyID))}
                            brickRoadIndicator={errors?.exportAccount ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                            shouldShowRightIcon
                            error={errors?.exportAccount ? translate('common.genericErrorMessage') : undefined}
                        />
                    </OfflineWithFeedback>
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}

QuickbooksOutOfPocketExpenseConfigurationPage.displayName = 'QuickbooksExportOutOfPocketExpensesPage';

export default withPolicy(QuickbooksOutOfPocketExpenseConfigurationPage);
