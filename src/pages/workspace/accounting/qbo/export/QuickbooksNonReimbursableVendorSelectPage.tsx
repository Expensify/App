import BlockingView from '@components/BlockingViews/BlockingView';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {getLatestErrorField} from '@libs/ErrorUtils';
import {settingsPendingAction} from '@libs/PolicyUtils';

import Navigation from '@navigation/Navigation';

import {getQuickbooksOnlineIntegrationName} from '@pages/workspace/accounting/utils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

import {clearQBOErrorField} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

type VendorConfigKey = 'nonReimbursableBillDefaultVendor' | 'nonReimbursableCreditCardDefaultVendor';

type CardListItem = ListItem & {
    value: string;
};

type QuickbooksNonReimbursableVendorSelectPageProps = {
    /** Policy from withPolicyConnections (used for QBO config + vendor list) */
    policy: WithPolicyConnectionsProps['policy'];

    /** QBO config key holding the current default vendor */
    configKey: VendorConfigKey;

    /** Action that persists the picked vendor */
    updateVendor: (policyID: string, value: string, oldValue?: string) => void;

    /** testID used by SelectionScreen for telemetry / automation */
    displayName: string;
};

function QuickbooksNonReimbursableVendorSelectPage({policy, configKey, updateVendor, displayName}: QuickbooksNonReimbursableVendorSelectPageProps) {
    const {translate} = useLocalize();
    const integrationName = getQuickbooksOnlineIntegrationName(policy, translate);
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const {vendors} = policy?.connections?.quickbooksOnline?.data ?? {};
    const qboConfig = policy?.connections?.quickbooksOnline?.config;
    const currentVendor = qboConfig?.[configKey];

    const policyID = policy?.id ?? CONST.DEFAULT_NUMBER_ID.toString();
    const vendorOptions: CardListItem[] =
        vendors?.map((vendor) => ({
            value: vendor.id,
            text: vendor.name,
            keyForList: vendor.id,
            isSelected: vendor.id === currentVendor,
        })) ?? [];

    // Only the CC/DC export path treats a blank vendor as a valid state (falls back to "Credit Card Misc"), so we only offer a "None" row on that configKey.
    const canClear = configKey === CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_CREDIT_CARD_DEFAULT_VENDOR;
    const clearOption: CardListItem = {
        value: CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE,
        text: translate('common.none'),
        keyForList: CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE,
        isSelected: !currentVendor || currentVendor === CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE,
    };
    const shouldShowClearOption = canClear && (!!currentVendor || vendorOptions.length > 0);
    const data: CardListItem[] = shouldShowClearOption ? [clearOption, ...vendorOptions] : vendorOptions;

    const selectVendor = (row: CardListItem) => {
        const isAlreadySelected = row.value === currentVendor || (!row.value && !currentVendor);
        if (isAlreadySelected) {
            return;
        }
        updateVendor(policyID, row.value, currentVendor);
        Navigation.goBack();
    };

    const listHeaderContent = (
        <View style={[styles.pb2, styles.ph5]}>
            <Text style={[styles.pb5, styles.textNormal]}>{translate('workspace.accounting.defaultVendorSelectHeader')}</Text>
        </View>
    );

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.qbo.noAccountsFound')}
            subtitle={translate('workspace.qbo.noAccountsFoundDescription', integrationName)}
            containerStyle={styles.pb10}
        />
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={displayName}
            title="workspace.accounting.defaultVendor"
            headerContent={listHeaderContent}
            data={data}
            onSelectRow={selectVendor}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={shouldShowClearOption ? clearOption.keyForList : data.find((mode) => mode.isSelected)?.keyForList}
            listEmptyContent={listEmptyContent}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO}
            onBackButtonPress={() => Navigation.goBack()}
            pendingAction={settingsPendingAction([configKey], qboConfig?.pendingFields)}
            errors={getLatestErrorField(qboConfig, configKey)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearQBOErrorField(policyID, configKey)}
        />
    );
}

export default QuickbooksNonReimbursableVendorSelectPage;
