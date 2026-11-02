import {useRoute} from '@react-navigation/native';
import React, {useCallback} from 'react';
import type {ValueOf} from 'type-fest';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import type {SelectorType} from '@components/SelectionScreen';
import useConfirmModal from '@hooks/useConfirmModal';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateNetSuiteNonReimbursableExpensesExportDestination, updateNetSuiteReimbursableExpensesExportDestination} from '@libs/actions/connections/NetSuiteCommands';
import {getLatestErrorField} from '@libs/ErrorUtils';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import {exportExpensesDestinationSettingName} from '@pages/workspace/accounting/netsuite/utils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import {clearNetSuiteErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type MenuListItem = ListItem & {
    value: ValueOf<typeof CONST.NETSUITE_EXPORT_DESTINATION>;
};

function DynamicNetSuiteExportExpensesDestinationSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {showConfirmModal} = useConfirmModal();
    const policyID = policy?.id;
    const config = policy?.connections?.netsuite?.options.config;

    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_NETSUITE_EXPORT_EXPENSES_DESTINATION_SELECT>>();
    const params = route.params;
    const isReimbursable = params.expenseType === CONST.NETSUITE_EXPENSE_TYPE.REIMBURSABLE;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_DESTINATION_SELECT.path);

    const currentSettingName = exportExpensesDestinationSettingName(isReimbursable);
    const currentDestination = config?.[currentSettingName];

    const data: MenuListItem[] = Object.values(CONST.NETSUITE_EXPORT_DESTINATION).map((dateType) => ({
        value: dateType,
        text: translate(`workspace.netsuite.exportDestination.values.${dateType}.label`),
        keyForList: dateType,
        isSelected: currentDestination === dateType,
    }));

    const goBack = useCallback(() => {
        Navigation.goBack(backPath);
    }, [backPath]);

    const applyDestination = useCallback(
        (value: ValueOf<typeof CONST.NETSUITE_EXPORT_DESTINATION>) => {
            if (!policyID) {
                return;
            }
            if (isReimbursable) {
                updateNetSuiteReimbursableExpensesExportDestination(policyID, value, currentDestination ?? CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT);
            } else {
                updateNetSuiteNonReimbursableExpensesExportDestination(policyID, value, currentDestination ?? CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL);
            }
            goBack();
        },
        [currentDestination, isReimbursable, policyID, goBack],
    );

    const selectDestination = useCallback(
        async (row: MenuListItem) => {
            if (row.value === currentDestination || !policyID) {
                goBack();
                return;
            }

            if (!isReimbursable && row.value === CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT && policy?.areCompanyCardsEnabled) {
                const {action} = await showConfirmModal({
                    title: translate('common.areYouSure'),
                    prompt: translate('workspace.netsuite.exportDestination.expenseReportDestinationConfirmDescription'),
                    confirmText: translate('common.confirm'),
                    cancelText: translate('common.cancel'),
                });
                if (action === ModalActions.CONFIRM) {
                    applyDestination(row.value);
                }
                return;
            }

            applyDestination(row.value);
        },
        [currentDestination, isReimbursable, policyID, goBack, policy?.areCompanyCardsEnabled, showConfirmModal, translate, applyDestination],
    );

    return (
        <SelectionScreen
            displayName="DynamicNetSuiteExportExpensesDestinationSelectPage"
            title="workspace.accounting.exportAs"
            data={data}
            onSelectRow={(selection: SelectorType) => {
                selectDestination(selection as MenuListItem);
            }}
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            onBackButtonPress={goBack}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            pendingAction={settingsPendingAction([currentSettingName], config?.pendingFields)}
            errors={getLatestErrorField(config, currentSettingName)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearNetSuiteErrorField(policyID, currentSettingName)}
        />
    );
}

export default withPolicyConnections(DynamicNetSuiteExportExpensesDestinationSelectPage);
