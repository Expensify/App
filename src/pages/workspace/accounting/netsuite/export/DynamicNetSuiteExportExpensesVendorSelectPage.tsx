import BlockingView from '@components/BlockingViews/BlockingView';
import type {SelectorType} from '@components/SelectionScreen';
import SelectionScreen from '@components/SelectionScreen';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateNetSuiteDefaultVendor} from '@libs/actions/connections/NetSuiteCommands';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getNetSuiteVendorOptions} from '@libs/NetSuiteUtils';
import {settingsPendingAction} from '@libs/PolicyUtils';

import {shouldHideReimbursableDefaultVendor} from '@pages/workspace/accounting/netsuite/utils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

import {clearNetSuiteErrorField} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import {useRoute} from '@react-navigation/native';
import React from 'react';

function DynamicNetSuiteExportExpensesVendorSelectPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const policyID = policy?.id;
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_NETSUITE_EXPORT_EXPENSES_VENDOR_SELECT>>();
    const params = route.params;
    const isReimbursable = params.expenseType === CONST.NETSUITE_EXPENSE_TYPE.REIMBURSABLE;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_VENDOR_SELECT.path);

    const config = policy?.connections?.netsuite?.options.config;
    const vendorOptions: SelectorType[] = getNetSuiteVendorOptions(policy ?? undefined, config?.defaultVendor);
    const clearOption: SelectorType = {
        value: '',
        text: translate('common.none'),
        keyForList: '',
        isSelected: !config?.defaultVendor,
    };
    const shouldShowClearOption = !!config?.defaultVendor || vendorOptions.length > 0;
    const netsuiteVendorOptions: SelectorType[] = shouldShowClearOption ? [clearOption, ...vendorOptions] : vendorOptions;

    const initiallyFocusedOptionKey = netsuiteVendorOptions?.find((mode) => mode.isSelected)?.keyForList;

    const goBack = () => {
        Navigation.goBack(backPath);
    };

    const updateDefaultVendor = ({value}: SelectorType) => {
        const isAlreadySelected = value === config?.defaultVendor || (!value && !config?.defaultVendor);
        if (isAlreadySelected) {
            return;
        }
        if (policyID) {
            updateNetSuiteDefaultVendor(policyID, value, config?.defaultVendor);
        }
        goBack();
    };

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.netsuite.noVendorsFound')}
            subtitle={translate('workspace.netsuite.noVendorsFoundDescription')}
            containerStyle={styles.pb10}
        />
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="NetSuiteExportExpensesVendorSelectPage"
            data={netsuiteVendorOptions}
            onSelectRow={updateDefaultVendor}
            initiallyFocusedOptionKey={initiallyFocusedOptionKey}
            onBackButtonPress={goBack}
            title="workspace.accounting.defaultVendor"
            listEmptyContent={listEmptyContent}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            shouldBeBlocked={shouldHideReimbursableDefaultVendor(isReimbursable, config)}
            pendingAction={settingsPendingAction([CONST.NETSUITE_CONFIG.DEFAULT_VENDOR], config?.pendingFields)}
            errors={getLatestErrorField(config, CONST.NETSUITE_CONFIG.DEFAULT_VENDOR)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.DEFAULT_VENDOR)}
        />
    );
}

export default withPolicyConnections(DynamicNetSuiteExportExpensesVendorSelectPage);
