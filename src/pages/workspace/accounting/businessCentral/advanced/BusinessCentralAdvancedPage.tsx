import Accordion from '@components/Accordion';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import OfflineWithFeedback from '@components/OfflineWithFeedback';

import useAccordionAnimation from '@hooks/useAccordionAnimation';
import useExpensifyCardFeeds from '@hooks/useExpensifyCardFeeds';
import useIsUnifiedConnectionsBetaEnabled from '@hooks/useIsUnifiedConnectionsBetaEnabled';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {
    clearBusinessCentralErrorField,
    updateBusinessCentralAutoCreateEntities,
    updateBusinessCentralAutoSync,
    updateBusinessCentralExportToNextOpenPeriod,
    updateBusinessCentralSyncExpensifyCardSettlements,
    updateBusinessCentralSyncReimbursedReports,
} from '@libs/actions/connections/BusinessCentral';
import {isExpensifyCardFullySetUp} from '@libs/CardUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';

import {getAccountingSettingsRoute} from '@pages/workspace/connections/utils';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import {authTokenTypeSelector} from '@selectors/Session';
import {CONST as COMMON_CONST} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';

function BusinessCentralAdvancedPage({policy}: WithPolicyConnectionsProps) {
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const isUnifiedConnectionsBetaEnabled = useIsUnifiedConnectionsBetaEnabled();
    const businessCentralConfig = policy?.connections?.businessCentral?.config;
    const bankAccounts = policy?.connections?.businessCentral?.data?.bankAccounts;
    const autoSync = businessCentralConfig?.autoSync?.enabled ?? false;
    const accountingMethod = businessCentralConfig?.export?.accountingMethod ?? COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL;
    const postingMode = businessCentralConfig?.export?.postingMode ?? CONST.BUSINESS_CENTRAL_POSTING_MODE.CREATE_AND_POST;
    const autoCreateEntities = businessCentralConfig?.export?.autoCreateEntities ?? true;
    const exportToNextOpenPeriod = businessCentralConfig?.export?.exportToNextOpenPeriod ?? false;
    const syncReimbursedReports = businessCentralConfig?.sync?.syncReimbursedReports ?? true;
    const reimbursementBankAccount = bankAccounts?.find((bankAccount) => bankAccount.id === businessCentralConfig?.sync?.reimbursementBankAccountID);
    const syncExpensifyCardSettlements = businessCentralConfig?.sync?.syncExpensifyCardSettlements ?? false;
    const settlementsBankAccount = bankAccounts?.find((bankAccount) => bankAccount.id === businessCentralConfig?.sync?.settlementsBankAccountID);
    const allCardSettings = useExpensifyCardFeeds(policyID);
    const isExpensifyCardsEnabled = Object.values(allCardSettings ?? {}).some((cardSetting) => isExpensifyCardFullySetUp(policy, cardSetting));

    const {isAccordionExpanded: isAutoSyncAccordionExpanded, shouldAnimateAccordionSection: shouldAnimateAutoSyncAccordionSection} = useAccordionAnimation(autoSync);
    const {isAccordionExpanded: isSyncReimbursedReportsAccordionExpanded, shouldAnimateAccordionSection: shouldAnimateSyncReimbursedReportsAccordionSection} =
        useAccordionAnimation(syncReimbursedReports);
    const {isAccordionExpanded: isSyncExpensifyCardSettlementsAccordionExpanded, shouldAnimateAccordionSection: shouldAnimateSyncExpensifyCardSettlementsAccordionSection} =
        useAccordionAnimation(syncExpensifyCardSettlements);

    return (
        <ConnectionLayout
            onBackButtonPress={() => Navigation.goBack(getAccountingSettingsRoute(isUnifiedConnectionsBetaEnabled, policyID))}
            displayName="BusinessCentralAdvancedPage"
            headerTitle="workspace.accounting.advanced"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL}
            shouldBeBlocked
        >
            <ToggleSettingOptionRow
                title={translate('workspace.accounting.autoSync')}
                subtitle={translate('workspace.businessCentral.advanced.autoSyncDescription')}
                switchAccessibilityLabel={translate('workspace.accounting.autoSync')}
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive={autoSync}
                onToggle={() => policyID && updateBusinessCentralAutoSync(policyID, !autoSync, autoSync)}
                pendingAction={settingsPendingAction([CONST.BUSINESS_CENTRAL_CONFIG.AUTO_SYNC], businessCentralConfig?.pendingFields)}
                errors={getLatestErrorField(businessCentralConfig ?? {}, CONST.BUSINESS_CENTRAL_CONFIG.AUTO_SYNC)}
                onCloseError={() => policyID && clearBusinessCentralErrorField(policyID, CONST.BUSINESS_CENTRAL_CONFIG.AUTO_SYNC)}
            />
            <Accordion
                isExpanded={isAutoSyncAccordionExpanded}
                isToggleTriggered={shouldAnimateAutoSyncAccordionSection}
            >
                <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.BUSINESS_CENTRAL_CONFIG.ACCOUNTING_METHOD], businessCentralConfig?.pendingFields)}>
                    <MenuItem.Root
                        onPress={callFunctionIfActionIsAllowed(
                            () => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_BUSINESS_CENTRAL_ACCOUNTING_METHOD.getRoute(policyID)) : undefined),
                            false,
                            session,
                        )}
                    >
                        <MenuItemField.Row
                            name={translate('workspace.businessCentral.advanced.accountingMethods.label')}
                            value={translate(`workspace.businessCentral.advanced.accountingMethods.values.${accountingMethod}`)}
                        >
                            {areSettingsInErrorFields([CONST.BUSINESS_CENTRAL_CONFIG.ACCOUNTING_METHOD], businessCentralConfig?.errorFields) && (
                                <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                            )}
                            <MenuItem.Chevron />
                        </MenuItemField.Row>
                        <MenuItem.HelpText message={translate(`workspace.businessCentral.advanced.accountingMethods.alternateText.${accountingMethod}`)} />
                    </MenuItem.Root>
                </OfflineWithFeedback>
            </Accordion>
            <View style={[styles.mv3, styles.mh5, styles.borderTop]} />
            <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.BUSINESS_CENTRAL_CONFIG.POSTING_MODE], businessCentralConfig?.pendingFields)}>
                <MenuItemField
                    name={translate('workspace.businessCentral.advanced.postingMode.label')}
                    onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_BUSINESS_CENTRAL_ADVANCED_POSTING_MODE.getRoute(policyID)) : undefined)}
                    value={translate(`workspace.businessCentral.advanced.postingMode.values.${postingMode}.label`)}
                >
                    {areSettingsInErrorFields([CONST.BUSINESS_CENTRAL_CONFIG.POSTING_MODE], businessCentralConfig?.errorFields) && (
                        <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                    )}
                </MenuItemField>
            </OfflineWithFeedback>
            <ToggleSettingOptionRow
                title={translate('workspace.businessCentral.advanced.autoCreateEntities')}
                switchAccessibilityLabel={translate('workspace.businessCentral.advanced.autoCreateEntities')}
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive={autoCreateEntities}
                onToggle={() => policyID && updateBusinessCentralAutoCreateEntities(policyID, !autoCreateEntities, autoCreateEntities)}
                pendingAction={settingsPendingAction([CONST.BUSINESS_CENTRAL_CONFIG.AUTO_CREATE_ENTITIES], businessCentralConfig?.pendingFields)}
                errors={getLatestErrorField(businessCentralConfig ?? {}, CONST.BUSINESS_CENTRAL_CONFIG.AUTO_CREATE_ENTITIES)}
                onCloseError={() => policyID && clearBusinessCentralErrorField(policyID, CONST.BUSINESS_CENTRAL_CONFIG.AUTO_CREATE_ENTITIES)}
            />
            <ToggleSettingOptionRow
                title={translate('workspace.businessCentral.advanced.exportToNextOpenPeriod')}
                subtitle={translate('workspace.businessCentral.advanced.exportToNextOpenPeriodDescription')}
                switchAccessibilityLabel={translate('workspace.businessCentral.advanced.exportToNextOpenPeriod')}
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive={exportToNextOpenPeriod}
                onToggle={() => policyID && updateBusinessCentralExportToNextOpenPeriod(policyID, !exportToNextOpenPeriod, exportToNextOpenPeriod)}
                pendingAction={settingsPendingAction([CONST.BUSINESS_CENTRAL_CONFIG.EXPORT_TO_NEXT_OPEN_PERIOD], businessCentralConfig?.pendingFields)}
                errors={getLatestErrorField(businessCentralConfig ?? {}, CONST.BUSINESS_CENTRAL_CONFIG.EXPORT_TO_NEXT_OPEN_PERIOD)}
                onCloseError={() => policyID && clearBusinessCentralErrorField(policyID, CONST.BUSINESS_CENTRAL_CONFIG.EXPORT_TO_NEXT_OPEN_PERIOD)}
            />
            <View style={[styles.mv3, styles.mh5, styles.borderTop]} />
            <ToggleSettingOptionRow
                title={translate('workspace.businessCentral.advanced.syncReimbursedReports')}
                subtitle={translate('workspace.businessCentral.advanced.syncReimbursedReportsDescription')}
                switchAccessibilityLabel={translate('workspace.businessCentral.advanced.syncReimbursedReports')}
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive={syncReimbursedReports}
                onToggle={() => policyID && updateBusinessCentralSyncReimbursedReports(policyID, !syncReimbursedReports, syncReimbursedReports)}
                pendingAction={settingsPendingAction([CONST.BUSINESS_CENTRAL_CONFIG.SYNC_REIMBURSED_REPORTS], businessCentralConfig?.pendingFields)}
                errors={getLatestErrorField(businessCentralConfig ?? {}, CONST.BUSINESS_CENTRAL_CONFIG.SYNC_REIMBURSED_REPORTS)}
                onCloseError={() => policyID && clearBusinessCentralErrorField(policyID, CONST.BUSINESS_CENTRAL_CONFIG.SYNC_REIMBURSED_REPORTS)}
            />
            <Accordion
                isExpanded={isSyncReimbursedReportsAccordionExpanded}
                isToggleTriggered={shouldAnimateSyncReimbursedReportsAccordionSection}
            >
                <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.BUSINESS_CENTRAL_CONFIG.REIMBURSEMENT_BANK_ACCOUNT_ID], businessCentralConfig?.pendingFields)}>
                    <MenuItemField
                        name={translate('workspace.businessCentral.advanced.reimbursementBankAccount.label')}
                        onPress={() =>
                            policyID
                                ? Navigation.navigate(
                                      ROUTES.POLICY_ACCOUNTING_BUSINESS_CENTRAL_BANK_ACCOUNT_SELECTOR.getRoute(policyID, CONST.BUSINESS_CENTRAL_CONFIG.REIMBURSEMENT_BANK_ACCOUNT_ID),
                                  )
                                : undefined
                        }
                        value={reimbursementBankAccount ? `${reimbursementBankAccount.number} ${reimbursementBankAccount.name}` : undefined}
                    >
                        {areSettingsInErrorFields([CONST.BUSINESS_CENTRAL_CONFIG.REIMBURSEMENT_BANK_ACCOUNT_ID], businessCentralConfig?.errorFields) && (
                            <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                        )}
                    </MenuItemField>
                </OfflineWithFeedback>
            </Accordion>
            {isExpensifyCardsEnabled && (
                <>
                    <View style={[styles.mv3, styles.mh5, styles.borderTop]} />
                    <ToggleSettingOptionRow
                        title={translate('workspace.businessCentral.advanced.syncExpensifyCardSettlements')}
                        switchAccessibilityLabel={translate('workspace.businessCentral.advanced.syncExpensifyCardSettlements')}
                        wrapperStyle={[styles.mv3, styles.mh5]}
                        isActive={syncExpensifyCardSettlements}
                        onToggle={() => policyID && updateBusinessCentralSyncExpensifyCardSettlements(policyID, !syncExpensifyCardSettlements, syncExpensifyCardSettlements)}
                        pendingAction={settingsPendingAction([CONST.BUSINESS_CENTRAL_CONFIG.SYNC_EXPENSIFY_CARD_SETTLEMENTS], businessCentralConfig?.pendingFields)}
                        errors={getLatestErrorField(businessCentralConfig ?? {}, CONST.BUSINESS_CENTRAL_CONFIG.SYNC_EXPENSIFY_CARD_SETTLEMENTS)}
                        onCloseError={() => policyID && clearBusinessCentralErrorField(policyID, CONST.BUSINESS_CENTRAL_CONFIG.SYNC_EXPENSIFY_CARD_SETTLEMENTS)}
                    />
                    <Accordion
                        isExpanded={isSyncExpensifyCardSettlementsAccordionExpanded}
                        isToggleTriggered={shouldAnimateSyncExpensifyCardSettlementsAccordionSection}
                    >
                        <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.BUSINESS_CENTRAL_CONFIG.SETTLEMENTS_BANK_ACCOUNT_ID], businessCentralConfig?.pendingFields)}>
                            <MenuItemField
                                name={translate('workspace.businessCentral.advanced.settlementsBankAccount.label')}
                                onPress={() =>
                                    policyID
                                        ? Navigation.navigate(
                                              ROUTES.POLICY_ACCOUNTING_BUSINESS_CENTRAL_BANK_ACCOUNT_SELECTOR.getRoute(policyID, CONST.BUSINESS_CENTRAL_CONFIG.SETTLEMENTS_BANK_ACCOUNT_ID),
                                          )
                                        : undefined
                                }
                                value={settlementsBankAccount ? `${settlementsBankAccount.number} ${settlementsBankAccount.name}` : undefined}
                            >
                                {areSettingsInErrorFields([CONST.BUSINESS_CENTRAL_CONFIG.SETTLEMENTS_BANK_ACCOUNT_ID], businessCentralConfig?.errorFields) && (
                                    <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                                )}
                            </MenuItemField>
                        </OfflineWithFeedback>
                    </Accordion>
                </>
            )}
        </ConnectionLayout>
    );
}

export default withPolicyConnections(BusinessCentralAdvancedPage);
