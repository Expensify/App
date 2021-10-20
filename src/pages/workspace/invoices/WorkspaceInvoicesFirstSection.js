import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import {
    Invoice,
    NewWindow,
    Send,
} from '../../../components/Icon/Expensicons';
import {MoneyEnvelopeBlue} from '../../../components/Icon/Illustrations';
import WorkspaceSection from '../WorkspaceSection';
import {openOldDotLink} from '../../../libs/actions/Link';

const propTypes = {
    /** The policy ID currently being configured */
    policyID: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

const WorkspaceInvoicesFirstSection = ({translate, policyID}) => (
    <WorkspaceSection
        title={translate('workspace.invoices.invoiceClientsAndCustomers')}
        icon={MoneyEnvelopeBlue}
        menuItems={[
            {
                title: translate('workspace.invoices.sendInvoice'),
                onPress: () => openOldDotLink('reports?param={"createInvoice":true}'),
                icon: Send,
                shouldShowRightIcon: true,
                iconRight: NewWindow,
            },
            {
                title: translate('workspace.invoices.viewAllInvoices'),
                onPress: () => openOldDotLink(`reports?policyID=${policyID}&from=all&type=invoice&showStates=Open,Processing,Approved,Reimbursed,Archived&isAdvancedFilterMode=true`),
                icon: Invoice,
                shouldShowRightIcon: true,
                iconRight: NewWindow,
            },
        ]}
    >
        <View style={[styles.mv4]}>
            <Text>
                {translate('workspace.invoices.invoiceFirstSectionCopy')}
            </Text>
        </View>
    </WorkspaceSection>
);

WorkspaceInvoicesFirstSection.propTypes = propTypes;
WorkspaceInvoicesFirstSection.displayName = 'WorkspaceInvoicesFirstSection';

export default withLocalize(WorkspaceInvoicesFirstSection);
