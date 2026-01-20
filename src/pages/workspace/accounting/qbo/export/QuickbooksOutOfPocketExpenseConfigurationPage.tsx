import {useRoute} from '@react-navigation/native';
import React, {useMemo} from 'react';
import type {ValueOf} from 'type-fest';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {shouldShowQBOReimbursableExportDestinationAccountError} from '@libs/actions/connections/QuickbooksOnline';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';

type QBOSectionType = {
    title?: string;
    description?: string;
    onPress: () => void;
    errorText?: string;
    hintText?: string;
    subscribedSettings: string[];
    pendingAction?: PendingAction;
    errors?: Errors;
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
};
const account = [CONST.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT];
const accountOrExportDestination = [CONST.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION, CONST.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT];

function QuickbooksOutOfPocketExpenseConfigurationPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const qboConfig = policy?.connections?.quickbooksOnline?.config;
    const isLocationEnabled = !!(qboConfig?.syncLocations && qboConfig?.syncLocations !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE);
    const isTaxesEnabled = !!qboConfig?.syncTax;
    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES>>();
    const backTo = route.params?.backTo;

    const [exportHintText, accountDescription] = useMemo(() => {
        let hintText: string | undefined;
        let description: string | undefined;
        switch (qboConfig?.reimbursableExpensesExportDestination) {
            case CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK:
                hintText = isLocationEnabled ? undefined : translate('workspace.qbo.exportCheckDescription');
                description = translate('workspace.qbo.bankAccount');
                break;
            case CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY:
                hintText = isTaxesEnabled ? undefined : translate('workspace.qbo.exportJournalEntryDescription');
                description = translate('workspace.qbo.account');
                break;
            case CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL:
                hintText = isLocationEnabled ? undefined : translate('workspace.qbo.exportVendorBillDescription');
                description = translate('workspace.qbo.accountsPayable');
                break;
            default:
                description = translate('workspace.qbo.account');
                break;
        }

        return [hintText, description];
    }, [translate, qboConfig?.reimbursableExpensesExportDestination, isLocationEnabled, isTaxesEnabled]);

    const sections: QBOSectionType[] = [
        {
            title: qboConfig?.reimbursableExpensesExportDestination ? translate(`workspace.qbo.accounts.${qboConfig?.reimbursableExpensesExportDestination}`) : undefined,
            description: translate('workspace.accounting.exportAs'),
            onPress: () => {
                if (!policyID) {
                    return;
                }
                Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_SELECT.getRoute(policyID, Navigation.getActiveRoute()));
            },
            hintText: exportHintText,
            subscribedSettings: accountOrExportDestination,
            pendingAction: settingsPendingAction(accountOrExportDestination, qboConfig?.pendingFields),
            brickRoadIndicator: areSettingsInErrorFields(accountOrExportDestination, qboConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
        },
        {
            title: qboConfig?.reimbursableExpensesAccount?.name,
            description: accountDescription,
            onPress: () => {
                if (!policyID) {
                    return;
                }
                Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_ACCOUNT_SELECT.getRoute(policyID, Navigation.getActiveRoute()));
            },
            subscribedSettings: account,
            pendingAction: settingsPendingAction(account, qboConfig?.pendingFields),
            brickRoadIndicator: areSettingsInErrorFields(account, qboConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            errors:
                shouldShowQBOReimbursableExportDestinationAccountError(policy) && qboConfig?.reimbursableExpensesExportDestination
                    ? {
                          [CONST.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION]: translate(
                              `workspace.qbo.exportDestinationAccountsMisconfigurationError.${qboConfig.reimbursableExpensesExportDestination}`,
                          ),
                      }
                    : undefined,
        },
    ];

    return (
        <ConnectionLayout
            displayName="QuickbooksOutOfPocketExpenseConfigurationPage"
            headerTitle="workspace.accounting.exportOutOfPocket"
            title="workspace.qbo.exportOutOfPocketExpensesDescription"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO}
            onBackButtonPress={() => Navigation.goBack(backTo ?? ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT.getRoute(policyID))}
        >
            {sections.map((section, index) => (
                <OfflineWithFeedback
                    pendingAction={section.pendingAction}
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    errors={section.errors}
                    errorRowStyles={[styles.ph5]}
                >
                    <MenuItemWithTopDescription
                        title={section.title}
                        description={section.description}
                        onPress={section.onPress}
                        shouldShowRightIcon
                        brickRoadIndicator={section.brickRoadIndicator}
                        hintText={section.hintText}
                    />
                </OfflineWithFeedback>
            ))}
        </ConnectionLayout>
    );
}

export default withPolicyConnections(QuickbooksOutOfPocketExpenseConfigurationPage);
