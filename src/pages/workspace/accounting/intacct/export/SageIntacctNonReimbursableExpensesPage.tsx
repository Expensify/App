import {useRoute} from '@react-navigation/native';
import React from 'react';
import Accordion from '@components/Accordion';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useAccordionAnimation from '@hooks/useAccordionAnimation';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {areSettingsInErrorFields, getSageIntacctNonReimbursableActiveDefaultVendor, settingsPendingAction} from '@libs/PolicyUtils';
import type {ExtendedMenuItemWithSubscribedSettings, MenuItemToRender} from '@pages/workspace/accounting/intacct/types';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {updateSageIntacctDefaultVendor} from '@userActions/connections/SageIntacct';
import {clearSageIntacctErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {getDefaultVendorName} from './utils';

function SageIntacctNonReimbursableExpensesPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const policyID = policy?.id;
    const styles = useThemeStyles();
    const {data: intacctData, config} = policy?.connections?.intacct ?? {};

    const activeDefaultVendor = getSageIntacctNonReimbursableActiveDefaultVendor(policy);
    const defaultVendorName = getDefaultVendorName(activeDefaultVendor, intacctData?.vendors);
    const expandedCondition = !(
        !config?.export.nonReimbursable ||
        (config?.export.nonReimbursable === CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE && !config?.export.nonReimbursableCreditCardChargeDefaultVendor)
    );
    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES>>();
    const backTo = route.params?.backTo;

    const {isAccordionExpanded, shouldAnimateAccordionSection} = useAccordionAnimation(expandedCondition);

    const renderDefault = (item: MenuItemToRender) => {
        return (
            <OfflineWithFeedback
                key={item.description}
                pendingAction={settingsPendingAction(item.subscribedSettings, config?.pendingFields)}
            >
                <MenuItemWithTopDescription
                    key={item.title}
                    title={item.title}
                    description={item.description}
                    shouldShowRightIcon
                    onPress={item?.onPress}
                    brickRoadIndicator={areSettingsInErrorFields(item.subscribedSettings, config?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                />
            </OfflineWithFeedback>
        );
    };

    const menuItems: ExtendedMenuItemWithSubscribedSettings[] = [
        {
            type: 'menuitem',
            title: config?.export.nonReimbursable ? translate(`workspace.sageIntacct.nonReimbursableExpenses.values.${config?.export.nonReimbursable}`) : undefined,
            description: translate('workspace.accounting.exportAs'),
            onPress: () => {
                if (!policyID) {
                    return;
                }
                Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_NON_REIMBURSABLE_DESTINATION.getRoute(policyID, Navigation.getActiveRoute()));
            },
            subscribedSettings: [CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE],
        },
        {
            type: 'menuitem',
            title: config?.export.nonReimbursableAccount ? config.export.nonReimbursableAccount : undefined,
            description: translate('workspace.sageIntacct.creditCardAccount'),
            onPress: () => {
                if (!policyID) {
                    return;
                }
                Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_NON_REIMBURSABLE_CREDIT_CARD_ACCOUNT.getRoute(policyID, Navigation.getActiveRoute()));
            },
            subscribedSettings: [CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_ACCOUNT],
            shouldHide: config?.export.nonReimbursable !== CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE,
        },
        {
            type: 'toggle',
            title: translate('workspace.sageIntacct.defaultVendor'),
            key: 'Default vendor toggle',
            subtitle: translate('workspace.sageIntacct.defaultVendorDescription', false),
            shouldPlaceSubtitleBelowSwitch: true,
            isActive: !!config?.export.nonReimbursableCreditCardChargeDefaultVendor,
            switchAccessibilityLabel: translate('workspace.sageIntacct.defaultVendor'),
            onToggle: (enabled) => {
                if (!policyID) {
                    return;
                }
                const vendor = enabled ? policy?.connections?.intacct?.data?.vendors?.[0].id : '';
                updateSageIntacctDefaultVendor(
                    policyID,
                    CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_CREDIT_CARD_VENDOR,
                    vendor ?? '',
                    config?.export.nonReimbursableCreditCardChargeDefaultVendor,
                );
                isAccordionExpanded.set(enabled);
                shouldAnimateAccordionSection.set(true);
            },
            onCloseError: () => clearSageIntacctErrorField(policyID, CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_CREDIT_CARD_VENDOR),
            pendingAction: settingsPendingAction([CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_CREDIT_CARD_VENDOR], config?.pendingFields),
            errors: getLatestErrorField(config, CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_CREDIT_CARD_VENDOR),
            shouldHide: config?.export.nonReimbursable !== CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE,
        },
        {
            type: 'accordion',
            children: [
                {
                    type: 'menuitem',
                    title: defaultVendorName && defaultVendorName !== '' ? defaultVendorName : undefined,
                    description: translate('workspace.sageIntacct.defaultVendor'),
                    onPress: () => {
                        if (!policyID) {
                            return;
                        }
                        Navigation.navigate(
                            ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_DEFAULT_VENDOR.getRoute(policyID, CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE.toLowerCase(), Navigation.getActiveRoute()),
                        );
                    },
                    subscribedSettings: [
                        config?.export.nonReimbursable === CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL
                            ? CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_VENDOR
                            : CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_CREDIT_CARD_VENDOR,
                    ],
                    shouldHide:
                        !config?.export.nonReimbursable ||
                        (config?.export.nonReimbursable === CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE &&
                            !config?.export.nonReimbursableCreditCardChargeDefaultVendor),
                },
            ],
            shouldHide: false,
            shouldExpand: isAccordionExpanded,
            shouldAnimateSection: shouldAnimateAccordionSection,
        },
    ];

    return (
        <ConnectionLayout
            displayName="SageIntacctNonReimbursableExpensesPage"
            headerTitle="workspace.accounting.exportCompanyCard"
            title="workspace.sageIntacct.nonReimbursableExpenses.description"
            onBackButtonPress={() => Navigation.goBack(backTo ?? (policyID && ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT.getRoute(policyID)))}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
        >
            {menuItems
                .filter((item) => !item.shouldHide)
                .map((item) => {
                    switch (item.type) {
                        case 'toggle':
                            // eslint-disable-next-line no-case-declarations
                            const {type, shouldHide, key, ...rest} = item;
                            return (
                                <ToggleSettingOptionRow
                                    key={key}
                                    // eslint-disable-next-line react/jsx-props-no-spreading
                                    {...rest}
                                    wrapperStyle={[styles.mv3, styles.ph5]}
                                />
                            );
                        case 'accordion':
                            return (
                                <Accordion
                                    isExpanded={item.shouldExpand}
                                    isToggleTriggered={item.shouldAnimateSection}
                                >
                                    {item.children.map((child) => renderDefault(child))}
                                </Accordion>
                            );
                        default:
                            return renderDefault(item);
                    }
                })}
        </ConnectionLayout>
    );
}

export default withPolicyConnections(SageIntacctNonReimbursableExpensesPage);
