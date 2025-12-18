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
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';
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

function SageIntacctReimbursableExpensesPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const policyID = policy?.id;
    const styles = useThemeStyles();
    const {data: intacctData, config} = policy?.connections?.intacct ?? {};
    const {reimbursable, reimbursableExpenseReportDefaultVendor} = policy?.connections?.intacct?.config?.export ?? {};
    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_REIMBURSABLE_EXPENSES>>();
    const backTo = route.params?.backTo;

    const defaultVendorName = getDefaultVendorName(reimbursableExpenseReportDefaultVendor, intacctData?.vendors);

    const expandedCondition = !(reimbursable !== CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT || !reimbursableExpenseReportDefaultVendor);
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
            title: reimbursable ? translate(`workspace.sageIntacct.reimbursableExpenses.values.${reimbursable}`) : undefined,
            description: translate('workspace.accounting.exportAs'),
            onPress: () => {
                if (!policyID) {
                    return;
                }
                Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_REIMBURSABLE_DESTINATION.getRoute(policyID, Navigation.getActiveRoute()));
            },
            subscribedSettings: [CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE],
        },
        {
            type: 'toggle',
            title: translate('workspace.sageIntacct.defaultVendor'),
            key: 'Default vendor toggle',
            subtitle: translate('workspace.sageIntacct.defaultVendorDescription', true),
            shouldPlaceSubtitleBelowSwitch: true,
            isActive: !!config?.export.reimbursableExpenseReportDefaultVendor,
            switchAccessibilityLabel: translate('workspace.sageIntacct.defaultVendor'),
            onToggle: (enabled) => {
                if (!policyID) {
                    return;
                }
                const vendor = enabled ? policy?.connections?.intacct?.data?.vendors?.[0].id : '';
                updateSageIntacctDefaultVendor(policyID, CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE_VENDOR, vendor ?? '', config?.export.reimbursableExpenseReportDefaultVendor);
                isAccordionExpanded.set(enabled);
                shouldAnimateAccordionSection.set(true);
            },
            onCloseError: () => clearSageIntacctErrorField(policyID, CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE_VENDOR),
            pendingAction: settingsPendingAction([CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE_VENDOR], config?.pendingFields),
            errors: getLatestErrorField(config, CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE_VENDOR),
            shouldHide: reimbursable !== CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT,
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
                        Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_DEFAULT_VENDOR.getRoute(policyID, CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE, Navigation.getActiveRoute()));
                    },
                    subscribedSettings: [CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE_VENDOR],
                    shouldHide: reimbursable !== CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT || !reimbursableExpenseReportDefaultVendor,
                },
            ],
            shouldHide: false,
            shouldExpand: isAccordionExpanded,
            shouldAnimateSection: shouldAnimateAccordionSection,
        },
    ];

    return (
        <ConnectionLayout
            displayName="SageIntacctReimbursableExpensesPage"
            headerTitle="workspace.accounting.exportOutOfPocket"
            title="workspace.sageIntacct.reimbursableExpenses.description"
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
                                    isToggleTriggered={shouldAnimateAccordionSection}
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

export default withPolicyConnections(SageIntacctReimbursableExpensesPage);
