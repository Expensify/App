/**
 * Introduces an accounting integration before the admin connects it. Integrations whose connect flow leaves the app or
 * asks a question right away open this page first, so the Connections page and Home can both link to one place.
 */
import Button from '@components/Button';
import ButtonDisabledWhenOffline from '@components/Button/composed/ButtonDisabledWhenOffline';
import ConnectionOrbitAnimation from '@components/ConnectionOrbitAnimation';
import FixedFooter from '@components/FixedFooter';
import Header from '@components/Header';
import Icon from '@components/Icon';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {isConnectionInProgress} from '@libs/actions/connections';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getValidConnectedIntegration, isConnectPageConnectionName} from '@libs/PolicyUtils';
import type {ConnectPageConnectionName} from '@libs/PolicyUtils';

import type {SettingsNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {ConnectionName} from '@src/types/onyx/Policy';
import type IconAsset from '@src/types/utils/IconAsset';

import React, {useEffect} from 'react';
import {View} from 'react-native';

import {AccountingContextProvider, useAccountingActions, useAccountingState} from './AccountingContext';
import {canConnectToIntuitEnterpriseSuiteSandbox} from './qbo/utils';
import {getActiveIntegrationToConnect, getAvailableAccountingIntegrations, getConnectedAndSyncingIntegrations, isIntuitEnterpriseSuiteConnectionOrSync} from './utils';

type IntegrationConfig = {
    title: string;
    icon: IconAsset;
    canConnectToSandbox: boolean;
};

const FEATURES = [
    'workspace.accounting.connectPage.importChartOfAccounts',
    'workspace.accounting.connectPage.importCodingFields',
    'workspace.accounting.connectPage.exportApprovedExpenses',
    'workspace.accounting.connectPage.exportPaymentsAndSettlements',
] as const;

type ConnectAccountingIntegrationPageProps = WithPolicyConnectionsProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.CONNECT>;

function ConnectAccountingIntegrationPage({route, policy}: ConnectAccountingIntegrationPageProps) {
    const {policyID, connectionName} = route.params;
    const isIntuitEnterpriseSuite = connectionName === CONST.POLICY.CONNECTIONS.NAME.QBO && route.params.isIntuitEnterpriseSuite === 'true';
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {environment} = useEnvironment();
    const {isBetaEnabled} = usePermissions();
    const {activeIntegration} = useAccountingState();
    const {startIntegrationFlow} = useAccountingActions();
    const icons = useMemoizedLazyExpensifyIcons(['QBOSquare', 'IntuitSquare', 'XeroSquare', 'CertiniaSquare', 'Checkmark']);
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`);

    const accountingIntegrations = getAvailableAccountingIntegrations(policy, isBetaEnabled);
    const {connectedIntegration, syncingIntegration} = getConnectedAndSyncingIntegrations(policy, connectionSyncProgress, accountingIntegrations);
    const isSyncInProgress = isConnectionInProgress(connectionSyncProgress, policy);
    // A failed first attempt leaves an unverified connection behind, which still needs connecting
    const verifiedIntegration = getValidConnectedIntegration(policy, accountingIntegrations) ?? (isSyncInProgress ? syncingIntegration : undefined);
    // QBO and Intuit Enterprise Suite share a connection, so one isn't connected while the workspace uses the other
    const isThisIntegration = (integration: ConnectionName | undefined) =>
        integration === connectionName &&
        (connectionName !== CONST.POLICY.CONNECTIONS.NAME.QBO || isIntuitEnterpriseSuiteConnectionOrSync(policy, isSyncInProgress, activeIntegration) === isIntuitEnterpriseSuite);
    const isConnectedToIntegration = isThisIntegration(verifiedIntegration);

    const integrationConfig: Record<ConnectPageConnectionName, IntegrationConfig> = {
        [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
            title: translate(isIntuitEnterpriseSuite ? 'workspace.accounting.intuitEnterpriseSuite' : 'workspace.accounting.qbo'),
            icon: isIntuitEnterpriseSuite ? icons.IntuitSquare : icons.QBOSquare,
            canConnectToSandbox: isIntuitEnterpriseSuite && canConnectToIntuitEnterpriseSuiteSandbox(environment),
        },
        [CONST.POLICY.CONNECTIONS.NAME.XERO]: {
            title: translate('workspace.accounting.xero'),
            icon: icons.XeroSquare,
            canConnectToSandbox: false,
        },
        [CONST.POLICY.CONNECTIONS.NAME.CERTINIA]: {
            title: translate('workspace.certinia.title'),
            icon: icons.CertiniaSquare,
            canConnectToSandbox: true,
        },
    };
    const config = isConnectPageConnectionName(connectionName) ? integrationConfig[connectionName] : undefined;
    const connectTitle = config ? translate('workspace.accounting.connectPage.title', config.title) : '';

    // Connecting finishes outside this page, for example in the browser tab the setup opens, so the page closes once it's done
    useEffect(() => {
        if (!isConnectedToIntegration) {
            return;
        }
        Navigation.dismissModal();
    }, [isConnectedToIntegration]);

    const connect = (isSandbox: boolean) => {
        const integrationToConnect = {name: connectionName, isIntuitEnterpriseSuite, isSandbox};
        // An unverified connection to this same integration is reconnected rather than replaced
        startIntegrationFlow(isThisIntegration(connectedIntegration) ? integrationToConnect : getActiveIntegrationToConnect(integrationToConnect, connectedIntegration));
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            // Connections lists integrations whether or not the accounting feature is on, so only the write access check applies
            policyFeature={CONST.POLICY.POLICY_FEATURE.MORE_FEATURES}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
            shouldBeBlocked={!config}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom
                shouldEnableMaxHeight
                testID={ConnectAccountingIntegrationPage.displayName}
            >
                <Header>
                    <Header.BackButton onPress={() => Navigation.goBack()} />
                    <Header.Title title={connectTitle} />
                </Header>
                <ScrollView contentContainerStyle={[styles.flexGrow1, styles.ph5, styles.pb5]}>
                    {/* The design sits the content slightly above center, which reads as centered next to the footer buttons */}
                    <View style={[styles.flexGrow1, styles.justifyContentCenter, styles.alignItemsCenter, styles.pb10]}>
                        {!!config && <ConnectionOrbitAnimation integrationIcon={config.icon} />}
                        <Text style={[styles.textHeadlineH1, styles.textAlignCenter, styles.mt7, styles.mb7]}>{connectTitle}</Text>
                        <View
                            style={styles.gap2}
                            role={CONST.ROLE.LIST}
                        >
                            {FEATURES.map((feature) => (
                                <View
                                    key={feature}
                                    style={[styles.flexRow, styles.alignItemsCenter]}
                                    role={CONST.ROLE.LISTITEM}
                                >
                                    <View
                                        aria-hidden
                                        importantForAccessibility="no-hide-descendants"
                                    >
                                        <Icon
                                            src={icons.Checkmark}
                                            fill={theme.iconSuccessFill}
                                            width={variables.iconSizeNormal}
                                            height={variables.iconSizeNormal}
                                        />
                                    </View>
                                    <Text style={styles.ml2}>{translate(feature)}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </ScrollView>
                <FixedFooter style={[styles.mtAuto, styles.gap2]}>
                    {!!config?.canConnectToSandbox && (
                        <ButtonDisabledWhenOffline
                            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.ACCOUNTING.CONNECT_PAGE_CONNECT_SANDBOX}
                            onPress={() => connect(true)}
                            size={CONST.BUTTON_SIZE.LARGE}
                        >
                            <Button.Text>{translate('workspace.accounting.connectToSandbox')}</Button.Text>
                        </ButtonDisabledWhenOffline>
                    )}
                    <ButtonDisabledWhenOffline
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.ACCOUNTING.CONNECT_PAGE_CONNECT}
                        onPress={() => connect(false)}
                        variant={CONST.BUTTON_VARIANT.SUCCESS}
                        size={CONST.BUTTON_SIZE.LARGE}
                    >
                        <Button.Text>{config?.canConnectToSandbox ? translate('workspace.accounting.setup') : connectTitle}</Button.Text>
                    </ButtonDisabledWhenOffline>
                </FixedFooter>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

ConnectAccountingIntegrationPage.displayName = 'ConnectAccountingIntegrationPage';

function ConnectAccountingIntegrationPageWrapper(props: ConnectAccountingIntegrationPageProps) {
    return (
        <AccountingContextProvider policy={props.policy}>
            <ConnectAccountingIntegrationPage {...props} />
        </AccountingContextProvider>
    );
}

export default withPolicyConnections(ConnectAccountingIntegrationPageWrapper);
