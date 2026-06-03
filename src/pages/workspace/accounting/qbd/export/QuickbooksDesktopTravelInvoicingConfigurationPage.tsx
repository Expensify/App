import React from 'react';
import type {ValueOf} from 'type-fest';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';

type QBDSection = {
    title?: string;
    description?: string;
    onPress: () => void;
    subscribedSettings: string[];
    pendingAction?: PendingAction;
    errors?: Errors;
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
};

const payableAccount = [CONST.QUICKBOOKS_DESKTOP_CONFIG.TRAVEL_INVOICING_PAYABLE_ACCOUNT];

function QuickbooksDesktopTravelInvoicingConfigurationPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const policyID = policy?.id ?? String(CONST.DEFAULT_NUMBER_ID);
    const qbdConfig = policy?.connections?.quickbooksDesktop?.config;
    const {payableAccounts} = policy?.connections?.quickbooksDesktop?.data ?? {};
    const travelPayableAccount = payableAccounts?.find((item) => item.id === qbdConfig?.export?.travelInvoicingPayableAccountID);
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_TRAVEL_INVOICING_CONFIGURATION.path);
    const travelInvoicingPath = `${ROUTES.POLICY_ACCOUNTING.getRoute(policyID)}/${DYNAMIC_ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT.path}/${DYNAMIC_ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_TRAVEL_INVOICING_CONFIGURATION.path}`;

    const sections: QBDSection[] = [
        {
            title: travelPayableAccount?.name,
            description: translate('workspace.common.travelInvoicingPayableAccount'),
            onPress: () => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_TRAVEL_INVOICING_PAYABLE_ACCOUNT_SELECT.path, travelInvoicingPath)),
            subscribedSettings: payableAccount,
            pendingAction: settingsPendingAction(payableAccount, qbdConfig?.pendingFields),
            brickRoadIndicator: areSettingsInErrorFields(payableAccount, qbdConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
        },
    ];

    return (
        <ConnectionLayout
            displayName="QuickbooksDesktopTravelInvoicingConfigurationPage"
            headerTitle="workspace.common.travelInvoicing"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBD}
            onBackButtonPress={() => Navigation.goBack(backPath)}
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
                    />
                </OfflineWithFeedback>
            ))}
        </ConnectionLayout>
    );
}

export default withPolicyConnections(QuickbooksDesktopTravelInvoicingConfigurationPage);
