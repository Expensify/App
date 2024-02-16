import React from 'react';
import {View} from 'react-native';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Link from '@userActions/Link';

type WorkspaceInvoicesFirstSectionProps = {
    /** The policy ID currently being configured */
    policyID: string;
};

function WorkspaceInvoicesFirstSection({policyID}: WorkspaceInvoicesFirstSectionProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const sendInvoiceUrl = encodeURI('reports?param={"createInvoice":true}');
    const viewAllInvoicesUrl = `reports?policyID=${policyID}&from=all&type=invoice&showStates=Open,Processing,Approved,Reimbursed,Archived&isAdvancedFilterMode=true`;

    return (
        <Section
            title={translate('workspace.invoices.invoiceClientsAndCustomers')}
            icon={Illustrations.InvoiceBlue}
            isCentralPane
            menuItems={[
                {
                    title: translate('workspace.invoices.sendInvoice'),
                    onPress: () => Link.openOldDotLink(sendInvoiceUrl),
                    icon: Expensicons.Send,
                    shouldShowRightIcon: true,
                    iconRight: Expensicons.NewWindow,
                    wrapperStyle: [styles.cardMenuItem],
                    link: () => Link.buildOldDotURL(sendInvoiceUrl),
                },
                {
                    title: translate('workspace.invoices.viewAllInvoices'),
                    onPress: () => Link.openOldDotLink(viewAllInvoicesUrl),
                    icon: Expensicons.Invoice,
                    shouldShowRightIcon: true,
                    iconRight: Expensicons.NewWindow,
                    wrapperStyle: [styles.cardMenuItem],
                    link: () => Link.buildOldDotURL(viewAllInvoicesUrl),
                },
            ]}
        >
            <View style={[styles.mv3]}>
                <Text>{translate('workspace.invoices.invoiceFirstSectionCopy')}</Text>
            </View>
        </Section>
    );
}

WorkspaceInvoicesFirstSection.displayName = 'WorkspaceInvoicesFirstSection';

export default WorkspaceInvoicesFirstSection;
