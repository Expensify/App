import {useRoute} from '@react-navigation/native';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import RadioListItem from '@components/SelectionListWithSections/RadioListItem';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateXeroMappings} from '@libs/actions/connections/Xero';
import {clearXeroErrorField, enablePolicyReportFields} from '@libs/actions/Policy/Policy';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {isControlPolicy, settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
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
    const decodedCategoryName = getDecodedCategoryName(categoryName);
    const policyID = policy?.id;
    const {config} = policy?.connections?.xero ?? {};
    const {trackingCategories} = policy?.connections?.xero?.data ?? {};
    const {mappings} = policy?.connections?.xero?.config ?? {};

    const currentTrackingCategory = trackingCategories?.find((category) => category.id === categoryId);
    const currentTrackingCategoryValue = currentTrackingCategory ? (mappings?.[`${CONST.XERO_CONFIG.TRACKING_CATEGORY_PREFIX}${currentTrackingCategory.id}`] ?? '') : '';
    const reportFieldTrackingCategories = Object.entries(mappings ?? {}).filter(
        ([key, value]) => key.startsWith(CONST.XERO_CONFIG.TRACKING_CATEGORY_PREFIX) && value === CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD,
    );

    const optionsList = useMemo(
        () =>
            Object.values(CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS).map((option) => ({
                value: option,
                text: translate(`workspace.xero.trackingCategoriesOptions.${option.toUpperCase()}` as TranslationPaths),
                keyForList: option,
                isSelected: option === currentTrackingCategoryValue,
            })),
        [translate, currentTrackingCategoryValue],
    );

    const listHeaderComponent = useMemo(
        () => (
            <View style={[styles.pb2, styles.ph5]}>
                <Text style={[styles.pb5, styles.textNormal]}>{translate('workspace.xero.mapTrackingCategoryToDescription', {categoryName: decodedCategoryName})}</Text>
            </View>
        ),
        [translate, styles.pb2, styles.ph5, styles.pb5, styles.textNormal, decodedCategoryName],
    );

    const updateMapping = useCallback(
        (option: {value: string}) => {
            if (option.value !== currentTrackingCategoryValue) {
                if (option.value === CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD && !isControlPolicy(policy)) {
                    const backToRoute = ROUTES.WORKSPACE_UPGRADE.getRoute(
                        policyID,
                        `${CONST.REPORT_FIELDS_FEATURE.xero.mapping}`,
                        ROUTES.POLICY_ACCOUNTING_XERO_TRACKING_CATEGORIES.getRoute(policyID),
                    );
                    Navigation.navigate(`${backToRoute}&categoryId=${categoryId}`);
                    return;
                }
                if (!policyID) {
                    return;
                }
                updateXeroMappings(
                    policyID,
                    categoryId ? {[`${CONST.XERO_CONFIG.TRACKING_CATEGORY_PREFIX}${categoryId}`]: option.value} : {},
                    categoryId ? {[`${CONST.XERO_CONFIG.TRACKING_CATEGORY_PREFIX}${categoryId}`]: currentTrackingCategoryValue} : {},
                );
                if (!reportFieldTrackingCategories.length && option.value === CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD) {
                    enablePolicyReportFields(policyID, true);
                }
                if (reportFieldTrackingCategories.length === 1 && currentTrackingCategoryValue === CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD) {
                    enablePolicyReportFields(policyID, false);
                }
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_XERO_TRACKING_CATEGORIES.getRoute(policyID));
        },
        [categoryId, currentTrackingCategoryValue, reportFieldTrackingCategories.length, policy, policyID],
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
            errors={getLatestErrorField(config ?? {}, `${CONST.XERO_CONFIG.TRACKING_CATEGORY_PREFIX}${categoryId}`)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearXeroErrorField(policyID, `${CONST.XERO_CONFIG.TRACKING_CATEGORY_PREFIX}${categoryId}`)}
            shouldSingleExecuteRowSelect
        />
    );
}

XeroMapTrackingCategoryConfigurationPage.displayName = 'XeroMapTrackingCategoryConfigurationPage';
export default withPolicyConnections(XeroMapTrackingCategoryConfigurationPage);
