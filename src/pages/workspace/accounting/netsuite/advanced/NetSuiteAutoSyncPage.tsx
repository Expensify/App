import {CONST as COMMON_CONST} from 'expensify-common';
import React from 'react';
import Accordion from '@components/Accordion';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import useAccordionAnimation from '@hooks/useAccordionAnimation';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Connections from '@libs/actions/connections/NetSuiteCommands';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';

function NetSuiteAutoSyncPage({policy, route}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const config = policy?.connections?.netsuite?.options?.config;
    const autoSyncConfig = policy?.connections?.netsuite?.config;
    const policyID = route.params.policyID ?? '-1';
    const accountingMethod = policy?.connections?.netsuite?.options?.config?.accountingMethod;
    const pendingAction =
        settingsPendingAction([CONST.NETSUITE_CONFIG.AUTO_SYNC], autoSyncConfig?.pendingFields) ?? settingsPendingAction([CONST.NETSUITE_CONFIG.ACCOUNTING_METHOD], config?.pendingFields);

    const {isAccordionExpanded, shouldAnimateAccordionSection} = useAccordionAnimation(!!autoSyncConfig?.autoSync?.enabled);

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                style={[styles.defaultModalContainer]}
                testID={NetSuiteAutoSyncPage.displayName}
                offlineIndicatorStyle={styles.mtAuto}
            >
                <HeaderWithBackButton
                    title={translate('common.settings')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_ADVANCED.getRoute(policyID))}
                />
                <ToggleSettingOptionRow
                    title={translate('workspace.accounting.autoSync')}
                    // wil be converted to translate and spanish translation too
                    subtitle={translate('workspace.accounting.autoSyncDescription')}
                    isActive={!!autoSyncConfig?.autoSync?.enabled}
                    wrapperStyle={[styles.pv2, styles.mh5]}
                    switchAccessibilityLabel={translate('workspace.netsuite.advancedConfig.autoSyncDescription')}
                    shouldPlaceSubtitleBelowSwitch
                    onCloseError={() => Policy.clearNetSuiteAutoSyncErrorField(policyID)}
                    onToggle={(isEnabled) => Connections.updateNetSuiteAutoSync(policyID, isEnabled)}
                    pendingAction={pendingAction}
                    errors={ErrorUtils.getLatestErrorField(autoSyncConfig, CONST.NETSUITE_CONFIG.AUTO_SYNC)}
                />

                <Accordion
                    isExpanded={isAccordionExpanded}
                    style={styles.overflowHidden}
                    isToggleTriggered={shouldAnimateAccordionSection}
                >
                    <OfflineWithFeedback pendingAction={pendingAction}>
                        <MenuItemWithTopDescription
                            title={
                                accountingMethod === COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL
                                    ? translate(`workspace.netsuite.advancedConfig.accountingMethods.values.${COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL}` as TranslationPaths)
                                    : translate(`workspace.netsuite.advancedConfig.accountingMethods.values.${COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH}` as TranslationPaths)
                            }
                            description={translate('workspace.netsuite.advancedConfig.accountingMethods.label')}
                            shouldShowRightIcon
                            onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_ACCOUNTING_METHOD.getRoute(policyID))}
                        />
                    </OfflineWithFeedback>
                </Accordion>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

NetSuiteAutoSyncPage.displayName = 'NetSuiteAutoSyncPage';

export default withPolicyConnections(NetSuiteAutoSyncPage);
