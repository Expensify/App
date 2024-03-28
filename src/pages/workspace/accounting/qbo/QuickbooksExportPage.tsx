import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function QuickbooksExportPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '';

    const sections = [
        {
            description: translate('workspace.qbo.preferredExporter'),
            action: () => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKSONLINE_EXPORT.getRoute(policyID)),
            hasError: Boolean(policy?.errors?.enableNewCategories),
            title: 'zany@cathyscroissants.com',
        },
        {
            description: translate('workspace.qbo.date'),
            action: () => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKSONLINE_EXPORT.getRoute(policyID)),
            hasError: Boolean(policy?.errors?.syncClasses),
            title: 'Date of last expense',
        },
        {
            description: translate('workspace.qbo.exportExpenses'),
            action: () => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKSONLINE_EXPORT.getRoute(policyID)),
            hasError: Boolean(policy?.errors?.syncCustomers),
            title: 'Vendor bill',
        },
        {
            description: translate('workspace.qbo.exportInvoices'),
            action: () => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKSONLINE_EXPORT.getRoute(policyID)),
            hasError: Boolean(policy?.errors?.syncLocations),
            title: 'Accounts Receivable (A/R)',
        },
        {
            description: translate('workspace.qbo.exportCompany'),
            action: () => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKSONLINE_EXPORT.getRoute(policyID)),
            hasError: Boolean(policy?.errors?.syncTaxes),
            title: 'Debit card',
        },
        {
            description: translate('workspace.qbo.exportExpensifyCard'),
            action: () => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKSONLINE_EXPORT.getRoute(policyID)),
            hasError: Boolean(policy?.errors?.syncTaxes),
            title: 'Credit card',
            interactive: false,
        },
    ];

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={QuickbooksExportPage.displayName}
        >
            <HeaderWithBackButton title={translate('workspace.qbo.export')} />
            <ScrollView contentContainerStyle={styles.pb2}>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.qbo.exportDescription')}</Text>
                {sections.map((section) => (
                    <OfflineWithFeedback key={section.description}>
                        <MenuItemWithTopDescription
                            title={section.title}
                            interactive={section?.interactive ?? true}
                            description={section.description}
                            shouldShowRightIcon={section?.interactive ?? true}
                            onPress={section.action}
                            brickRoadIndicator={section.hasError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                        />
                    </OfflineWithFeedback>
                ))}
                <PressableWithoutFeedback
                    onPress={() => {
                        Link.openExternalLink(CONST.DEEP_DIVE_EXPENSIFY_CARD);
                    }}
                    style={[styles.ph5, styles.pb5]}
                    accessibilityLabel={translate('workspace.qbo.deepDiveExpensifyCard')}
                    role={CONST.ROLE.LINK}
                >
                    <Text style={[styles.optionAlternateText]}>
                        <Text style={[styles.optionAlternateText, styles.textLabelSupporting]}>{`${translate('workspace.qbo.deepDiveExpensifyCard')} `}</Text>
                        <Text style={[styles.optionAlternateText, styles.textLabelSupporting, styles.link]}>{translate('workspace.qbo.deepDiveExpensifyCardIntegration')}</Text>
                    </Text>
                </PressableWithoutFeedback>
            </ScrollView>
        </ScreenWrapper>
    );
}

QuickbooksExportPage.displayName = 'QuickbooksExportPage';

export default withPolicy(QuickbooksExportPage);
