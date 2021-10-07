import React from 'react';
import {View, Text} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import {
    Apple,
    Bank,
    NewWindow,
} from '../../../components/Icon/Expensicons';
import WorkspaceSection from '../WorkspaceSection';
import compose from '../../../libs/compose';
import WorkspaceInvoicesFirstSection from './WorkspaceInvoicesFirstSection';
import {openSignedInLink} from '../../../libs/actions/App';

const propTypes = {
    /** The policy ID currently being configured */
    policyID: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

const WorkspaceInvoicesVBAView = ({translate, policyID}) => (
    <>
        <WorkspaceInvoicesFirstSection policyID={policyID} />

        <WorkspaceSection
            title={translate('workspace.invoices.moneyBackInAFlash')}
            icon={Apple} // TODO: Replace this with the proper icon
            menuItems={[
                {
                    title: translate('workspace.invoices.viewUnpaidInvoices'),
                    onPress: () => openSignedInLink(`reports?param={"startDate":"","endDate":"","reportName":"","policyID":"${policyID}","from":"all","type":"invoice","states":{"Open":false,"Processing":true,"Approved":false,"Reimbursed":false,"Archived":false},"isAdvancedFilterMode":true}`),
                    icon: Bank, // TODO: Use the icon that's a circle with an hourglass in it
                    shouldShowRightIcon: true,
                    iconRight: NewWindow,
                },
            ]}
        >
            <View style={[styles.mv4]}>
                <Text>{translate('workspace.invoices.unlockVBACopy')}</Text>
            </View>
        </WorkspaceSection>
    </>
);

WorkspaceInvoicesVBAView.propTypes = propTypes;
WorkspaceInvoicesVBAView.displayName = 'WorkspaceInvoicesVBAView';

export default compose(
    withLocalize,
)(WorkspaceInvoicesVBAView);
