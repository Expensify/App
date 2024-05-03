import React, {useMemo} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Connections from '@libs/actions/connections';
import Navigation from '@libs/Navigation/Navigation';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import { getTrackingCategory } from '@libs/actions/connections/ConnectToXero';
import { TranslationPaths } from '@src/languages/types';
import { MenuItemProps } from '@components/MenuItem';

function XeroTrackingCategoryConfigurationPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '';
    const {importTrackingCategories, pendingFields} = policy?.connections?.xero?.config ?? {};
    const { trackingCategories } = policy?.connections?.xero?.data ?? {};

    const menuItems: MenuItemProps[] = useMemo(
        () => {
        const availableCategories = [];

        const costCenterCategoryValue = getTrackingCategory(policy,  CONST.XERO_CONFIG.TRACK_CATEGORY_FIELDS.COST_CENTERS)?.value ?? "";
        const regionCategoryValue = getTrackingCategory(policy,  CONST.XERO_CONFIG.TRACK_CATEGORY_FIELDS.REGION)?.value ?? "";
        if (costCenterCategoryValue) {
            availableCategories.push({
                description: translate('workspace.xero.mapXeroCostCentersTo'),
                onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_MAP_COST_CENTERS.getRoute(policyID)),
                title: translate(`workspace.xero.trackingCategoriesOptions.${costCenterCategoryValue.toLowerCase()}` as TranslationPaths)
            });
        }

        if (trackingCategories?.find((category) => category.name.toLowerCase() === CONST.XERO_CONFIG.TRACK_CATEGORY_FIELDS.REGION)) {
            availableCategories.push({
                description: translate('workspace.xero.mapXeroRegionsTo'),
                onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_MAP_REGIONS.getRoute(policyID)),
                title: translate(`workspace.xero.trackingCategoriesOptions.${regionCategoryValue.toLowerCase()}` as TranslationPaths)
            });
        }
        return availableCategories;
    },
        [translate, policy, policyID, trackingCategories],
    );

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                shouldEnableMaxHeight
                testID={XeroTrackingCategoryConfigurationPage.displayName}
            >
                <HeaderWithBackButton title={translate('workspace.xero.trackingCategories')} />
                <View style={[styles.pb2, styles.ph5]}>
                    <Text style={styles.pb5}>{translate('workspace.xero.trackingCategoriesDescription')}</Text>
                    <View style={[styles.flexRow, styles.mb4, styles.alignItemsCenter, styles.justifyContentBetween]}>
                        <View style={styles.flex1}>
                            <Text fontSize={variables.fontSizeNormal}>{translate('workspace.accounting.import')}</Text>
                        </View>
                        <OfflineWithFeedback pendingAction={pendingFields?.importTrackingCategories}>
                            <View style={[styles.flex1, styles.alignItemsEnd, styles.pl3]}>
                                <Switch
                                    accessibilityLabel={translate('workspace.xero.trackingCategories')}
                                    isOn={Boolean(importTrackingCategories)}
                                    onToggle={() =>
                                        Connections.updatePolicyConnectionConfig(
                                            policyID,
                                            CONST.POLICY.CONNECTIONS.NAME.XERO,
                                            CONST.XERO_CONFIG.IMPORT_TRACK_CATEGORIES,
                                            !importTrackingCategories,
                                        )
                                    }
                                />
                            </View>
                        </OfflineWithFeedback>
                    </View>
                </View>
                {importTrackingCategories && (
                    <View>
                        {menuItems.map((menuItem: MenuItemProps) => (
                            <MenuItemWithTopDescription
                                key={menuItem.description}
                                title={menuItem.title}
                                description={menuItem.description}
                                shouldShowRightIcon
                                onPress={menuItem.onPress}
                            />
                        ))}
                    </View>
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

XeroTrackingCategoryConfigurationPage.displayName = 'XeroTrackCategoriesPage';
export default withPolicyConnections(XeroTrackingCategoryConfigurationPage);
