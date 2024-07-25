import React, {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Section from '@components/Section';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import ONYXKEYS from '@src/ONYXKEYS';

type WorkspaceInvoicingDetailsSectionProps = {
    /** The current policy ID */
    policyID: string;
};

function WorkspaceInvoicingDetailsSection({policyID}: WorkspaceInvoicingDetailsSectionProps) {
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
            titleStyles={[styles.textStrong, horizontalPadding]}
            childrenStyles={styles.pt5}
            subtitleMuted
        >
            <MenuItemWithTopDescription
                key={translate('workspace.invoices.companyName')}
                shouldShowRightIcon
                title={policy?.invoice?.companyName}
                description={translate('workspace.invoices.companyName')}
                onPress={() => {}}
                style={horizontalPadding}
            />
            <MenuItemWithTopDescription
                key={translate('workspace.invoices.companyWebsite')}
                shouldShowRightIcon
                title={policy?.invoice?.companyWebsite}
                description={translate('workspace.invoices.companyWebsite')}
                onPress={() => {}}
                style={horizontalPadding}
            />
        </Section>
    );
}

WorkspaceInvoicingDetailsSection.displayName = 'WorkspaceInvoicingDetailsSection';

export default WorkspaceInvoicingDetailsSection;
