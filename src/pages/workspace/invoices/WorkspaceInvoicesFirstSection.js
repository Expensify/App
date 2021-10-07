import React from 'react';
import {View, Text} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import {
    Apple,
    NewWindow,
    Send,
} from '../../../components/Icon/Expensicons';
import WorkspaceSection from '../WorkspaceSection';
import {openSignedInLink} from '../../../libs/actions/App';
import compose from '../../../libs/compose';

const propTypes = {
    /** The policy ID currently being configured */
    policyID: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

const WorkspaceInvoicesFirstSection = ({translate, policyID}) => {
    return (
        <>
            <WorkspaceSection
                title={translate('workspace.invoices.invoiceClientsAndCustomers')}
                icon={Apple} // TODO: Replace this with the proper icon
                menuItems={[
                    {
                        title: translate('workspace.common.invoices'),
                        onPress: () => openSignedInLink('reports?param={"createInvoice":true}'),
                        icon: Send,
                        shouldShowRightIcon: true,
                        iconRight: NewWindow,
                    },
                    {
                        title: translate('workspace.invoices.viewAllInvoices'),
                        // eslint-disable-next-line max-len
                        onPress: () => openSignedInLink(`reports?param={"startDate":"","endDate":"","reportName":"","policyID":"${policyID}","from":"all","type":"invoice","states":{"Open":true,"Processing":true,"Approved":true,"Reimbursed":true,"Archived":true},"isAdvancedFilterMode":true}`),
                        icon: Send, // TODO: Replace with the proper invoice icon (envelope with up arrow)
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
        </>
    );
};

WorkspaceInvoicesFirstSection.propTypes = propTypes;
WorkspaceInvoicesFirstSection.displayName = 'WorkspaceInvoicesFirstSection';

export default compose(
    withLocalize,
)(WorkspaceInvoicesFirstSection);
