import React, {useMemo} from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import * as Connections from '@libs/actions/connections';
import {getTrackingCategory} from '@libs/actions/connections/ConnectToXero';
import Navigation from '@libs/Navigation/Navigation';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';

function XeroMapCostCentersToConfigurationPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const policyID = policy?.id ?? '';

    const category = getTrackingCategory(policy, CONST.XERO_CONFIG.TRACKING_CATEGORY_FIELDS.COST_CENTERS);

    const optionsList = useMemo(
        () =>
            Object.values(CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS).map((option) => ({
                value: option,
                text: translate(`workspace.xero.trackingCategoriesOptions.${option.toLowerCase()}` as TranslationPaths),
                keyForList: option,
                isSelected: option.toLowerCase() === category?.value?.toLowerCase(),
            })),
        [translate, category],
    );

    return (
        <ConnectionLayout
            displayName={XeroMapCostCentersToConfigurationPage.displayName}
            headerTitle="workspace.xero.mapXeroCostCentersTo"
            title="workspace.xero.mapXeroCostCentersToDescription"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID && category?.id ? policyID : ''}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
        >
            <SelectionList
                sections={[{data: optionsList}]}
                ListItem={RadioListItem}
                onSelectRow={(option) => {
                    Connections.updatePolicyConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.XERO, CONST.XERO_CONFIG.MAPPINGS, {
                        ...(policy?.connections?.xero?.config?.mappings ?? {}),
                        ...(category?.id ? {[`${CONST.XERO_CONFIG.TRACKING_CATEGORY_PREFIX}${category.id}`]: option.value} : {}),
                    });
                    Navigation.goBack(ROUTES.POLICY_ACCOUNTING_XERO_TRACKING_CATEGORIES.getRoute(policyID));
                }}
            />
        </ConnectionLayout>
    );
}

XeroMapCostCentersToConfigurationPage.displayName = 'XeroMapCostCentersToConfigurationPage';
export default withPolicyConnections(XeroMapCostCentersToConfigurationPage);
