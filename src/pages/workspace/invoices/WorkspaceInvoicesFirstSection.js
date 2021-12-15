import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import ExpensifyText from '../../../components/ExpensifyText';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as Expensicons from '../../../components/Icon/Expensicons';
import * as Illustrations from '../../../components/Icon/Illustrations';
import WorkspaceSection from '../WorkspaceSection';
import * as Link from '../../../libs/actions/Link';

const propTypes = {
    /** The policy ID currently being configured */
    policyID: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

const WorkspaceInvoicesFirstSection = props => (
    <WorkspaceSection
        title={props.translate('workspace.invoices.invoiceClientsAndCustomers')}
        icon={Illustrations.MoneyEnvelopeBlue}
        menuItems={[
            {
                title: props.translate('workspace.invoices.sendInvoice'),
                onPress: () => Link.openOldDotLink(encodeURI('reports?param={"createInvoice":true}')),
                icon: Expensicons.Send,
                shouldShowRightIcon: true,
                iconRight: Expensicons.NewWindow,
            },
            {
                title: props.translate('workspace.invoices.viewAllInvoices'),
                onPress: () => (
                    Link.openOldDotLink(`reports?policyID=${props.policyID}&from=all&type=invoice&showStates=Open,Processing,Approved,Reimbursed,Archived&isAdvancedFilterMode=true`)
                ),
                icon: Expensicons.Invoice,
                shouldShowRightIcon: true,
                iconRight: Expensicons.NewWindow,
            },
        ]}
    >
        <View style={[styles.mv4]}>
            <ExpensifyText>
                {props.translate('workspace.invoices.invoiceFirstSectionCopy')}
            </ExpensifyText>
        </View>
    </WorkspaceSection>
);

WorkspaceInvoicesFirstSection.propTypes = propTypes;
WorkspaceInvoicesFirstSection.displayName = 'WorkspaceInvoicesFirstSection';

export default withLocalize(WorkspaceInvoicesFirstSection);
