import React, {useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useEnvironment from '@hooks/useEnvironment';
import useExpensifyCardFeeds from '@hooks/useExpensifyCardFeeds';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getConnectionNameFromRouteParam} from '@libs/AccountingUtils';
import {openPolicyAccountingPage} from '@libs/actions/PolicyConnections';
import {isExpensifyCardFullySetUp} from '@libs/CardUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {toggleContinuousReconciliation} from '@userActions/Card';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type ExpensifyCardSettings from '@src/types/onyx/ExpensifyCardSettings';
import type {ConnectionName} from '@src/types/onyx/Policy';

type CardReconciliationPageProps = WithPolicyConnectionsProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.CARD_RECONCILIATION>;

type FullySetUpCardSetting = {
    key: string;
    cardSetting: ExpensifyCardSettings;
};

function CardReconciliationPage({policy, route}: CardReconciliationPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const workspaceAccountID = policy?.workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const policyID = policy?.id;
    const allCardSettings = useExpensifyCardFeeds(policyID);
    const {environmentURL} = useEnvironment();

    const fullySetUpCardSetting = useMemo(() => {
        const entries = Object.entries(allCardSettings ?? {});
        const initialValue: FullySetUpCardSetting = {
            key: '',
            cardSetting: {
                monthlySettlementDate: new Date(),
                isMonthlySettlementAllowed: false,
                paymentBankAccountID: CONST.DEFAULT_NUMBER_ID,
            },
        };

        return entries.reduce<FullySetUpCardSetting>((acc, [key, cardSetting]) => {
            if (cardSetting && isExpensifyCardFullySetUp(policy, cardSetting)) {
                return {
                    key,
                    cardSetting,
                };
            }
            return acc;
        }, initialValue);
    }, [allCardSettings, policy]);

    const domainID = fullySetUpCardSetting.key.split('_').at(-1);
    const effectiveDomainID = Number(domainID ?? workspaceAccountID);

    const [continuousReconciliation] = useOnyx(`${ONYXKEYS.COLLECTION.EXPENSIFY_CARD_USE_CONTINUOUS_RECONCILIATION}${effectiveDomainID}`, {canBeMissing: true});
    const [currentConnectionName] = useOnyx(`${ONYXKEYS.COLLECTION.EXPENSIFY_CARD_CONTINUOUS_RECONCILIATION_CONNECTION}${effectiveDomainID}`, {canBeMissing: true});
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});

    const paymentBankAccountID = fullySetUpCardSetting.cardSetting?.paymentBankAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const bankAccountTitle = bankAccountList?.[paymentBankAccountID]?.title ?? '';

    const {connection} = route.params;
    const connectionName = getConnectionNameFromRouteParam(connection) as ConnectionName;
    const autoSync = !!policy?.connections?.[connectionName]?.config?.autoSync?.enabled;
    const shouldShow = !!fullySetUpCardSetting.cardSetting?.paymentBankAccountID;

    const handleToggleContinuousReconciliation = (value: boolean) => {
        toggleContinuousReconciliation(effectiveDomainID, value, connectionName, currentConnectionName);
        if (value) {
            Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_RECONCILIATION_ACCOUNT_SETTINGS.getRoute(policyID, connection));
        }
    };

    const accountingAdvancedSettingsLink = useMemo(() => {
        if (!policyID) {
            return '';
        }
        const backTo = ROUTES.WORKSPACE_ACCOUNTING_CARD_RECONCILIATION.getRoute(policyID, connection);
        switch (connection) {
            case CONST.POLICY.CONNECTIONS.ROUTE.QBO:
                return `${environmentURL}/${ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_AUTO_SYNC.getRoute(policyID, backTo)}`;
            case CONST.POLICY.CONNECTIONS.ROUTE.XERO:
                return `${environmentURL}/${ROUTES.POLICY_ACCOUNTING_XERO_AUTO_SYNC.getRoute(policyID, backTo)}`;
            case CONST.POLICY.CONNECTIONS.ROUTE.NETSUITE:
                return `${environmentURL}/${ROUTES.POLICY_ACCOUNTING_NETSUITE_AUTO_SYNC.getRoute(policyID, backTo)}`;
            case CONST.POLICY.CONNECTIONS.ROUTE.SAGE_INTACCT:
                return `${environmentURL}/${ROUTES.POLICY_ACCOUNTING_CARD_RECONCILIATION_SAGE_INTACCT_AUTO_SYNC.getRoute(policyID)}`;
            case CONST.POLICY.CONNECTIONS.ROUTE.QBD:
                return `${environmentURL}/${ROUTES.POLICY_ACCOUNTING_CARD_RECONCILIATION_QUICKBOOKS_DESKTOP_AUTO_SYNC.getRoute(policyID)}`;
            default:
                return '';
        }
    }, [connection, policyID, environmentURL]);

    const fetchPolicyAccountingData = useCallback(() => {
        if (!policyID) {
            return;
        }
        openPolicyAccountingPage(policyID);
    }, [policyID]);

    useEffect(() => {
        if (continuousReconciliation?.value !== undefined) {
            return;
        }
        fetchPolicyAccountingData();
    }, [continuousReconciliation?.value, fetchPolicyAccountingData]);

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            shouldBeBlocked={!shouldShow}
        >
            <ScreenWrapper
                shouldEnableMaxHeight
                testID="CardReconciliationPage"
            >
                <HeaderWithBackButton title={translate('workspace.accounting.cardReconciliation')} />
                <ScrollView
                    contentContainerStyle={styles.pb5}
                    addBottomSafeAreaPadding
                >
                    <ToggleSettingOptionRow
                        key={translate('workspace.accounting.continuousReconciliation')}
                        title={translate('workspace.accounting.continuousReconciliation')}
                        subtitle={translate('workspace.accounting.saveHoursOnReconciliation')}
                        shouldPlaceSubtitleBelowSwitch
                        switchAccessibilityLabel={translate('workspace.accounting.continuousReconciliation')}
                        disabled={!autoSync}
                        isActive={!!continuousReconciliation?.value}
                        onToggle={handleToggleContinuousReconciliation}
                        wrapperStyle={styles.ph5}
                        pendingAction={continuousReconciliation?.pendingAction}
                    />
                    {!autoSync && (
                        <View style={[styles.renderHTML, styles.ph5, styles.mt2]}>
                            <RenderHTML
                                html={translate(
                                    'workspace.accounting.enableContinuousReconciliation',
                                    accountingAdvancedSettingsLink,
                                    CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName],
                                )}
                            />
                        </View>
                    )}
                    <OfflineWithFeedback pendingAction={continuousReconciliation?.pendingAction}>
                        {!!paymentBankAccountID && !!continuousReconciliation?.value && (
                            <MenuItemWithTopDescription
                                style={styles.mt5}
                                title={bankAccountTitle}
                                description={translate('workspace.accounting.reconciliationAccount')}
                                shouldShowRightIcon
                                onPress={() => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_RECONCILIATION_ACCOUNT_SETTINGS.getRoute(policyID, connection))}
                            />
                        )}
                    </OfflineWithFeedback>
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyConnections(CardReconciliationPage);
