import {useRoute} from '@react-navigation/native';
import React, {useMemo} from 'react';
import Accordion from '@components/Accordion';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useAccordionAnimation from '@hooks/useAccordionAnimation';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateQuickbooksDesktopShouldAutoCreateVendor} from '@libs/actions/connections/QuickbooksDesktop';
import {getQBDNonReimbursableExportAccountType} from '@libs/ConnectionUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackRouteProp} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import {getQBDReimbursableAccounts} from '@pages/workspace/accounting/utils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {clearQBDErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

function QuickbooksDesktopCompanyCardExpenseAccountPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const qbdConfig = policy?.connections?.quickbooksDesktop?.config;
    const {vendors} = policy?.connections?.quickbooksDesktop?.data ?? {};
    const nonReimbursableBillDefaultVendorObject = vendors?.find((vendor) => vendor.id === qbdConfig?.export?.nonReimbursableBillDefaultVendor);
    const nonReimbursable = qbdConfig?.export?.nonReimbursable;
    const nonReimbursableAccount = qbdConfig?.export?.nonReimbursableAccount;
    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT>>();
    const backTo = route.params?.backTo;

    const accountName = useMemo(() => {
        const qbdReimbursableAccounts = getQBDReimbursableAccounts(policy?.connections?.quickbooksDesktop, nonReimbursable);
        // We use the logical OR (||) here instead of ?? because `nonReimbursableAccount` can be an empty string
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        return qbdReimbursableAccounts.find(({id}) => nonReimbursableAccount === id)?.name || qbdReimbursableAccounts.at(0)?.name;
    }, [policy?.connections?.quickbooksDesktop, nonReimbursable, nonReimbursableAccount]);

    const {isAccordionExpanded, shouldAnimateAccordionSection} = useAccordionAnimation(!!qbdConfig?.shouldAutoCreateVendor);

    const sections = [
        {
            title: nonReimbursable ? translate(`workspace.qbd.accounts.${nonReimbursable}`) : undefined,
            description: translate('workspace.accounting.exportAs'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_SELECT.getRoute(policyID, Navigation.getActiveRoute())),
            hintText: nonReimbursable ? translate(`workspace.qbd.accounts.${nonReimbursable}Description`) : undefined,
            subscribedSettings: [CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE],
            keyForList: translate('workspace.accounting.exportAs'),
        },
        {
            title: accountName,
            description: getQBDNonReimbursableExportAccountType(translate, nonReimbursable),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT_SELECT.getRoute(policyID, Navigation.getActiveRoute())),
            subscribedSettings: [CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_ACCOUNT],
            keyForList: getQBDNonReimbursableExportAccountType(translate, nonReimbursable),
        },
    ];

    return (
        <ConnectionLayout
            policyID={policyID}
            displayName={QuickbooksDesktopCompanyCardExpenseAccountPage.displayName}
            headerTitle="workspace.accounting.exportCompanyCard"
            title="workspace.qbd.exportCompanyCardsDescription"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBD}
            onBackButtonPress={() => Navigation.goBack(backTo ?? ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT.getRoute(policyID))}
        >
            {sections.map((section) => (
                <OfflineWithFeedback
                    key={section.keyForList}
                    pendingAction={settingsPendingAction(section.subscribedSettings, qbdConfig?.pendingFields)}
                >
                    <MenuItemWithTopDescription
                        title={section.title}
                        description={section.description}
                        onPress={section.onPress}
                        brickRoadIndicator={areSettingsInErrorFields(section.subscribedSettings, qbdConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                        shouldShowRightIcon
                        hintText={section.hintText}
                    />
                </OfflineWithFeedback>
            ))}
            {nonReimbursable === CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL && (
                <>
                    <ToggleSettingOptionRow
                        title={translate('workspace.accounting.defaultVendor')}
                        subtitle={translate('workspace.qbd.defaultVendorDescription')}
                        switchAccessibilityLabel={translate('workspace.qbd.defaultVendorDescription')}
                        shouldPlaceSubtitleBelowSwitch
                        wrapperStyle={[styles.ph5, styles.mb3, styles.mt1]}
                        isActive={!!qbdConfig?.shouldAutoCreateVendor}
                        pendingAction={settingsPendingAction(
                            [CONST.QUICKBOOKS_DESKTOP_CONFIG.SHOULD_AUTO_CREATE_VENDOR, CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE],
                            qbdConfig?.pendingFields,
                        )}
                        errors={getLatestErrorField(qbdConfig, CONST.QUICKBOOKS_DESKTOP_CONFIG.SHOULD_AUTO_CREATE_VENDOR)}
                        onToggle={(isOn) => {
                            if (!policyID) {
                                return;
                            }
                            updateQuickbooksDesktopShouldAutoCreateVendor(policyID, isOn);
                        }}
                        onCloseError={() => {
                            if (!policyID) {
                                return;
                            }
                            clearQBDErrorField(policyID, CONST.QUICKBOOKS_DESKTOP_CONFIG.SHOULD_AUTO_CREATE_VENDOR);
                        }}
                    />

                    <Accordion
                        isExpanded={isAccordionExpanded}
                        isToggleTriggered={shouldAnimateAccordionSection}
                    >
                        <OfflineWithFeedback
                            pendingAction={settingsPendingAction(
                                [CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR, CONST.QUICKBOOKS_DESKTOP_CONFIG.SHOULD_AUTO_CREATE_VENDOR],
                                qbdConfig?.pendingFields,
                            )}
                        >
                            <MenuItemWithTopDescription
                                title={nonReimbursableBillDefaultVendorObject?.name}
                                description={translate('workspace.accounting.defaultVendor')}
                                onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_DEFAULT_VENDOR_SELECT.getRoute(policyID))}
                                brickRoadIndicator={
                                    areSettingsInErrorFields([CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR], qbdConfig?.errorFields)
                                        ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR
                                        : undefined
                                }
                                shouldShowRightIcon
                            />
                        </OfflineWithFeedback>
                    </Accordion>
                </>
            )}
        </ConnectionLayout>
    );
}

QuickbooksDesktopCompanyCardExpenseAccountPage.displayName = 'QuickbooksDesktopCompanyCardExpenseAccountPage';

export default withPolicyConnections(QuickbooksDesktopCompanyCardExpenseAccountPage);
