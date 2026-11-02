import Accordion from '@components/Accordion';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Text from '@components/Text';

import useAccordionAnimation from '@hooks/useAccordionAnimation';
import useCardFeeds from '@hooks/useCardFeeds';
import useCardsLists from '@hooks/useCardsLists';
import useIsUnifiedConnectionsBetaEnabled from '@hooks/useIsUnifiedConnectionsBetaEnabled';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearBusinessCentralErrorField, updateBusinessCentralExportToMultipleAccounts} from '@libs/actions/connections/BusinessCentral';
import {areCardsCustomExportInErrorFields, findMatchingCards, getCardsCustomExportPendingAction, getCardsUsingCustomExportCount} from '@libs/CardFeedUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';

import {getAccountingSettingsRoute} from '@pages/workspace/connections/utils';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type {BusinessCentralExport} from '@src/types/onyx/Policy';

import type {ReactNode} from 'react';

import React from 'react';
import {View} from 'react-native';

type ExportRow = {
    settingName: keyof BusinessCentralExport;
    label: string;
    value: string | undefined;
    route: Route;
    shouldHide?: boolean;

    /** Rendered right below the row */
    footer?: ReactNode;
};

function BusinessCentralExportPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const isUnifiedConnectionsBetaEnabled = useIsUnifiedConnectionsBetaEnabled();
    const [cardFeeds] = useCardFeeds(policyID);
    const [cardLists] = useCardsLists();
    const businessCentralConfig = policy?.connections?.businessCentral?.config;
    const businessCentralData = policy?.connections?.businessCentral?.data;
    const exportConfig = businessCentralConfig?.export;

    // We use the logical OR (||) here instead of ?? because `exporter` could be an empty string on a fresh connection
    const exporter = exportConfig?.exporter || policy?.owner;
    const exportDate = exportConfig?.exportDate ?? CONST.BUSINESS_CENTRAL_EXPORT_DATE.LAST_EXPENSE;
    const reimbursable = exportConfig?.reimbursable ?? CONST.BUSINESS_CENTRAL_EXPORT_DESTINATION.JOURNAL_ENTRY;
    const nonReimbursable = exportConfig?.nonReimbursable ?? CONST.BUSINESS_CENTRAL_EXPORT_DESTINATION.PURCHASE_INVOICE;
    const reimbursableAccount = businessCentralData?.bankAccounts?.find((bankAccount) => bankAccount.id === exportConfig?.reimbursableAccount);
    const nonReimbursableAccount = businessCentralData?.bankAccounts?.find((bankAccount) => bankAccount.id === exportConfig?.nonReimbursableAccount);
    const defaultVendor = businessCentralData?.vendors?.find((vendor) => vendor.id === exportConfig?.defaultVendorID);
    const paymentMethod = businessCentralData?.paymentMethods?.find((method) => method.code === exportConfig?.paymentMethodCode);
    const isReimbursableJournalEntry = reimbursable === CONST.BUSINESS_CENTRAL_EXPORT_DESTINATION.JOURNAL_ENTRY;
    const isNonReimbursableJournalEntry = nonReimbursable === CONST.BUSINESS_CENTRAL_EXPORT_DESTINATION.JOURNAL_ENTRY;
    const exportToMultipleAccounts = exportConfig?.exportToMultipleAccounts ?? false;
    const cardProgramsUsingCustomAccountsCount = Object.values(cardFeeds ?? {}).filter(
        (cardFeed) => !!exportConfig?.cardProgramAccounts?.[cardFeed.feed] && findMatchingCards(cardFeeds ?? {}, cardLists, cardFeed.feed).length > 0,
    ).length;
    const cardProgramsOfflineFeedbackKeys = Object.values(cardFeeds ?? {}).map((program) => `${CONST.BUSINESS_CENTRAL_CONFIG.CARD_PROGRAM_ACCOUNT_PREFIX}${program.feed}`);
    const cardsUsingCustomAccountsCount = getCardsUsingCustomExportCount(cardFeeds ?? {}, cardLists, CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_BUSINESS_CENTRAL_EXPORT_ACCOUNT);
    const hasActiveCards = findMatchingCards(cardFeeds ?? {}, cardLists).length > 0;

    const {isAccordionExpanded: isExportToMultipleAccountsAccordionExpanded, shouldAnimateAccordionSection: shouldAnimateExportToMultipleAccountsAccordionSection} =
        useAccordionAnimation(exportToMultipleAccounts);

    if (!policyID) {
        return null;
    }

    // The backend only reads these overrides when it settles company card journal entries
    const multipleAccountsSection = isNonReimbursableJournalEntry && hasActiveCards && (
        <>
            <ToggleSettingOptionRow
                title={translate('workspace.businessCentral.exportToMultipleAccounts')}
                switchAccessibilityLabel={translate('workspace.businessCentral.exportToMultipleAccounts')}
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive={exportToMultipleAccounts}
                onToggle={() => updateBusinessCentralExportToMultipleAccounts(policyID, !exportToMultipleAccounts, exportToMultipleAccounts)}
                pendingAction={settingsPendingAction([CONST.BUSINESS_CENTRAL_CONFIG.EXPORT_TO_MULTIPLE_ACCOUNTS], businessCentralConfig?.pendingFields)}
                errors={getLatestErrorField(businessCentralConfig ?? {}, CONST.BUSINESS_CENTRAL_CONFIG.EXPORT_TO_MULTIPLE_ACCOUNTS)}
                onCloseError={() => clearBusinessCentralErrorField(policyID, CONST.BUSINESS_CENTRAL_CONFIG.EXPORT_TO_MULTIPLE_ACCOUNTS)}
            />
            <Accordion
                isExpanded={isExportToMultipleAccountsAccordionExpanded}
                isToggleTriggered={shouldAnimateExportToMultipleAccountsAccordionSection}
            >
                <OfflineWithFeedback pendingAction={settingsPendingAction(cardProgramsOfflineFeedbackKeys, businessCentralConfig?.pendingFields)}>
                    <MenuItemField
                        name={translate('workspace.businessCentral.cardProgramAccount.label')}
                        onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_BUSINESS_CENTRAL_CARD_PROGRAM_ACCOUNT.getRoute(policyID))}
                        value={translate('workspace.businessCentral.cardProgramAccount.countInfo', {count: cardProgramsUsingCustomAccountsCount})}
                    >
                        {areSettingsInErrorFields(cardProgramsOfflineFeedbackKeys, businessCentralConfig?.errorFields) && (
                            <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                        )}
                    </MenuItemField>
                </OfflineWithFeedback>
                <OfflineWithFeedback pendingAction={getCardsCustomExportPendingAction(cardFeeds ?? {}, cardLists, CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_BUSINESS_CENTRAL_EXPORT_ACCOUNT)}>
                    <MenuItemField
                        name={translate('workspace.businessCentral.cardAccount.label')}
                        onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_BUSINESS_CENTRAL_CARD_ACCOUNT.getRoute(policyID))}
                        value={translate('workspace.businessCentral.cardAccount.countInfo', {count: cardsUsingCustomAccountsCount.totalCount})}
                    >
                        {areCardsCustomExportInErrorFields(cardFeeds ?? {}, cardLists, CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_BUSINESS_CENTRAL_EXPORT_ACCOUNT) && (
                            <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                        )}
                    </MenuItemField>
                </OfflineWithFeedback>
            </Accordion>
        </>
    );

    const sections: ExportRow[][] = [
        [
            {
                settingName: CONST.BUSINESS_CENTRAL_CONFIG.EXPORTER,
                label: translate('workspace.accounting.preferredExporter'),
                value: exporter,
                route: ROUTES.POLICY_ACCOUNTING_BUSINESS_CENTRAL_EXPORT_PREFERRED_EXPORTER.getRoute(policyID),
            },
            {
                settingName: CONST.BUSINESS_CENTRAL_CONFIG.EXPORT_DATE,
                label: translate('workspace.businessCentral.exportDate.label'),
                value: translate(`workspace.businessCentral.exportDate.values.${exportDate}.label`),
                route: ROUTES.POLICY_ACCOUNTING_BUSINESS_CENTRAL_EXPORT_DATE.getRoute(policyID),
            },
        ],
        [
            {
                settingName: CONST.BUSINESS_CENTRAL_CONFIG.REIMBURSABLE,
                label: translate('workspace.businessCentral.exportReimbursable'),
                value: translate(`workspace.businessCentral.exportDestination.${reimbursable}`),
                route: ROUTES.POLICY_ACCOUNTING_BUSINESS_CENTRAL_EXPORT_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION.getRoute(policyID),
            },
            {
                settingName: CONST.BUSINESS_CENTRAL_CONFIG.REIMBURSABLE_ACCOUNT,
                label: translate('workspace.businessCentral.reimbursableAccount.label'),
                value: reimbursableAccount ? `${reimbursableAccount.number} ${reimbursableAccount.name}` : undefined,
                route: ROUTES.POLICY_ACCOUNTING_BUSINESS_CENTRAL_EXPORT_REIMBURSABLE_ACCOUNT.getRoute(policyID),
                shouldHide: !isReimbursableJournalEntry,
            },
        ],
        [
            {
                settingName: CONST.BUSINESS_CENTRAL_CONFIG.NON_REIMBURSABLE,
                label: translate('workspace.businessCentral.exportNonReimbursable'),
                value: translate(`workspace.businessCentral.exportDestination.${nonReimbursable}`),
                route: ROUTES.POLICY_ACCOUNTING_BUSINESS_CENTRAL_EXPORT_NONREIMBURSABLE_EXPENSES_EXPORT_DESTINATION.getRoute(policyID),
            },
            {
                settingName: CONST.BUSINESS_CENTRAL_CONFIG.DEFAULT_VENDOR_ID,
                label: translate('workspace.businessCentral.defaultCompanyCardVendor.label'),
                value: defaultVendor?.name,
                route: ROUTES.POLICY_ACCOUNTING_BUSINESS_CENTRAL_EXPORT_DEFAULT_VENDOR.getRoute(policyID),
            },
            {
                settingName: CONST.BUSINESS_CENTRAL_CONFIG.NON_REIMBURSABLE_ACCOUNT,
                label: translate('workspace.businessCentral.companyCardAccount.label'),
                value: nonReimbursableAccount ? `${nonReimbursableAccount.number} ${nonReimbursableAccount.name}` : undefined,
                route: ROUTES.POLICY_ACCOUNTING_BUSINESS_CENTRAL_EXPORT_COMPANY_CARD_ACCOUNT.getRoute(policyID),
                shouldHide: !isNonReimbursableJournalEntry,
                footer: multipleAccountsSection,
            },
            {
                settingName: CONST.BUSINESS_CENTRAL_CONFIG.PAYMENT_METHOD_CODE,
                label: translate('workspace.businessCentral.paymentMethod.label'),
                value: paymentMethod?.displayName,
                route: ROUTES.POLICY_ACCOUNTING_BUSINESS_CENTRAL_EXPORT_PAYMENT_METHOD.getRoute(policyID),
                shouldHide: isReimbursableJournalEntry && isNonReimbursableJournalEntry,
            },
        ],
    ];

    return (
        <ConnectionLayout
            onBackButtonPress={() => Navigation.goBack(getAccountingSettingsRoute(isUnifiedConnectionsBetaEnabled, policyID))}
            displayName="BusinessCentralExportPage"
            headerTitle="workspace.accounting.export"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL}
            shouldBeBlocked
        >
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.businessCentral.exportDescription')}</Text>
            {sections.map((rows, sectionIndex) => (
                <View key={rows.at(0)?.settingName}>
                    {sectionIndex > 0 && <View style={[styles.mv3, styles.mh5, styles.borderTop]} />}
                    {rows
                        .filter((row) => !row.shouldHide)
                        .map((row) => (
                            <React.Fragment key={row.settingName}>
                                <OfflineWithFeedback pendingAction={settingsPendingAction([row.settingName], businessCentralConfig?.pendingFields)}>
                                    <MenuItemField
                                        name={row.label}
                                        value={row.value}
                                        onPress={() => Navigation.navigate(row.route)}
                                    >
                                        {areSettingsInErrorFields([row.settingName], businessCentralConfig?.errorFields) && (
                                            <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                                        )}
                                    </MenuItemField>
                                </OfflineWithFeedback>
                                {row.footer}
                            </React.Fragment>
                        ))}
                </View>
            ))}
        </ConnectionLayout>
    );
}

export default withPolicyConnections(BusinessCentralExportPage);
