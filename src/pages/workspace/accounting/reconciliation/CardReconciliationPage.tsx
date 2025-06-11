import React, {useCallback, useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useExpensifyCardFeeds from '@hooks/useExpensifyCardFeeds';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getConnectionNameFromRouteParam} from '@libs/AccountingUtils';
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

    const [isContinuousReconciliationOn] = useOnyx(`${ONYXKEYS.COLLECTION.EXPENSIFY_CARD_USE_CONTINUOUS_RECONCILIATION}${effectiveDomainID}`, {canBeMissing: true});
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

    const navigateToAdvancedSettings = useCallback(() => {
        switch (connection) {
            case CONST.POLICY.CONNECTIONS.ROUTE.QBO:
                Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_AUTO_SYNC.getRoute(policyID, Navigation.getActiveRoute()));
                break;
            case CONST.POLICY.CONNECTIONS.ROUTE.XERO:
                Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_ADVANCED.getRoute(policyID));
                break;
            case CONST.POLICY.CONNECTIONS.ROUTE.NETSUITE:
                Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_AUTO_SYNC.getRoute(policyID, Navigation.getActiveRoute()));
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
            shouldBeBlocked={!shouldShow}
        >
            <ScreenWrapper
                shouldEnableMaxHeight
                testID={CardReconciliationPage.displayName}
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
                        isActive={!!isContinuousReconciliationOn}
                        onToggle={handleToggleContinuousReconciliation}
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
                    {!!paymentBankAccountID && !!isContinuousReconciliationOn && (
                        <MenuItemWithTopDescription
                            style={styles.mt5}
                            title={bankAccountTitle}
                            description={translate('workspace.accounting.reconciliationAccount')}
                            shouldShowRightIcon
                            onPress={() => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_RECONCILIATION_ACCOUNT_SETTINGS.getRoute(policyID, connection))}
                        />
                    )}
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

CardReconciliationPage.displayName = 'CardReconciliationPage';

export default withPolicyConnections(CardReconciliationPage);
