import Accordion from '@components/Accordion';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Text from '@components/Text';

import useAccordionAnimation from '@hooks/useAccordionAnimation';
import useCardFeeds from '@hooks/useCardFeeds';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearRilletErrorField, updateRilletExportToMultipleAccounts} from '@libs/actions/connections/Rillet';
import {areCardsCustomExportInErrorFields, getCardsCustomExportPendingAction, getCardsUsingCustomExportCount} from '@libs/CardFeedUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';

import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

function RilletExportPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const [cardFeeds] = useCardFeeds(policyID);
    const [cardList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}`);
    const policyOwner = policy?.owner;
    const rilletConfig = policy?.connections?.rillet?.config;
    const rilletData = policy?.connections?.rillet?.data;
    const exporter = rilletConfig?.export?.exporter ?? policyOwner;
    const exportReimbursable = rilletConfig?.export?.reimbursable ?? CONST.RILLET_EXPORT_REIMBURSABLE.VENDOR_BILL;
    const exportDate = rilletConfig?.export?.exportDate ?? CONST.RILLET_EXPORT_DATE.LAST_EXPENSE;
    const exportCompanyCard = rilletConfig?.export?.companyCard ?? CONST.RILLET_EXPORT_COMPANY_CARD.CREDIT_CARD;
    const defaultCompanyCardVendor = rilletData?.vendors?.find((vendor) => vendor.id === rilletConfig?.export?.defaultVendorID);
    const companyCardAccount = rilletData?.accounts?.find((account) => account.code === rilletConfig?.export?.creditCardAccountCode);
    const exportToMultipleAccounts = rilletConfig?.export?.exportToMultipleAccounts ?? false;
    const cardProgramsUsingCustomAccountsCount = Object.keys(rilletConfig?.export?.cardProgramAccounts ?? {}).length;
    const cardProgramsOfflineFeedbackKeys = Object.values(cardFeeds ?? {}).map((program) => `${CONST.RILLET_CONFIG.CARD_PROGRAM_ACCOUNT_PREFIX}${program.feed}`);
    const cardsUsingCustomAccountsCount = getCardsUsingCustomExportCount(cardFeeds ?? {}, cardList ?? {}, CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_RILLET_EXPORT_ACCOUNT);

    const {isAccordionExpanded: isExportToMultipleAccountsAccordionExpanded, shouldAnimateAccordionSection: shouldAnimateExportToMultipleAccountsAccordionSection} =
        useAccordionAnimation(exportToMultipleAccounts);

    return (
        <ConnectionLayout
            displayName="RilletExportPage"
            headerTitle="workspace.accounting.export"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.RILLET}
            shouldBeBlocked
        >
            <View>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.rillet.exportDescription')}</Text>
            </View>
            <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.RILLET_CONFIG.EXPORTER], rilletConfig?.pendingFields)}>
                <MenuItemWithTopDescription
                    title={exporter}
                    description={translate('workspace.accounting.preferredExporter')}
                    onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_RILLET_PREFERRED_EXPORTER.getRoute(policyID)) : undefined)}
                    shouldShowRightIcon
                    brickRoadIndicator={areSettingsInErrorFields([CONST.RILLET_CONFIG.EXPORTER], rilletConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                />
            </OfflineWithFeedback>
            <View style={[styles.mv3, styles.mh5, styles.borderTop]} />
            <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.RILLET_CONFIG.REIMBURSABLE], rilletConfig?.pendingFields)}>
                <MenuItemWithTopDescription
                    title={translate(`workspace.rillet.exportReimbursable.values.${exportReimbursable}.label`)}
                    description={translate('workspace.rillet.exportReimbursable.label')}
                    onPress={() => {}}
                    interactive={false}
                    brickRoadIndicator={areSettingsInErrorFields([CONST.RILLET_CONFIG.REIMBURSABLE], rilletConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                />
            </OfflineWithFeedback>
            <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.RILLET_CONFIG.EXPORT_DATE], rilletConfig?.pendingFields)}>
                <MenuItemWithTopDescription
                    title={translate(`workspace.rillet.exportDate.values.${exportDate}.label`)}
                    description={translate('workspace.rillet.exportDate.label')}
                    onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_RILLET_VENDOR_BILL_DATE.getRoute(policyID)) : undefined)}
                    shouldShowRightIcon
                    brickRoadIndicator={areSettingsInErrorFields([CONST.RILLET_CONFIG.EXPORT_DATE], rilletConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                />
            </OfflineWithFeedback>
            <View style={[styles.mv3, styles.mh5, styles.borderTop]} />
            <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.RILLET_CONFIG.COMPANY_CARD], rilletConfig?.pendingFields)}>
                <MenuItemWithTopDescription
                    title={translate(`workspace.rillet.exportCompanyCard.values.${exportCompanyCard}.label`)}
                    description={translate('workspace.rillet.exportCompanyCard.label')}
                    onPress={() => {}}
                    interactive={false}
                    brickRoadIndicator={areSettingsInErrorFields([CONST.RILLET_CONFIG.COMPANY_CARD], rilletConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                />
            </OfflineWithFeedback>
            <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.RILLET_CONFIG.DEFAULT_VENDORID], rilletConfig?.pendingFields)}>
                <MenuItemWithTopDescription
                    title={defaultCompanyCardVendor?.name}
                    description={translate('workspace.rillet.defaultCompanyCardVendor.label')}
                    onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_RILLET_DEFAULT_COMPANY_CARD_VENDOR.getRoute(policyID)) : undefined)}
                    shouldShowRightIcon
                    brickRoadIndicator={areSettingsInErrorFields([CONST.RILLET_CONFIG.DEFAULT_VENDORID], rilletConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                />
            </OfflineWithFeedback>
            <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.RILLET_CONFIG.CREDIT_CARD_ACCOUNTCODE], rilletConfig?.pendingFields)}>
                <MenuItemWithTopDescription
                    title={companyCardAccount ? `${companyCardAccount?.code} ${companyCardAccount?.name}` : undefined}
                    description={translate('workspace.rillet.companyCardAccount.label')}
                    onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_RILLET_COMPANY_CARD_ACCOUNT.getRoute(policyID)) : undefined)}
                    shouldShowRightIcon
                    brickRoadIndicator={
                        areSettingsInErrorFields([CONST.RILLET_CONFIG.CREDIT_CARD_ACCOUNTCODE], rilletConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined
                    }
                />
            </OfflineWithFeedback>
            {Object.keys(cardFeeds ?? {}).length > 0 && (
                <>
                    <ToggleSettingOptionRow
                        title={translate('workspace.rillet.exportToMultipleAccounts')}
                        switchAccessibilityLabel={translate('workspace.rillet.exportToMultipleAccounts')}
                        shouldPlaceSubtitleBelowSwitch
                        wrapperStyle={[styles.mv3, styles.mh5]}
                        isActive={exportToMultipleAccounts}
                        onToggle={() => policyID && updateRilletExportToMultipleAccounts(policyID, !exportToMultipleAccounts, exportToMultipleAccounts)}
                        pendingAction={settingsPendingAction([CONST.RILLET_CONFIG.EXPORT_TO_MULTIPLE_ACCOUNTS], rilletConfig?.pendingFields)}
                        errors={getLatestErrorField(rilletConfig ?? {}, CONST.RILLET_CONFIG.EXPORT_TO_MULTIPLE_ACCOUNTS)}
                        onCloseError={() => policyID && clearRilletErrorField(policyID, CONST.RILLET_CONFIG.EXPORT_TO_MULTIPLE_ACCOUNTS)}
                    />
                    <Accordion
                        isExpanded={isExportToMultipleAccountsAccordionExpanded}
                        isToggleTriggered={shouldAnimateExportToMultipleAccountsAccordionSection}
                    >
                        <OfflineWithFeedback pendingAction={settingsPendingAction(cardProgramsOfflineFeedbackKeys, rilletConfig?.pendingFields)}>
                            <MenuItemWithTopDescription
                                title={translate('workspace.rillet.cardProgramAccount.countInfo', cardProgramsUsingCustomAccountsCount)}
                                description={translate('workspace.rillet.cardProgramAccount.label')}
                                onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_RILLET_CARD_PROGRAM_ACCOUNT.getRoute(policyID)) : undefined)}
                                shouldShowRightIcon
                                brickRoadIndicator={
                                    areSettingsInErrorFields(cardProgramsOfflineFeedbackKeys, rilletConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined
                                }
                            />
                        </OfflineWithFeedback>
                        <OfflineWithFeedback
                            pendingAction={getCardsCustomExportPendingAction(cardFeeds ?? {}, cardList ?? {}, CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_RILLET_EXPORT_ACCOUNT)}
                        >
                            <MenuItemWithTopDescription
                                title={translate('workspace.rillet.cardAccount.countInfo', cardsUsingCustomAccountsCount.totalCount)}
                                description={translate('workspace.rillet.cardAccount.label')}
                                onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_RILLET_CARD_ACCOUNT.getRoute(policyID)) : undefined)}
                                shouldShowRightIcon
                                brickRoadIndicator={
                                    areCardsCustomExportInErrorFields(cardFeeds ?? {}, cardList ?? {}, CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_RILLET_EXPORT_ACCOUNT)
                                        ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR
                                        : undefined
                                }
                            />
                        </OfflineWithFeedback>
                    </Accordion>
                </>
            )}
        </ConnectionLayout>
    );
}

export default withPolicyConnections(RilletExportPage);
