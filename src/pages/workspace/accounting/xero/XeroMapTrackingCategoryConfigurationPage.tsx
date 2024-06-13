import {useRoute} from '@react-navigation/native';
import React, {useCallback, useMemo} from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Connections from '@libs/actions/connections';
import Navigation from '@libs/Navigation/Navigation';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';

type RouteParams = {
    categoryId?: string;
    categoryName?: string;
};

const TRACKING_CATEGORIES_KEY = 'trackingCategory_';

function XeroMapTrackingCategoryConfigurationPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const route = useRoute();
    const params = route.params as RouteParams;
    const styles = useThemeStyles();
    const categoryId = params?.categoryId ?? '';
    const categoryName = decodeURIComponent(params?.categoryName ?? '');
    const policyID = policy?.id ?? '-1';
    const {trackingCategories} = policy?.connections?.xero?.data ?? {};
    const {mappings} = policy?.connections?.xero?.config ?? {};

    const currentTrackingCategory = trackingCategories?.find((category) => category.id === categoryId);
    const currentTrackingCategoryValue = currentTrackingCategory ? mappings?.[`${TRACKING_CATEGORIES_KEY}${currentTrackingCategory.id}`] ?? '' : '';

    const optionsList = useMemo(
        () =>
            Object.values(CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS).map((option) => ({
                value: option,
                text: translate(`workspace.xero.trackingCategoriesOptions.${option.toLowerCase()}` as TranslationPaths),
                keyForList: option,
                isSelected: option === currentTrackingCategoryValue,
            })),
        [translate, currentTrackingCategoryValue],
    );

    const updateMapping = useCallback(
        (option: {value: string}) => {
            if (option.value !== categoryName) {
                Connections.updatePolicyConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.XERO, CONST.XERO_CONFIG.MAPPINGS, {
                    ...(policy?.connections?.xero?.config?.mappings ?? {}),
                    ...(categoryId ? {[`${CONST.XERO_CONFIG.TRACKING_CATEGORY_PREFIX}${categoryId}`]: option.value} : {}),
                });
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_XERO_TRACKING_CATEGORIES.getRoute(policyID));
        },
        [categoryId, categoryName, policyID, policy?.connections?.xero?.config?.mappings],
    );

    return (
        <ConnectionLayout
            displayName={XeroMapTrackingCategoryConfigurationPage.displayName}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            titleStyle={[styles.pb2, styles.ph5]}
            contentContainerStyle={[styles.flex1]}
            shouldUseScrollView={false}
            headerTitleAlreadyTranslated={translate('workspace.xero.mapTrackingCategoryTo', {categoryName})}
            titleAlreadyTranslated={translate('workspace.xero.mapTrackingCategoryToDescription', {categoryName})}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.XERO}
        >
            <SelectionList
                sections={[{data: optionsList}]}
                ListItem={RadioListItem}
                onSelectRow={updateMapping}
                initiallyFocusedOptionKey={optionsList.find((option) => option.isSelected)?.keyForList}
                shouldDebounceRowSelect
            />
        </ConnectionLayout>
    );
}

XeroMapTrackingCategoryConfigurationPage.displayName = 'XeroMapTrackingCategoryConfigurationPage';
export default withPolicyConnections(XeroMapTrackingCategoryConfigurationPage);
