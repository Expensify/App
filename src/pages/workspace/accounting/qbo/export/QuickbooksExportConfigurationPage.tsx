import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {MenuItemProps} from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {OfflineWithFeedbackProps} from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import FeatureEnabledAccessOrNotFoundWrapper from '@pages/workspace/FeatureEnabledAccessOrNotFoundWrapper';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type MenuItem = MenuItemProps & {pendingAction?: OfflineWithFeedbackProps['pendingAction']};

function QuickbooksExportConfigurationPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '';
    const policyOwner = policy?.owner ?? '';
    const {exporter, exportDate, exportEntity, exportInvoice, exportCompanyCard, errorFields, pendingFields} = policy?.connections?.quickbooksOnline?.config ?? {};
    const menuItems: MenuItem[] = [
        {
            description: translate('workspace.qbo.preferredExporter'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_PREFERRED_EXPORTER.getRoute(policyID)),
            brickRoadIndicator: errorFields?.exporter ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: exporter ?? policyOwner,
            pendingAction: pendingFields?.exporter,
            error: errorFields?.exporter ? translate('common.genericErrorMessage') : undefined,
        },
        {
            description: translate('workspace.qbo.date'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_DATE_SELECT.getRoute(policyID)),
            brickRoadIndicator: errorFields?.exportDate ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: exportDate ? translate(`workspace.qbo.${exportDate}.label`) : undefined,
            pendingAction: pendingFields?.exportDate,
            error: errorFields?.exportDate ? translate('common.genericErrorMessage') : undefined,
        },
        {
            description: translate('workspace.qbo.exportExpenses'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES.getRoute(policyID)),
            brickRoadIndicator: Boolean(errorFields?.exportEntity) || Boolean(errorFields?.exportAccount) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: exportEntity ? translate(`workspace.qbo.${exportEntity}`) : undefined,
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            pendingAction: pendingFields?.exportEntity || pendingFields?.exportAccount,
        },
        {
            description: translate('workspace.qbo.exportInvoices'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_INVOICE_ACCOUNT_SELECT.getRoute(policyID)),
            brickRoadIndicator: errorFields?.exportInvoice ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: exportInvoice,
            pendingAction: pendingFields?.exportInvoice,
            error: errorFields?.exportInvoice ? translate('common.genericErrorMessage') : undefined,
        },
        {
            description: translate('workspace.qbo.exportCompany'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT.getRoute(policyID)),
            brickRoadIndicator: errorFields?.exportCompanyCard ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: exportCompanyCard ? translate(`workspace.qbo.${exportCompanyCard}`) : undefined,
            pendingAction: pendingFields?.exportCompanyCard,
            error: errorFields?.exportCompanyCard ? translate('common.genericErrorMessage') : undefined,
        },
        {
            description: translate('workspace.qbo.exportExpensifyCard'),
            title: translate('workspace.qbo.creditCard'),
            shouldShowRightIcon: false,
            interactive: false,
        },
    ];

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={policyID}>
            <FeatureEnabledAccessOrNotFoundWrapper
                policyID={policyID}
                featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            >
                <ScreenWrapper
                    includeSafeAreaPaddingBottom={false}
                    testID={QuickbooksExportConfigurationPage.displayName}
                >
                    <HeaderWithBackButton title={translate('workspace.qbo.export')} />
                    <ScrollView contentContainerStyle={styles.pb2}>
                        <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.qbo.exportDescription')}</Text>
                        {menuItems.map((menuItem) => (
                            <OfflineWithFeedback
                                key={menuItem.description}
                                pendingAction={menuItem.pendingAction}
                            >
                                <MenuItemWithTopDescription
                                    title={menuItem.title}
                                    interactive={menuItem?.interactive ?? true}
                                    description={menuItem.description}
                                    shouldShowRightIcon={menuItem?.shouldShowRightIcon ?? true}
                                    onPress={menuItem?.onPress}
                                    brickRoadIndicator={menuItem?.brickRoadIndicator}
                                    // TODO uncomment when errorText will be fixed
                                    // errorText={menuItem?.errorText}
                                    error={menuItem?.error}
                                />
                            </OfflineWithFeedback>
                        ))}
                        <Text style={[styles.mutedNormalTextLabel, styles.ph5, styles.pb5, styles.mt2]}>
                            <Text style={[styles.mutedNormalTextLabel]}>{`${translate('workspace.qbo.deepDiveExpensifyCard')} `}</Text>
                            <TextLink
                                onPress={() => Link.openExternalLink(CONST.DEEP_DIVE_EXPENSIFY_CARD)}
                                style={[styles.mutedNormalTextLabel, styles.link]}
                            >
                                {translate('workspace.qbo.deepDiveExpensifyCardIntegration')}
                            </TextLink>
                        </Text>
                    </ScrollView>
                </ScreenWrapper>
            </FeatureEnabledAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

QuickbooksExportConfigurationPage.displayName = 'QuickbooksExportConfigurationPage';

export default withPolicyConnections(QuickbooksExportConfigurationPage);
