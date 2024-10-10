import React from 'react';
import {useOnyx} from 'react-native-onyx';
import Balance from '@components/Balance';
import Section from '@components/Section';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import ONYXKEYS from '@src/ONYXKEYS';

type WorkspaceInvoiceBalanceSectionProps = {
    /** The policy ID currently being configured */
    policyID: string;
};

function WorkspaceInvoiceBalanceSection({policyID}: WorkspaceInvoiceBalanceSectionProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

    return (
        <Section
            title={translate('workspace.invoices.invoiceBalance')}
            subtitle={translate('workspace.invoices.invoiceBalanceSubtitle')}
            isCentralPane
            titleStyles={styles.textStrong}
            childrenStyles={styles.pt5}
            subtitleMuted
        >
            <Balance balance={policy?.invoice?.bankAccount?.stripeConnectAccountBalance ?? 0} />
        </Section>
    );
}

export default WorkspaceInvoiceBalanceSection;
