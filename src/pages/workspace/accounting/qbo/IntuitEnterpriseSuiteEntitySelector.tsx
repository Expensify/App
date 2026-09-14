import MenuItem from '@components/MenuItem';
import SelectionScreen from '@components/SelectionScreen';
import type {SelectorType} from '@components/SelectionScreen';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {selectIntuitEnterpriseSuiteEntity} from '@libs/actions/connections/QuickbooksOnline';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';

import {clearQBOErrorField} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import type {IntuitEnterpriseSuiteEntity} from '@src/types/onyx/Policy';

import React, {useState} from 'react';
import {View} from 'react-native';

import IntuitEnterpriseSuiteOAuthFlow from './IntuitEnterpriseSuiteOAuthFlow';

function IntuitEnterpriseSuiteEntitySelector({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);
    const config = policy?.connections?.quickbooksOnline?.config;
    const policyID = policy?.id ?? CONST.DEFAULT_NUMBER_ID.toString();
    const [oauthAttempt, setOAuthAttempt] = useState(0);
    const [reconnectEntity, setReconnectEntity] = useState<IntuitEnterpriseSuiteEntity | null>(null);

    const entities = Object.values(config?.entities ?? {});

    const currentEntity = entities.find((entity) => entity.realmId === config?.realmId);
    const data: Array<SelectorType<IntuitEnterpriseSuiteEntity>> = entities.map((entity) => ({
        text: entity.companyName,
        keyForList: entity.realmId,
        isSelected: entity.realmId === config?.realmId,
        value: entity,
    }));

    // The entity passed here is the one being reconnected (so its own sandbox flag drives OAuth),
    // or null when connecting a brand-new entity (falls back to the active entity's sandbox).
    const startOAuth = (entity: IntuitEnterpriseSuiteEntity | null = null) => {
        setReconnectEntity(entity);
        setOAuthAttempt((attempt) => attempt + 1);
    };
    const selectEntity = ({value}: SelectorType<IntuitEnterpriseSuiteEntity>) => {
        if (value.realmId === config?.realmId) {
            return;
        }
        if (value.needsReconnect) {
            startOAuth(value);
            return;
        }

        selectIntuitEnterpriseSuiteEntity(policyID, value, currentEntity);
        Navigation.goBack();
    };

    const headerContent = (
        <View style={[styles.pb2, styles.ph5]}>
            <Text style={[styles.pb2, styles.textNormal]}>{translate('workspace.qbo.entitySelectDescription')}</Text>
        </View>
    );
    const listFooterContent = (
        <MenuItem
            title={translate('workspace.qbo.connectNewEntity')}
            icon={icons.Plus}
            onPress={() => startOAuth()}
        />
    );

    return (
        <>
            <SelectionScreen<IntuitEnterpriseSuiteEntity>
                policyID={policyID}
                accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
                featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
                displayName="IntuitEnterpriseSuiteEntitySelector"
                data={data}
                connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO}
                onSelectRow={selectEntity}
                initiallyFocusedOptionKey={config?.realmId}
                headerContent={headerContent}
                listFooterContent={listFooterContent}
                onBackButtonPress={() => Navigation.goBack()}
                title="workspace.qbo.entity"
                pendingAction={settingsPendingAction(['realmId'], config?.pendingFields)}
                errors={getLatestErrorField(config ?? {}, 'realmId')}
                errorRowStyles={[styles.ph5, styles.mv3]}
                onClose={() => clearQBOErrorField(policyID, 'realmId')}
            />
            {!!oauthAttempt && (
                <IntuitEnterpriseSuiteOAuthFlow
                    key={oauthAttempt}
                    policyID={policyID}
                    isSandbox={reconnectEntity?.credentials?.isSandbox ?? config?.credentials?.isSandbox ?? false}
                />
            )}
        </>
    );
}

export default withPolicyConnections(IntuitEnterpriseSuiteEntitySelector);
