import {title} from 'process';
import React, {useMemo} from 'react';
import {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import MenuItemList from '@components/MenuItemList';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import {SelectorType} from '@components/SelectionScreen';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getConnectionNameFromRouteParam} from '@libs/AccountingUtils';
import {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import {TranslationPaths} from '@src/languages/types';
import SCREENS from '@src/SCREENS';
import AccessOrNotFoundWrapper from '../AccessOrNotFoundWrapper';
import {AccountingContextProvider, useAccountingContext} from './AccountingContext';
import {AccountingIntegration, MenuItemData} from './types';
import {getAccountingIntegrationData} from './utils';

type MultiConnectionSelectorPageProps = WithPolicyConnectionsProps & {
    route: {
        params: {
            connection: ValueOf<typeof CONST.POLICY.CONNECTIONS.ROUTE>;
        };
    };
};

function MultiConnectionSelectorPage({policy, route}: MultiConnectionSelectorPageProps) {
    const policyID = policy?.id ?? '-1';
    const connection = getConnectionNameFromRouteParam(route.params.connection);
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    // s77rt: set popoverAnchorRefs
    const {startIntegrationFlow, popoverAnchorRefs} = useAccountingContext();

    const connectionNames = CONST.POLICY.CONNECTIONS.NAME;
    const accountingIntegrations = Object.values(connectionNames);
    const connectionsData = accountingIntegrations.reduce<AccountingIntegration[]>((data, integration) => {
        const integrationData = getAccountingIntegrationData(integration, policyID, translate);
        if (integrationData?.multiConnectorAlias === connection) {
            data.push(integrationData);
        }
        return data;
    }, []);

    const connectionsMenuItems: MenuItemData[] = useMemo(
        () =>
            connectionsData.map<MenuItemData>((connectionData) => ({
                title: connectionData.title,
                icon: connectionData.icon,
                iconType: CONST.ICON_TYPE_AVATAR,
                shouldShowRightIcon: true,
                onPress: () => {
                    startIntegrationFlow({
                        name: connectionData.connectionName,
                        // s77rt
                        //integrationToDisconnect: connectedIntegration,
                        //shouldDisconnectIntegrationBeforeConnecting: true,
                    });
                },
            })),
        [],
    );

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
        >
            <ScreenWrapper
                testID={MultiConnectionSelectorPage.displayName}
                includeSafeAreaPaddingBottom={false}
                shouldShowOfflineIndicatorInWideScreen
            >
                <HeaderWithBackButton title={translate(`workspace.${connection}.multiConnector.title` as TranslationPaths)} />
                <Text style={[styles.ph5, styles.pt3, styles.mb5]}>{translate(`workspace.${connection}.multiConnector.description` as TranslationPaths)}</Text>
                <MenuItemList
                    menuItems={connectionsMenuItems}
                    shouldUseSingleExecution
                />
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
