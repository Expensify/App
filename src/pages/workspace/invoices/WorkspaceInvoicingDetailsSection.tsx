import React, {useMemo} from 'react';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Section from '@components/Section';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type WorkspaceInvoicingDetailsSectionProps = {
    /** The current policy ID */
    policyID: string;

    /** Whether the current user can edit miscellaneous settings. */
    canWriteMoreFeatures: boolean;
};

function WorkspaceInvoicingDetailsSection({policyID, canWriteMoreFeatures}: WorkspaceInvoicingDetailsSectionProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

    const horizontalPadding = useMemo(() => (shouldUseNarrowLayout ? styles.ph5 : styles.ph8), [shouldUseNarrowLayout, styles]);

    return (
        <Section
            title={translate('workspace.invoices.invoicingDetails')}
            subtitle={translate('workspace.invoices.invoicingDetailsDescription')}
            containerStyles={[styles.ph0, shouldUseNarrowLayout ? styles.pt5 : styles.pt8]}
            subtitleStyles={horizontalPadding}
            titleStyles={[styles.accountSettingsSectionTitle, horizontalPadding]}
            childrenStyles={styles.pt5}
            subtitleMuted
        >
            <MenuItemWithTopDescription
                key={translate('workspace.invoices.companyName')}
                shouldShowRightIcon={canWriteMoreFeatures}
                title={policy?.invoice?.companyName}
                description={translate('workspace.invoices.companyName')}
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.INVOICES.COMPANY_NAME}
                onPress={() => Navigation.navigate(ROUTES.WORKSPACE_INVOICES_COMPANY_NAME.getRoute(policyID))}
                interactive={canWriteMoreFeatures}
                style={horizontalPadding}
            />
            <MenuItemWithTopDescription
                key={translate('workspace.invoices.companyWebsite')}
                shouldShowRightIcon={canWriteMoreFeatures}
                title={policy?.invoice?.companyWebsite}
                description={translate('workspace.invoices.companyWebsite')}
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.INVOICES.COMPANY_WEBSITE}
                onPress={() => Navigation.navigate(ROUTES.WORKSPACE_INVOICES_COMPANY_WEBSITE.getRoute(policyID))}
                interactive={canWriteMoreFeatures}
                style={horizontalPadding}
            />
        </Section>
    );
}

export default WorkspaceInvoicingDetailsSection;
