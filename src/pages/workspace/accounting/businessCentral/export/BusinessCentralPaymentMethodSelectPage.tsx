import BlockingView from '@components/BlockingViews/BlockingView';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useSelectionListSearch from '@hooks/useSelectionListSearch';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearBusinessCentralErrorField, updateBusinessCentralPaymentMethod} from '@libs/actions/connections/BusinessCentral';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

type PaymentMethodListItem = ListItem & {
    value: string;
};

function BusinessCentralPaymentMethodSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const policyID = policy?.id;
    const businessCentralConfig = policy?.connections?.businessCentral?.config;
    const paymentMethodCode = businessCentralConfig?.export?.paymentMethodCode;
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_BUSINESS_CENTRAL_EXPORT.getRoute(policyID) : undefined;

    const paymentMethodOptions: PaymentMethodListItem[] =
        policy?.connections?.businessCentral?.data?.paymentMethods?.map((paymentMethod) => ({
            value: paymentMethod.code,
            text: paymentMethod.displayName,
            keyForList: paymentMethod.code,
            isSelected: paymentMethodCode === paymentMethod.code,
        })) ?? [];
    const {filteredData, textInputOptions} = useSelectionListSearch(paymentMethodOptions);

    // The payment method is optional, and an empty code clears it
    const noneOption: PaymentMethodListItem = {
        value: '',
        text: translate('common.none'),
        keyForList: '',
        isSelected: !paymentMethodCode,
    };
    const data = paymentMethodOptions.length > 0 ? [noneOption, ...filteredData] : [];

    const headerContent = (
        <View>
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.businessCentral.paymentMethod.description')}</Text>
        </View>
    );

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.businessCentral.noPaymentMethodsFound')}
            subtitle={translate('workspace.businessCentral.noPaymentMethodsFoundDescription')}
            containerStyle={styles.pb10}
        />
    );

    const selectPaymentMethod = (item: PaymentMethodListItem) => {
        if (item.value !== (paymentMethodCode ?? '') && policyID) {
            updateBusinessCentralPaymentMethod(policyID, item.value, paymentMethodCode);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="BusinessCentralPaymentMethodSelectPage"
            title="workspace.businessCentral.paymentMethod.label"
            data={data}
            textInputOptions={textInputOptions}
            headerContent={headerContent}
            listEmptyContent={listEmptyContent}
            onSelectRow={selectPaymentMethod}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={paymentMethodCode ?? ''}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL}
            pendingAction={settingsPendingAction([CONST.BUSINESS_CENTRAL_CONFIG.PAYMENT_METHOD_CODE], businessCentralConfig?.pendingFields)}
            errors={getLatestErrorField(businessCentralConfig, CONST.BUSINESS_CENTRAL_CONFIG.PAYMENT_METHOD_CODE)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => policyID && clearBusinessCentralErrorField(policyID, CONST.BUSINESS_CENTRAL_CONFIG.PAYMENT_METHOD_CODE)}
        />
    );
}

export default withPolicyConnections(BusinessCentralPaymentMethodSelectPage);
