import ActivityIndicator from '@components/ActivityIndicator';
import UserAvatar from '@components/Avatar/UserAvatar';
import FormHelpMessage from '@components/FormHelpMessage';
import Header from '@components/Header';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {useSession} from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextLink from '@components/TextLink';

import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';

import Navigation from '@navigation/Navigation';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {AccountingContextProvider} from '@pages/workspace/accounting/AccountingContext';
import type {ConnectionsAccountingPageProps, MenuItemData} from '@pages/workspace/accounting/types';
import useConnectedAccountingIntegration from '@pages/workspace/accounting/useConnectedAccountingIntegration';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import {openOldDotLink} from '@userActions/Link';
import {callIfAuthenticated} from '@userActions/Session';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

type AccountingSettingsRowProps = {
    menuItem: MenuItemData;
};

function AccountingSettingsRow({menuItem}: AccountingSettingsRowProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const session = useSession();
    const pressProps = menuItem.onPress ? {onPress: menuItem.interactive === false ? undefined : callIfAuthenticated(menuItem.onPress, session), sentryLabel: menuItem.sentryLabel} : {};

    return (
        <MenuItem.Root {...pressProps}>
            <View style={[styles.flexRow, StyleUtils.getMenuItemTextContainerStyle(false)]}>
                {!!menuItem.icon && typeof menuItem.icon !== 'string' && !Array.isArray(menuItem.icon) && (
                    <MenuItem.Leading>
                        <View style={styles.mr3}>
                            <MenuItem.Icon src={menuItem.icon} />
                        </View>
                    </MenuItem.Leading>
                )}
                <MenuItem.Content>
                    {menuItem.shouldShowDescriptionOnTop ? (
                        <View>
                            {!!menuItem.description && <MenuItem.FieldName>{menuItem.description}</MenuItem.FieldName>}
                            {!!menuItem.title && <MenuItem.FieldValue style={menuItem.titleStyle}>{menuItem.title}</MenuItem.FieldValue>}
                        </View>
                    ) : (
                        <MenuItem.Title style={menuItem.titleStyle}>{menuItem.title ?? ''}</MenuItem.Title>
                    )}
                </MenuItem.Content>
                {(!!menuItem.brickRoadIndicator || !!menuItem.shouldShowRightIcon) && (
                    <MenuItem.Trailing>
                        {!!menuItem.brickRoadIndicator && <MenuItem.BrickRoadIndicator status={menuItem.brickRoadIndicator} />}
                        {!!menuItem.shouldShowRightIcon && <MenuItem.Chevron />}
                    </MenuItem.Trailing>
                )}
            </View>
        </MenuItem.Root>
    );
}

/** Settings for the workspace's connected accounting integration, opened from the Connections page. */
function ConnectionsAccountingPage({policy}: ConnectionsAccountingPageProps) {
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.accounting');
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
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
        netSuiteOAuthMigrationHint,
        oldDotPolicyConnectionsURL,
    } = useConnectedAccountingIntegration(policy, {
        // These settings have nothing to show once the integration is gone
        onDisconnectConfirmed: (disconnect) => Navigation.goBack(ROUTES.WORKSPACE_CONNECTIONS.getRoute(policyID), {afterTransition: disconnect}),
    });
    const connectionsMenuItems = connectionDetails?.settingsMenuItems ?? [];
    const connectionHint = qboTokenExpiryHint ?? netSuiteOAuthMigrationHint;

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.ACCOUNTING}
            shouldBeBlocked={!connectedIntegration && !hasUnsupportedNDIntegration}
            fullPageNotFoundViewProps={{onBackButtonPress: () => Navigation.goBack(ROUTES.WORKSPACE_CONNECTIONS.getRoute(policyID))}}
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
                        {!!connectionHint && (
                            <FormHelpMessage
                                isError={false}
                                shouldShowRedDotIndicator={false}
                                message={connectionHint}
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
                                    <AccountingSettingsRow menuItem={menuItem} />
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
                                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.CONNECTIONS.GO_TO_CLASSIC_SETTINGS_LINK}
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

function ConnectionsAccountingPageWrapper(props: ConnectionsAccountingPageProps) {
    return (
        <AccountingContextProvider policy={props.policy}>
            <ConnectionsAccountingPage {...props} />
        </AccountingContextProvider>
    );
}

export default withPolicyConnections(ConnectionsAccountingPageWrapper);
