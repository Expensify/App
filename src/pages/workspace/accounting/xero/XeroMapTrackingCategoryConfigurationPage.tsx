import {useRoute} from '@react-navigation/native';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import RadioListItem from '@components/SelectionList/RadioListItem';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Xero from '@libs/actions/connections/Xero';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';

type RouteParams = {
    categoryId?: string;
    categoryName?: string;
};

function XeroMapTrackingCategoryConfigurationPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const route = useRoute();
    const params = route.params as RouteParams;
    const styles = useThemeStyles();
    const categoryId = params?.categoryId ?? '';
    const categoryName = decodeURIComponent(params?.categoryName ?? '');
    const policyID = policy?.id ?? '-1';
    const {config} = policy?.connections?.xero ?? {};
    const {trackingCategories} = policy?.connections?.xero?.data ?? {};
    const {mappings} = policy?.connections?.xero?.config ?? {};

    const currentTrackingCategory = trackingCategories?.find((category) => category.id === categoryId);
    const currentTrackingCategoryValue = currentTrackingCategory ? mappings?.[`${CONST.XERO_CONFIG.TRACKING_CATEGORY_PREFIX}${currentTrackingCategory.id}`] ?? '' : '';

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

    const listHeaderComponent = useMemo(
        () => (
            <View style={[styles.pb2, styles.ph5]}>
                <Text style={[styles.pb5, styles.textNormal]}>{translate('workspace.xero.mapTrackingCategoryToDescription', {categoryName})}</Text>
            </View>
        ),
        [translate, styles.pb2, styles.ph5, styles.pb5, styles.textNormal, categoryName],
    );

    const updateMapping = useCallback(
        (option: {value: string}) => {
            if (option.value !== categoryName) {
                Xero.updateXeroMappings(
                    policyID,
                    categoryId ? {[`${CONST.XERO_CONFIG.TRACKING_CATEGORY_PREFIX}${categoryId}`]: option.value} : {},
                    categoryId ? {[`${CONST.XERO_CONFIG.TRACKING_CATEGORY_PREFIX}${categoryId}`]: currentTrackingCategoryValue} : {},
                );
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_XERO_TRACKING_CATEGORIES.getRoute(policyID));
        },
        [categoryId, categoryName, currentTrackingCategoryValue, policyID],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={XeroMapTrackingCategoryConfigurationPage.displayName}
            sections={optionsList.length ? [{data: optionsList}] : []}
            listItem={RadioListItem}
            onSelectRow={updateMapping}
            initiallyFocusedOptionKey={optionsList.find((option) => option.isSelected)?.keyForList}
            headerContent={listHeaderComponent}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_XERO_TRACKING_CATEGORIES.getRoute(policyID))}
            headerTitleAlreadyTranslated={translate('workspace.xero.mapTrackingCategoryTo', {categoryName})}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.XERO}
            pendingAction={settingsPendingAction([`${CONST.XERO_CONFIG.TRACKING_CATEGORY_PREFIX}${categoryId}`], config?.pendingFields)}
            errors={ErrorUtils.getLatestErrorField(config ?? {}, `${CONST.XERO_CONFIG.TRACKING_CATEGORY_PREFIX}${categoryId}`)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => Policy.clearXeroErrorField(policyID, `${CONST.XERO_CONFIG.TRACKING_CATEGORY_PREFIX}${categoryId}`)}
            shouldSingleExecuteRowSelect
        />
    );
}

XeroMapTrackingCategoryConfigurationPage.displayName = 'XeroMapTrackingCategoryConfigurationPage';
export default withPolicyConnections(XeroMapTrackingCategoryConfigurationPage);
