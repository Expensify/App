import {useRoute} from '@react-navigation/native';
import {isEmpty} from 'lodash';
import React, {useMemo} from 'react';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {MenuItemProps} from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {OfflineWithFeedbackProps} from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Errors} from '@src/types/onyx/OnyxCommon';

type MenuItem = MenuItemProps & {
    pendingAction?: OfflineWithFeedbackProps['pendingAction'];

    shouldHide?: boolean;

    /** Any error message to show */
    errors?: Errors;

    /** Callback to close the error messages */
    onCloseError?: () => void;
};

type RouteParams = {
    expenseType: ValueOf<typeof CONST.NETSUITE_EXPENSE_TYPE>;
};

function NetSuiteExportExpensesPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const route = useRoute();
    const params = route.params as RouteParams;
    const isReimbursable = params.expenseType === CONST.NETSUITE_EXPENSE_TYPE.REIMBURSABLE;

    const config = policy?.connections?.netsuite?.options.config;

    const exportDestination = isReimbursable ? config?.reimbursableExpensesExportDestination : config?.nonreimbursableExpensesExportDestination;
    const exportDestinationError = isReimbursable ? config?.errorFields?.reimbursableExpensesExportDestination : config?.errorFields?.nonreimbursableExpensesExportDestination;
    const exportDestinationPending = isReimbursable ? config?.pendingFields?.reimbursableExpensesExportDestination : config?.pendingFields?.nonreimbursableExpensesExportDestination;
    const helperTextType = isReimbursable ? 'reimbursableDescription' : 'nonReimbursableDescription';
    const configType = isReimbursable ? CONST.NETSUITE_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION : CONST.NETSUITE_CONFIG.NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION;

    const {vendors, payableList} = policy?.connections?.netsuite?.options?.data ?? {};

    const defaultVendor = useMemo(() => {
        const selectedVendor = (vendors ?? []).find((vendor) => vendor.id === config?.defaultVendor);
        return selectedVendor;
    }, [vendors, config?.defaultVendor]);

    const selectedPayableAccount = useMemo(() => {
        const selectedPayableAcc = (payableList ?? []).find((payableAccount) => payableAccount.id === config?.payableAcct);
        return selectedPayableAcc;
    }, [payableList, config?.payableAcct]);

    const selectedReimbursablePayableAccount = useMemo(() => {
        const selectedPayableAcc = (payableList ?? []).find((payableAccount) => payableAccount.id === config?.reimbursablePayableAccount);
        return selectedPayableAcc;
    }, [payableList, config?.reimbursablePayableAccount]);

    const isConnectionEmpty = isEmpty(policy?.connections?.netsuite);

    const menuItems: MenuItem[] = [
        {
            description: translate('workspace.netsuite.exportAs'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_DESTINATION_SELECT.getRoute(policyID, params.expenseType)),
            brickRoadIndicator: exportDestinationError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: exportDestination ? translate(`workspace.netsuite.exportDestination.values.${exportDestination}.label`) : undefined,
            pendingAction: exportDestinationPending,
            errors: ErrorUtils.getLatestErrorField(config, configType),
            onCloseError: () => Policy.clearNetSuiteErrorField(policyID, configType),
            helperText: exportDestination ? translate(`workspace.netsuite.exportDestination.values.${exportDestination}.${helperTextType}`) : undefined,
            shouldParseHelperText: true,
        },
        {
            description: translate('workspace.netsuite.defaultVendor'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_VENDOR_SELECT.getRoute(policyID, params.expenseType)),
            brickRoadIndicator: config?.errorFields?.defaultVendor ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: defaultVendor ? defaultVendor.name : undefined,
            pendingAction: config?.pendingFields?.defaultVendor,
            errors: ErrorUtils.getLatestErrorField(config, CONST.NETSUITE_CONFIG.DEFAULT_VENDOR),
            onCloseError: () => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.DEFAULT_VENDOR),
            shouldHide: isReimbursable || exportDestination !== CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL,
        },
        {
            description: translate('workspace.netsuite.nonReimbursableJournalPostingAccount'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_PAYABLE_ACCOUNT_SELECT.getRoute(policyID, params.expenseType)),
            brickRoadIndicator: config?.errorFields?.payableAcct ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: selectedPayableAccount ? selectedPayableAccount.name : undefined,
            pendingAction: config?.pendingFields?.payableAcct,
            errors: ErrorUtils.getLatestErrorField(config, CONST.NETSUITE_CONFIG.PAYABLE_ACCT),
            onCloseError: () => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.PAYABLE_ACCT),
            shouldHide: isReimbursable || exportDestination !== CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY,
        },
        {
            description: translate('workspace.netsuite.reimbursableJournalPostingAccount'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_PAYABLE_ACCOUNT_SELECT.getRoute(policyID, params.expenseType)),
            brickRoadIndicator: config?.errorFields?.reimbursablePayableAccount ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: selectedReimbursablePayableAccount ? selectedReimbursablePayableAccount.name : undefined,
            pendingAction: config?.pendingFields?.reimbursablePayableAccount,
            errors: ErrorUtils.getLatestErrorField(config, CONST.NETSUITE_CONFIG.REIMBURSABLE_PAYABLE_ACCOUNT),
            onCloseError: () => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.REIMBURSABLE_PAYABLE_ACCOUNT),
            shouldHide: !isReimbursable || exportDestination !== CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY,
        },
        {
            description: translate('workspace.netsuite.journalPostingPreference.label'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_JOURNAL_POSTING_PREFERENCE_SELECT.getRoute(policyID, params.expenseType)),
            brickRoadIndicator: config?.errorFields?.journalPostingPreference ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: config?.journalPostingPreference ? translate(`workspace.netsuite.journalPostingPreference.values.${config.journalPostingPreference}`) : undefined,
            pendingAction: config?.pendingFields?.journalPostingPreference,
            errors: ErrorUtils.getLatestErrorField(config, CONST.NETSUITE_CONFIG.JOURNAL_POSTING_PREFERENCE),
            onCloseError: () => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.JOURNAL_POSTING_PREFERENCE),
            shouldHide: exportDestination !== CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY,
        },
    ];

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            shouldBeBlocked={isConnectionEmpty}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                testID={NetSuiteExportExpensesPage.displayName}
            >
                <HeaderWithBackButton
                    title={isReimbursable ? translate('workspace.netsuite.exportReimbursable') : translate('workspace.netsuite.exportNonReimbursable')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT.getRoute(policyID))}
                />
                {menuItems
                    .filter((item) => !item.shouldHide)
                    .map((item) => (
                        <OfflineWithFeedback
                            key={item.description}
                            pendingAction={item.pendingAction}
                            errors={item.errors}
                            onClose={item.onCloseError}
                            errorRowStyles={[styles.ph5]}
                        >
                            <MenuItemWithTopDescription
                                title={item.title}
                                interactive={item?.interactive ?? true}
                                description={item.description}
                                shouldShowRightIcon={item?.shouldShowRightIcon ?? true}
                                onPress={item?.onPress}
                                brickRoadIndicator={item?.brickRoadIndicator}
                                helperText={item?.helperText}
                                errorText={item?.errorText}
                                shouldParseHelperText={item.shouldParseHelperText ?? false}
                            />
                        </OfflineWithFeedback>
                    ))}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

NetSuiteExportExpensesPage.displayName = 'NetSuiteExportExpensesPage';

export default withPolicyConnections(NetSuiteExportExpensesPage);
