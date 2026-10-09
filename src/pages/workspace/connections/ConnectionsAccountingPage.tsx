import ActivityIndicator from '@components/ActivityIndicator';
import UserAvatar from '@components/Avatar/UserAvatar';
import FormHelpMessage from '@components/FormHelpMessage';
import Header from '@components/Header';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextLink from '@components/TextLink';

import useIsUnifiedConnectionsBetaEnabled from '@hooks/useIsUnifiedConnectionsBetaEnabled';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';

import Navigation from '@navigation/Navigation';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {AccountingContextProvider} from '@pages/workspace/accounting/AccountingContext';
import type {PolicyAccountingPageProps} from '@pages/workspace/accounting/types';
import useConnectedAccountingIntegration from '@pages/workspace/accounting/useConnectedAccountingIntegration';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import {openOldDotLink} from '@userActions/Link';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

/** Settings for the workspace's connected accounting integration, opened from the Connections page. */
function ConnectionsAccountingPage({policy}: PolicyAccountingPageProps) {
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.accounting');
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const isUnifiedConnectionsBetaEnabled = useIsUnifiedConnectionsBetaEnabled();
    const policyID = policy?.id;
    const {
        connectedIntegration,
        connectedIntegrationDisplayName,
        isSyncInProgress,
        hasSyncError,
        hasUnsupportedNDIntegration,
        synchronizationError,
        canWriteAccounting,
        overflowMenu,
        connectionDetails,
        qboTokenExpiryHint,
        oldDotPolicyConnectionsURL,
    } = useConnectedAccountingIntegration(policy, {
        // These settings have nothing to show once the integration is gone
        onDisconnectConfirmed: () => Navigation.goBack(ROUTES.WORKSPACE_CONNECTIONS.getRoute(policyID)),
    });
    const connectionsMenuItems = connectionDetails?.settingsMenuItems ?? [];

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.ACCOUNTING}
            shouldBeBlocked={!isUnifiedConnectionsBetaEnabled || (!connectedIntegration && !hasUnsupportedNDIntegration)}
        >
            <ScreenWrapper
                testID="ConnectionsAccountingPage"
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <Header>
                    <Header.BackButton onPress={() => Navigation.goBack(ROUTES.WORKSPACE_CONNECTIONS.getRoute(policyID))} />
                    {!!connectionDetails?.icon && (
                        <UserAvatar
                            containerStyles={[StyleUtils.getWidthAndHeightStyle(StyleUtils.getAvatarSize(CONST.AVATAR_SIZE.DEFAULT)), styles.mr3]}
                            size={CONST.AVATAR_SIZE.DEFAULT}
                            source={connectionDetails.icon}
                            accountID={CONST.DEFAULT_NUMBER_ID}
                        />
                    )}
                    <Header.Title
                        title={connectionDetails?.title ?? connectedIntegrationDisplayName ?? translate('workspace.common.accounting')}
                        subtitle={connectionDetails?.connectionMessage}
                        titleStyles={[styles.textNormal, styles.lineHeightLarge]}
                    />
                    <Header.Right>
                        {!!connectionDetails && isSyncInProgress && <ActivityIndicator style={styles.popoverMenuIcon} />}
                        {!!connectionDetails && canWriteAccounting && !isSyncInProgress && <Header.ThreeDotsMenu items={overflowMenu} />}
                    </Header.Right>
                </Header>
                <ScrollView
                    contentContainerStyle={styles.pt3}
                    addBottomSafeAreaPadding
                >
                    <View style={styles.flex1}>
                        {!!synchronizationError && (
                            <FormHelpMessage
                                isError
                                message={synchronizationError}
                                style={[styles.ph5, styles.mb3]}
                            />
                        )}
                        {!!qboTokenExpiryHint && (
                            <FormHelpMessage
                                isError={false}
                                shouldShowRedDotIndicator={false}
                                message={qboTokenExpiryHint}
                                style={[styles.ph5, styles.mb3]}
                            />
                        )}
                        {!hasUnsupportedNDIntegration &&
                            connectionsMenuItems.map((menuItem) => (
                                <OfflineWithFeedback
                                    pendingAction={menuItem.pendingAction}
                                    key={menuItem.title}
                                    shouldDisableStrikeThrough
                                >
                                    <MenuItem
                                        brickRoadIndicator={menuItem.brickRoadIndicator}
                                        key={menuItem.title}
                                        {...menuItem}
                                    />
                                </OfflineWithFeedback>
                            ))}
                        {hasUnsupportedNDIntegration && hasSyncError && !!policyID && (
                            <FormHelpMessage
                                isError
                                style={[styles.menuItemError, styles.ph5]}
                                message={translate('workspace.accounting.errorODIntegration', oldDotPolicyConnectionsURL)}
                                shouldRenderMessageAsHTML
                            />
                        )}
                        {hasUnsupportedNDIntegration && !hasSyncError && !!policyID && (
                            <FormHelpMessage
                                shouldShowRedDotIndicator={false}
                                style={styles.ph5}
                            >
                                <Text>
                                    <TextLink
                                        onPress={() => {
                                            // Go to Expensify Classic.
                                            openOldDotLink(CONST.OLDDOT_URLS.POLICY_CONNECTIONS_URL(policyID));
                                        }}
                                    >
                                        {translate('workspace.accounting.goToODToSettings')}
                                    </TextLink>
                                </Text>
                            </FormHelpMessage>
                        )}
                    </View>
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

function ConnectionsAccountingPageWrapper(props: PolicyAccountingPageProps) {
    return (
        <AccountingContextProvider policy={props.policy}>
            <ConnectionsAccountingPage {...props} />
        </AccountingContextProvider>
    );
}

export default withPolicyConnections(ConnectionsAccountingPageWrapper);
