import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemList from '@components/MenuItemList';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import {getConnectionNameFromRouteParam} from '@libs/AccountingUtils';
import {getConnectedIntegration} from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {AccountingContextProvider, useAccountingContext} from './AccountingContext';
import type {MenuItemData} from './types';
import {getAccountingIntegrationData} from './utils';

type MultiConnectionSelectorPageProps = WithPolicyConnectionsProps & {
    route: {
        params: {
            connection: ValueOf<typeof CONST.POLICY.CONNECTIONS.ROUTE>;
        };
    };
};

function MultiConnectionSelectorPage({policy, route}: MultiConnectionSelectorPageProps) {
    const policyID = policy?.id;

    const {canUseNSQS} = usePermissions();

    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policy?.id}`);
    const connectedIntegration = getConnectedIntegration(policy) ?? connectionSyncProgress?.connectionName;
    const multiConnectionName = getConnectionNameFromRouteParam(route.params.connection);

    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const {startIntegrationFlow, popoverAnchorRefs} = useAccountingContext();

    const integrations = useMemo(() => CONST.POLICY.CONNECTIONS.MULTI_CONNECTIONS_MAPPING_INVERTED[multiConnectionName] ?? [], [multiConnectionName]);

    const connectionsMenuItems: MenuItemData[] = useMemo(
        () =>
            policyID
                ? (integrations
                      .map((integration) => {
                          const integrationData = getAccountingIntegrationData(integration, policyID, translate);
                          if (!integrationData) {
                              return undefined;
                          }

                          const connectionsMenuItem: MenuItemData = {
                              title: integrationData.title,
                              icon: integrationData.icon,
                              iconType: CONST.ICON_TYPE_AVATAR,
                              shouldShowRightIcon: true,
                              onPress: () => {
                                  startIntegrationFlow({
                                      name: integration,
                                      integrationToDisconnect: connectedIntegration,
                                      shouldDisconnectIntegrationBeforeConnecting: connectedIntegration ? true : undefined,
                                  });
                              },
                              ref: (ref) => {
                                  if (!popoverAnchorRefs?.current) {
                                      return;
                                  }

                                  // eslint-disable-next-line react-compiler/react-compiler
                                  popoverAnchorRefs.current[integration].current = ref;
                              },
                          };

                          return connectionsMenuItem;
                      })
                      .filter(Boolean) as MenuItemData[])
                : [],
        [integrations, connectedIntegration, policyID, startIntegrationFlow, popoverAnchorRefs, translate],
    );

    // The multi connector is currently only used for NSQS (which is behind beta)
    const shouldBeBlocked = !canUseNSQS || !connectionsMenuItems.length;

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            shouldBeBlocked={shouldBeBlocked}
        >
            <ScreenWrapper
                testID={MultiConnectionSelectorPage.displayName}
                includeSafeAreaPaddingBottom={false}
                shouldShowOfflineIndicatorInWideScreen
            >
                <HeaderWithBackButton title={translate(`workspace.multiConnectionSelector.title`, {connectionName: multiConnectionName})} />
                <View style={[styles.flexGrow1]}>
                    <Text style={[styles.mb5, styles.ph5, styles.pt3]}>{translate(`workspace.multiConnectionSelector.description`, {connectionName: multiConnectionName})}</Text>
                    <MenuItemList
                        menuItems={connectionsMenuItems}
                        shouldUseSingleExecution
                    />
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

function MultiConnectionSelectorPageeWrapper(props: MultiConnectionSelectorPageProps) {
    return (
        <AccountingContextProvider policy={props.policy}>
            <MultiConnectionSelectorPage
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />
        </AccountingContextProvider>
    );
}

MultiConnectionSelectorPage.displayName = 'MultiConnectionSelectorPage';

export default withPolicyConnections(MultiConnectionSelectorPageeWrapper);
