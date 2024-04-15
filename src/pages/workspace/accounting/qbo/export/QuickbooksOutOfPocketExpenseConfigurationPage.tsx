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

const isVendorBill = true;
function QuickbooksOutOfPocketExpenseConfigurationPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '';
    const {syncLocations} = policy?.connections?.quickbooksOnline?.config ?? {};
    const isLocationEnabled = Boolean(syncLocations && syncLocations !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={QuickbooksOutOfPocketExpenseConfigurationPage.displayName}
        >
            <HeaderWithBackButton title={translate('workspace.qbo.exportExpenses')} />
            <ScrollView contentContainerStyle={styles.pb2}>
                {!isLocationEnabled && <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.qbo.exportOutOfPocketExpensesDescription')}</Text>}
                <OfflineWithFeedback>
                    <MenuItemWithTopDescription
                        title={isLocationEnabled ? translate('workspace.qbo.journalEntry') : 'Vendor Bill'}
                        description={translate('workspace.qbo.exportAs')}
                        onPress={() => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_SELECT.getRoute(policyID))}
                        brickRoadIndicator={undefined}
                        shouldShowRightIcon={!isLocationEnabled}
                        interactive={!isLocationEnabled}
                    />
                </OfflineWithFeedback>
                {isVendorBill && !isLocationEnabled && <Text style={[styles.ph5, styles.mutedTextLabel, styles.pt2]}>{translate('workspace.qbo.exportVendorBillDescription')}</Text>}
                {isLocationEnabled && <Text style={[styles.ph5, styles.mutedTextLabel, styles.pt2]}>{translate('workspace.qbo.outOfPocketLocationEnabledDescription')}</Text>}
                {!isLocationEnabled && (
                    <OfflineWithFeedback>
                        <MenuItemWithTopDescription
                            title="Accounts Payable (A/P)"
                            onPress={() => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT_SELECT.getRoute(policyID))}
                            brickRoadIndicator={undefined}
                            shouldShowRightIcon
                        />
                    </OfflineWithFeedback>
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}

QuickbooksOutOfPocketExpenseConfigurationPage.displayName = 'QuickbooksExportOutOfPocketExpensesPage';

export default withPolicy(QuickbooksOutOfPocketExpenseConfigurationPage);
