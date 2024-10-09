import React, {useMemo} from 'react';
import {View} from 'react-native';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Xero from '@libs/actions/connections/Xero';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';
import StringUtils from '@libs/StringUtils';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type {XeroTrackingCategory} from '@src/types/onyx/Policy';

function XeroTrackingCategoryConfigurationPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const xeroConfig = policy?.connections?.xero?.config;
    const isSwitchOn = !!xeroConfig?.importTrackingCategories;

    const menuItems = useMemo(() => {
        const trackingCategories = Xero.getTrackingCategories(policy);
        return trackingCategories.map((category: XeroTrackingCategory & {value: string}) => ({
            id: category.id,
            description: translate('workspace.xero.mapTrackingCategoryTo', {categoryName: category.name}) as TranslationPaths,
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_TRACKING_CATEGORIES_MAP.getRoute(policyID, category.id, category.name)),
            title: translate(`workspace.xero.trackingCategoriesOptions.${!StringUtils.isEmptyString(category.value) ? category.value.toLowerCase() : 'default'}` as TranslationPaths),
        }));
    }, [translate, policy, policyID]);

    return (
        <ConnectionLayout
            displayName={XeroTrackingCategoryConfigurationPage.displayName}
            headerTitle="workspace.xero.trackingCategories"
            title="workspace.xero.trackingCategoriesDescription"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.pb2, styles.ph5]}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.XERO}
        >
            <ToggleSettingOptionRow
                title={translate('workspace.accounting.import')}
                switchAccessibilityLabel={translate('workspace.xero.trackingCategories')}
                isActive={isSwitchOn}
                wrapperStyle={styles.mv3}
                onToggle={() => Xero.updateXeroImportTrackingCategories(policyID, !xeroConfig?.importTrackingCategories, xeroConfig?.importTrackingCategories)}
                pendingAction={settingsPendingAction([CONST.XERO_CONFIG.IMPORT_TRACKING_CATEGORIES], xeroConfig?.pendingFields)}
                errors={ErrorUtils.getLatestErrorField(xeroConfig ?? {}, CONST.XERO_CONFIG.IMPORT_TRACKING_CATEGORIES)}
                onCloseError={() => Policy.clearXeroErrorField(policyID, CONST.XERO_CONFIG.IMPORT_TRACKING_CATEGORIES)}
            />
            {xeroConfig?.importTrackingCategories && (
                <View>
                    {menuItems.map((menuItem) => (
                        <OfflineWithFeedback
                            key={menuItem.id}
                            pendingAction={settingsPendingAction([`${CONST.XERO_CONFIG.TRACKING_CATEGORY_PREFIX}${menuItem.id}`], xeroConfig?.pendingFields)}
                        >
                            <MenuItemWithTopDescription
                                title={menuItem.title}
                                description={menuItem.description}
                                shouldShowRightIcon
                                onPress={menuItem.onPress}
                                wrapperStyle={styles.sectionMenuItemTopDescription}
                                brickRoadIndicator={areSettingsInErrorFields([`${CONST.XERO_CONFIG.TRACKING_CATEGORY_PREFIX}${menuItem.id}`], xeroConfig?.errorFields) ? 'error' : undefined}
                            />
                        </OfflineWithFeedback>
                    ))}
                </View>
            )}
        </ConnectionLayout>
    );
}

XeroTrackingCategoryConfigurationPage.displayName = 'XeroTrackCategoriesPage';
export default withPolicyConnections(XeroTrackingCategoryConfigurationPage);
