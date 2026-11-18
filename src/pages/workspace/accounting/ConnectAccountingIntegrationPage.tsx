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
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getConnectedIntegration, isConnectPageConnectionName} from '@libs/PolicyUtils';
import type {ConnectPageConnectionName} from '@libs/PolicyUtils';

import type {SettingsNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {PolicyConnectionSyncProgress} from '@src/types/onyx/Policy';
import type IconAsset from '@src/types/utils/IconAsset';

import type {OnyxEntry} from 'react-native-onyx';

import React, {useEffect} from 'react';
import {View} from 'react-native';

import {AccountingContextProvider, useAccountingActions} from './AccountingContext';
import {canConnectToIntuitEnterpriseSuiteSandbox} from './qbo/utils';
import {getActiveIntegrationToConnect, isIntuitEnterpriseSuiteConnection} from './utils';

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

function connectionNameSelector(syncProgress: OnyxEntry<PolicyConnectionSyncProgress>) {
    return syncProgress?.connectionName;
}

type ConnectAccountingIntegrationPageProps = WithPolicyConnectionsProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.CONNECT>;

function ConnectAccountingIntegrationPage({route, policy}: ConnectAccountingIntegrationPageProps) {
    const {policyID, connectionName} = route.params;
    const isIntuitEnterpriseSuite = connectionName === CONST.POLICY.CONNECTIONS.NAME.QBO && route.params.isIntuitEnterpriseSuite === 'true';
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {environment} = useEnvironment();
    const {startIntegrationFlow} = useAccountingActions();
    const icons = useMemoizedLazyExpensifyIcons(['QBOSquare', 'IntuitSquare', 'XeroSquare', 'CertiniaSquare', 'Checkmark']);
    const [syncingConnectionName] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`, {selector: connectionNameSelector});

    const accountingIntegrations = CONST.POLICY.CONNECTIONS.ACCOUNTING_CONNECTION_NAMES;
    const syncingIntegration = accountingIntegrations.find((integrationName) => integrationName === syncingConnectionName);
    const connectedIntegration = getConnectedIntegration(policy, accountingIntegrations) ?? syncingIntegration;
    // QBO and Intuit Enterprise Suite share a connection, so one isn't connected while the workspace uses the other
    const isConnectedToIntegration =
        connectedIntegration === connectionName && (connectionName !== CONST.POLICY.CONNECTIONS.NAME.QBO || isIntuitEnterpriseSuiteConnection(policy) === isIntuitEnterpriseSuite);

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
        startIntegrationFlow(getActiveIntegrationToConnect({name: connectionName, isIntuitEnterpriseSuite, isSandbox}, connectedIntegration));
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
                    <View style={[styles.flexGrow1, styles.justifyContentCenter, styles.alignItemsCenter]}>
                        {!!config && <ConnectionOrbitAnimation integrationIcon={config.icon} />}
                        <Text style={[styles.textHeadlineH1, styles.textAlignCenter, styles.mt6, styles.mb4]}>{connectTitle}</Text>
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
                                            width={variables.iconSizeSmall}
                                            height={variables.iconSizeSmall}
                                        />
                                    </View>
                                    <Text style={styles.ml2}>{translate(feature)}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </ScrollView>
                <FixedFooter style={[styles.mtAuto, styles.gap3]}>
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
