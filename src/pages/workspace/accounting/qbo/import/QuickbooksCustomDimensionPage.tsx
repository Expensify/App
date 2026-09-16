import Accordion from '@components/Accordion';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';

import useAccordionAnimation from '@hooks/useAccordionAnimation';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateQuickbooksOnlineSyncCustomDimensions} from '@libs/actions/connections/QuickbooksOnline';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

import {isIntuitEnterpriseSuiteConnection} from '@pages/workspace/accounting/utils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import {clearQBOErrorField} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';

type QuickbooksCustomDimensionPageProps = WithPolicyConnectionsProps & {
    route: {
        params: {
            policyID: string;
            dimensionID: string;
        };
    };
};

function QuickbooksCustomDimensionPage({policy, route}: QuickbooksCustomDimensionPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = route.params.policyID;
    const dimensionID = route.params.dimensionID;
    const qboConfig = policy?.connections?.quickbooksOnline?.config;
    const dimension = policy?.connections?.quickbooksOnline?.data?.customDimensions?.find((customDimension) => customDimension.id === dimensionID && customDimension.active);
    const isSwitchOn = qboConfig?.syncCustomDimensions?.[dimensionID] === CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG;
    const pendingAction = settingsPendingAction([CONST.QUICKBOOKS_CONFIG.SYNC_CUSTOM_DIMENSIONS], qboConfig?.pendingFields);
    const {isAccordionExpanded, shouldAnimateAccordionSection} = useAccordionAnimation(isSwitchOn);

    return (
        <ConnectionLayout
            displayName="QuickbooksCustomDimensionPage"
            headerTitleAlreadyTranslated={dimension?.label}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.pb2, styles.ph5]}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO}
            shouldBeForceBlocked={!dimension || !isIntuitEnterpriseSuiteConnection(policy)}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_IMPORT.getRoute(policyID))}
        >
            <ToggleSettingOptionRow
                title={translate('workspace.accounting.import')}
                switchAccessibilityLabel={dimension?.label ?? translate('workspace.accounting.import')}
                isActive={isSwitchOn}
                onToggle={(isEnabled) =>
                    updateQuickbooksOnlineSyncCustomDimensions(
                        policyID,
                        {
                            [dimensionID]: isEnabled ? CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG : CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE,
                        },
                        qboConfig?.syncCustomDimensions,
                    )
                }
                disabled={!!pendingAction}
                pendingAction={pendingAction}
                errors={getLatestErrorField(qboConfig, CONST.QUICKBOOKS_CONFIG.SYNC_CUSTOM_DIMENSIONS)}
                onCloseError={() => clearQBOErrorField(policyID, CONST.QUICKBOOKS_CONFIG.SYNC_CUSTOM_DIMENSIONS)}
            />
            <Accordion
                isExpanded={isAccordionExpanded}
                isToggleTriggered={shouldAnimateAccordionSection}
            >
                <MenuItemWithTopDescription
                    title={translate('workspace.common.tags')}
                    description={translate('workspace.common.displayedAs')}
                    interactive={false}
                    wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt4]}
                />
            </Accordion>
        </ConnectionLayout>
    );
}

export default withPolicyConnections(QuickbooksCustomDimensionPage);
