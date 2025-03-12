import React, {useMemo} from 'react';
import {View} from 'react-native';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {NSQSPaymentAccount} from '@src/types/onyx/Policy';

function NSQSExportPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const policyOwner = policy?.owner ?? '';
    const nsqsConfig = policy?.connections?.netsuiteQuickStart?.config;
    const exporter = nsqsConfig?.exporter ?? policyOwner;
    const exportDate = nsqsConfig?.exportDate ?? CONST.NSQS_EXPORT_DATE.LAST_EXPENSE;
    const paymentAccount = nsqsConfig?.paymentAccount ?? '';
    const nsqsData = policy?.connections?.netsuiteQuickStart?.data;
    const paymentAccounts: NSQSPaymentAccount[] = useMemo(() => nsqsData?.paymentAccounts ?? [], [nsqsData?.paymentAccounts]);

    const defaultPaymentAccount: NSQSPaymentAccount = useMemo(
        () => ({
            id: '',
            name: translate(`workspace.nsqs.export.defaultPaymentAccount`),
            displayName: translate(`workspace.nsqs.export.defaultPaymentAccount`),
            number: '',
            type: '',
        }),
        [translate],
    );
    const selectedPaymentAccount = [defaultPaymentAccount, ...paymentAccounts].find((account) => account.id === paymentAccount);

    return (
        <ConnectionLayout
            policyID={policyID}
            displayName={NSQSExportPage.displayName}
            headerTitle="workspace.accounting.export"
            title="workspace.nsqs.export.description"
            titleStyle={styles.pb3}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.pb2, styles.ph5]}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NSQS}
        >
            <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.NSQS_CONFIG.EXPORTER], nsqsConfig?.pendingFields)}>
                <MenuItemWithTopDescription
                    title={exporter}
                    description={translate('workspace.accounting.preferredExporter')}
                    wrapperStyle={[styles.sectionMenuItemTopDescription]}
                    shouldShowRightIcon
                    onPress={policyID ? () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NSQS_EXPORT_PREFERRED_EXPORTER.getRoute(policyID)) : undefined}
                    brickRoadIndicator={areSettingsInErrorFields([CONST.NSQS_CONFIG.EXPORTER], nsqsConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                />
            </OfflineWithFeedback>
            <View style={[styles.sectionDividerLine, styles.mv3]} />
            <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.NSQS_CONFIG.EXPORT_DATE], nsqsConfig?.pendingFields)}>
                <MenuItemWithTopDescription
                    title={translate(`workspace.nsqs.export.exportDate.values.${exportDate}.label`)}
                    description={translate('common.date')}
                    wrapperStyle={[styles.sectionMenuItemTopDescription]}
                    shouldShowRightIcon
                    onPress={policyID ? () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NSQS_EXPORT_DATE.getRoute(policyID)) : undefined}
                    brickRoadIndicator={areSettingsInErrorFields([CONST.NSQS_CONFIG.EXPORT_DATE], nsqsConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                />
            </OfflineWithFeedback>
            <MenuItemWithTopDescription
                interactive={false}
                title={translate('workspace.nsqs.export.expense')}
                description={translate('workspace.nsqs.export.reimbursableExpenses')}
                wrapperStyle={[styles.sectionMenuItemTopDescription]}
            />
            <MenuItemWithTopDescription
                interactive={false}
                title={translate('workspace.nsqs.export.expense')}
                description={translate('workspace.nsqs.export.nonReimbursableExpenses')}
                wrapperStyle={[styles.sectionMenuItemTopDescription]}
            />
            <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.NSQS_CONFIG.PAYMENT_ACCOUNT], nsqsConfig?.pendingFields)}>
                <MenuItemWithTopDescription
                    title={selectedPaymentAccount?.displayName}
                    description={translate(`workspace.nsqs.export.paymentAccount`)}
                    wrapperStyle={[styles.sectionMenuItemTopDescription]}
                    shouldShowRightIcon
                    onPress={policyID ? () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NSQS_EXPORT_PAYMENT_ACCOUNT.getRoute(policyID)) : undefined}
                    brickRoadIndicator={areSettingsInErrorFields([CONST.NSQS_CONFIG.PAYMENT_ACCOUNT], nsqsConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                />
            </OfflineWithFeedback>
        </ConnectionLayout>
    );
}

NSQSExportPage.displayName = 'NSQSExportPage';

export default withPolicyConnections(NSQSExportPage);
