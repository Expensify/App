import {useRoute} from '@react-navigation/native';
import React from 'react';
import type {ValueOf} from 'type-fest';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';

type QBOSectionType = {
    title?: string;
    description?: string;
    onPress: () => void;
    errorText?: string;
    hintText?: string;
    subscribedSettings: string[];
    pendingAction?: PendingAction;
    errors?: Errors;
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
};

const vendor = [CONST.QUICKBOOKS_CONFIG.TRAVEL_INVOICING_VENDOR];
const payableAccount = [CONST.QUICKBOOKS_CONFIG.TRAVEL_INVOICING_PAYABLE_ACCOUNT];

function QuickbooksTravelInvoicingConfigurationPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_TRAVEL_INVOICING_CONFIGURATION>>();
    const params = route.params;
    const backTo = params.backTo;

    const policyID = policy?.id ?? String(CONST.DEFAULT_NUMBER_ID);
    const qboConfig = policy?.connections?.quickbooksOnline?.config;

    const {vendors, accountPayable} = policy?.connections?.quickbooksOnline?.data ?? {};
    const travelVendor = vendors?.find((v) => v.id === qboConfig?.travelInvoicingVendorID);
    const travelPayableAccount = accountPayable?.find((a) => a.id === qboConfig?.travelInvoicingPayableAccountID);

    const sections: QBOSectionType[] = [
        {
            title: travelVendor?.name,
            description: translate('workspace.qbo.travelInvoicingVendor'),
            onPress: () => {
                if (!policyID) {
                    return;
                }
                Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_TRAVEL_INVOICING_VENDOR_SELECT.getRoute(policyID, Navigation.getActiveRoute()));
            },
            subscribedSettings: vendor,
            pendingAction: settingsPendingAction(vendor, qboConfig?.pendingFields),
            brickRoadIndicator: areSettingsInErrorFields(vendor, qboConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
        },
        {
            title: travelPayableAccount?.name,
            description: translate('workspace.qbo.travelInvoicingPayableAccount'),
            onPress: () => {
                if (!policyID) {
                    return;
                }
                Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_TRAVEL_INVOICING_PAYABLE_ACCOUNT_SELECT.getRoute(policyID, Navigation.getActiveRoute()));
            },
            subscribedSettings: payableAccount,
            pendingAction: settingsPendingAction(payableAccount, qboConfig?.pendingFields),
            brickRoadIndicator: areSettingsInErrorFields(payableAccount, qboConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
        },
    ];

    return (
        <ConnectionLayout
            displayName="QuickbooksTravelInvoicingConfigurationPage"
            headerTitle="workspace.qbo.travelInvoicing"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO}
            onBackButtonPress={() => Navigation.goBack(backTo ?? ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT.getRoute(policyID))}
        >
            {sections.map((section) => (
                <OfflineWithFeedback
                    pendingAction={section.pendingAction}
                    key={section.subscribedSettings.at(0)}
                    errors={section.errors}
                    errorRowStyles={[styles.ph5]}
                >
                    <MenuItemWithTopDescription
                        title={section.title}
                        description={section.description}
                        onPress={section.onPress}
                        shouldShowRightIcon
                        brickRoadIndicator={section.brickRoadIndicator}
                        hintText={section.hintText}
                    />
                </OfflineWithFeedback>
            ))}
        </ConnectionLayout>
    );
}

export default withPolicyConnections(QuickbooksTravelInvoicingConfigurationPage);
