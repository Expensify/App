import React, {useCallback} from 'react';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as AccountingUtils from '@libs/AccountingUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import * as Card from '@userActions/Card';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {ConnectionName} from '@src/types/onyx/Policy';

type CardReconciliationPageProps = WithPolicyConnectionsProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.CARD_RECONCILIATION>;

function CardReconciliationPage({policy, route}: CardReconciliationPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const workspaceAccountID = policy?.workspaceAccountID ?? -1;

    const [isContinuousReconciliationOn] = useOnyx(`${ONYXKEYS.COLLECTION.EXPENSIFY_CARD_USE_CONTINUOUS_RECONCILIATION}${workspaceAccountID}`);
    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}`);
    const [currentConnectionName] = useOnyx(`${ONYXKEYS.COLLECTION.EXPENSIFY_CARD_CONTINUOUS_RECONCILIATION_CONNECTION}${workspaceAccountID}`);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);

    const paymentBankAccountID = cardSettings?.paymentBankAccountID ?? 0;
    const bankAccountTitle = bankAccountList?.[paymentBankAccountID]?.title ?? '';

    const policyID = policy?.id ?? '-1';
    const {connection} = route.params;
    const connectionName = AccountingUtils.getConnectionNameFromRouteParam(connection) as ConnectionName;
    const autoSync = !!policy?.connections?.[connectionName]?.config?.autoSync?.enabled;

    const toggleContinuousReconciliation = (value: boolean) => {
        Card.toggleContinuousReconciliation(workspaceAccountID, value, connectionName, currentConnectionName);
        if (value) {
            Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_RECONCILIATION_ACCOUNT_SETTINGS.getRoute(policyID, connection));
        }
    };

    const navigateToAdvancedSettings = useCallback(() => {
        switch (connection) {
            case CONST.POLICY.CONNECTIONS.ROUTE.QBO:
                Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_ADVANCED.getRoute(policyID));
                break;
            case CONST.POLICY.CONNECTIONS.ROUTE.XERO:
                Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_ADVANCED.getRoute(policyID));
                break;
            case CONST.POLICY.CONNECTIONS.ROUTE.NETSUITE:
                Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_ADVANCED.getRoute(policyID));
                break;
            case CONST.POLICY.CONNECTIONS.ROUTE.SAGE_INTACCT:
                Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_ADVANCED.getRoute(policyID));
                break;
            default:
                break;
        }
    }, [connection, policyID]);

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                shouldEnableMaxHeight
                testID={CardReconciliationPage.displayName}
            >
                <HeaderWithBackButton title={translate('workspace.accounting.cardReconciliation')} />
                <ScrollView contentContainerStyle={styles.pb5}>
                    <ToggleSettingOptionRow
                        key={translate('workspace.accounting.continuousReconciliation')}
                        title={translate('workspace.accounting.continuousReconciliation')}
                        subtitle={translate('workspace.accounting.saveHoursOnReconciliation')}
                        shouldPlaceSubtitleBelowSwitch
                        switchAccessibilityLabel={translate('workspace.accounting.continuousReconciliation')}
                        disabled={!autoSync}
                        isActive={!!isContinuousReconciliationOn}
                        onToggle={toggleContinuousReconciliation}
                        wrapperStyle={styles.ph5}
                    />
                    {!autoSync && (
                        <Text style={[styles.mutedNormalTextLabel, styles.ph5, styles.mt2]}>
                            {translate('workspace.accounting.enableContinuousReconciliation')}
                            <TextLink
                                style={styles.fontSizeLabel}
                                onPress={navigateToAdvancedSettings}
                            >
                                {translate('workspace.accounting.autoSync').toLowerCase()}
                            </TextLink>{' '}
                            {translate('common.conjunctionFor')} {CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}
                        </Text>
                    )}
                    {!!paymentBankAccountID && isContinuousReconciliationOn && (
                        <MenuItemWithTopDescription
                            style={styles.mt5}
                            title={bankAccountTitle}
                            description={translate('workspace.accounting.reconciliationAccount')}
                            shouldShowRightIcon
                        />
                    )}
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

CardReconciliationPage.displayName = 'CardReconciliationPage';

export default withPolicyConnections(CardReconciliationPage);
