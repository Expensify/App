import React, {useEffect, useMemo} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useGetReceiptPartnersIntegrationData from '@hooks/useGetReceiptPartnersIntegrationData';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {openExternalLink} from '@libs/actions/Link';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getConnectedIntegration} from '@libs/PolicyUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {PolicyFeatureName} from '@src/types/onyx/Policy';
import {AccountingContextProvider, useAccountingContext} from './AccountingContext';

type IntegrationType = typeof CONST.POLICY.CONNECTIONS.NAME.XERO | typeof CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER;

type IntegrationConfig = {
    headerTitle: string;
    headline: string;
    descriptionHtml: string;
    claimOfferLink?: string;
    connectButtonText: string;
    connectionName: string;
    featureName: PolicyFeatureName;
    onConnect: () => void;
};

type ClaimOfferPageProps = WithPolicyConnectionsProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.CLAIM_OFFER>;

function ClaimOfferPage({route, policy}: ClaimOfferPageProps) {
    const {integration, policyID} = route.params;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {startIntegrationFlow} = useAccountingContext();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['TreasureChestGreenWithSparkle'] as const);
    const integrations = policy?.receiptPartners;
    const {isUberConnected} = useGetReceiptPartnersIntegrationData(policyID);
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`, {canBeMissing: true});

    const connectionNames = CONST.POLICY.CONNECTIONS.NAME;
    const accountingIntegrations = Object.values(connectionNames);
    const connectedIntegration = getConnectedIntegration(policy, accountingIntegrations) ?? connectionSyncProgress?.connectionName;

    const isConnectedToIntegration = useMemo(() => {
        if (integration === CONST.POLICY.CONNECTIONS.NAME.XERO) {
            return connectedIntegration === CONST.POLICY.CONNECTIONS.NAME.XERO;
        }
        if (integration === CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER) {
            return isUberConnected;
        }
        return false;
    }, [connectedIntegration, integration, isUberConnected]);

    const integrationConfig: Record<IntegrationType, IntegrationConfig> = {
        xero: {
            headerTitle: translate('workspace.accounting.xero'),
            headline: translate('workspace.accounting.claimOffer.xero.headline'),
            descriptionHtml: translate('workspace.accounting.claimOffer.xero.description'),
            claimOfferLink: CONST.XERO_PARTNER_LINK,
            connectButtonText: translate('workspace.accounting.claimOffer.xero.connectButton'),
            connectionName: CONST.POLICY.CONNECTIONS.NAME.XERO,
            featureName: CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED,
            onConnect: () => {
                startIntegrationFlow({name: CONST.POLICY.CONNECTIONS.NAME.XERO});
            },
        },
        uber: {
            headerTitle: translate('workspace.accounting.claimOffer.uber.headerTitle'),
            headline: translate('workspace.accounting.claimOffer.uber.headline'),
            descriptionHtml: translate('workspace.accounting.claimOffer.uber.description'),
            connectButtonText: translate('workspace.accounting.claimOffer.uber.connectButton'),
            connectionName: CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER,
            featureName: CONST.POLICY.MORE_FEATURES.ARE_RECEIPT_PARTNERS_ENABLED,
            onConnect: () => {
                openExternalLink(`${CONST.UBER_CONNECT_URL}?${integrations?.uber?.connectFormData}`);
            },
        },
    };

    useEffect(() => {
        if (!isConnectedToIntegration) {
            return;
        }
        Navigation.dismissModal();
    }, [isConnectedToIntegration]);

    const config = integrationConfig[integration as IntegrationType];

    const handleClaimOffer = () => {
        if (!config.claimOfferLink) {
            return;
        }
        openExternalLink(config.claimOfferLink);
    };

    const handleConnect = () => {
        config.onConnect();
    };

    const buttons = (
        <FixedFooter style={[styles.mtAuto, styles.gap3]}>
            {!!config.claimOfferLink && (
                <Button
                    text={translate('subscription.billingBanner.earlyDiscount.claimOffer')}
                    onPress={handleClaimOffer}
                    large
                    isDisabled={isOffline}
                />
            )}
            <Button
                text={config.connectButtonText}
                onPress={handleConnect}
                success
                large
                isDisabled={isOffline}
            />
        </FixedFooter>
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={config.featureName}
            shouldBeBlocked={!config}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom
                shouldEnableMaxHeight
                testID={ClaimOfferPage.displayName}
            >
                <HeaderWithBackButton
                    title={config.headerTitle}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <ScrollView contentContainerStyle={[styles.flexGrow1, styles.ph5, styles.pb5]}>
                    <View style={[styles.flexGrow1, styles.justifyContentCenter]}>
                        <View style={[styles.alignItemsCenter, styles.mb5]}>
                            <Icon
                                src={expensifyIcons.TreasureChestGreenWithSparkle}
                                width={194}
                                height={192}
                                additionalStyles={[styles.mb5]}
                            />
                        </View>
                        <View>
                            <Text style={[styles.textHeadlineH1, styles.textAlignCenter, styles.mb3]}>{config.headline}</Text>
                            <View style={[styles.renderHTML]}>
                                <RenderHTML html={config.descriptionHtml} />
                            </View>
                        </View>
                    </View>
                </ScrollView>
                {buttons}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

ClaimOfferPage.displayName = 'ClaimOfferPage';

function ClaimOfferPageWrapper(props: ClaimOfferPageProps) {
    return (
        <AccountingContextProvider policy={props.policy}>
            <ClaimOfferPage
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />
        </AccountingContextProvider>
    );
}
export default withPolicyConnections(ClaimOfferPageWrapper);
