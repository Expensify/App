import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as Expensicons from '../../../components/Icon/Expensicons';
import * as Illustrations from '../../../components/Icon/Illustrations';
import Section from '../../../components/Section';
import * as Link from '../../../libs/actions/Link';

const propTypes = {
    /** The policy ID currently being configured */
    policyID: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

const WorkspaceInvoicesFirstSection = (props) => {
    const sendInvoiceUrl = encodeURI('reports?param={"createInvoice":true}');
    const viewAllInvoicesUrl = `reports?policyID=${props.policyID}&from=all&type=invoice&showStates=Open,Processing,Approved,Reimbursed,Archived&isAdvancedFilterMode=true`;

    return (
        <Section
            title={props.translate('workspace.invoices.invoiceClientsAndCustomers')}
            icon={Illustrations.InvoiceBlue}
            menuItems={[
                {
                    title: props.translate('workspace.invoices.sendInvoice'),
                    onPress: () => Link.openOldDotLink(sendInvoiceUrl),
                    icon: Expensicons.Send,
                    shouldShowRightIcon: true,
                    iconRight: Expensicons.NewWindow,
                    wrapperStyle: [styles.cardMenuItem],
                    link: () => Link.buildOldDotURL(sendInvoiceUrl),
                },
                {
                    title: props.translate('workspace.invoices.viewAllInvoices'),
                    onPress: () => Link.openOldDotLink(viewAllInvoicesUrl),
                    icon: Expensicons.Invoice,
                    shouldShowRightIcon: true,
                    iconRight: Expensicons.NewWindow,
                    wrapperStyle: [styles.cardMenuItem],
                    link: () => Link.buildOldDotURL(viewAllInvoicesUrl),
                },
            ]}
            containerStyles={[styles.cardSection]}
        >
            <View style={[styles.mv3]}>
                <Text>{props.translate('workspace.invoices.invoiceFirstSectionCopy')}</Text>
            </View>
        </Section>
    );
};

WorkspaceInvoicesFirstSection.propTypes = propTypes;
WorkspaceInvoicesFirstSection.displayName = 'WorkspaceInvoicesFirstSection';

export default withLocalize(WorkspaceInvoicesFirstSection);
