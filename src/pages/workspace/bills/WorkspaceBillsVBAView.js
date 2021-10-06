import React from 'react';
import {View, Text} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import {
    Apple,
    Receipt,
    NewWindow,
} from '../../../components/Icon/Expensicons';
import WorkspaceSection from '../WorkspaceSection';
import CopyTextToClipboard from '../../../components/CopyTextToClipboard';
import {openSignedInLink} from '../../../libs/actions/App';

const propTypes = {
    /** The policy ID currently being configured */
    policyID: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

const WorkspaceBillsVBAView = ({translate, policyID}) => (
    <>
        <WorkspaceSection
            title={translate('workspace.bills.manageYourBills')}
            icon={Apple} // TODO: Replace this with the proper icon
            menuItems={[
                {
                    title: translate('workspace.bills.viewAllBills'),
                    // eslint-disable-next-line max-len
                    onPress: () => openSignedInLink(`https://www.expensify.com/reports?param={"startDate":"","endDate":"","reportName":"","policyID":"${policyID}","from":"all","type":"bill","states":{"Open":true,"Processing":true,"Approved":true,"Reimbursed":true,"Archived":true},"isAdvancedFilterMode":true}`),
                    icon: Receipt, // TODO: use the bill icon once it's added to this repo
                    shouldShowRightIcon: true,
                    iconRight: NewWindow,
                },
            ]}
        >
            <View style={[styles.mv4]}>
                <Text>
                    {translate('workspace.bills.askYourVendorsBeforeEmail')}
                    <CopyTextToClipboard
                        text="your.domain@expensify.com"
                        textStyles={[styles.textBlue]}
                    />
                    <Text>{translate('workspace.bills.askYourVendorsAfterEmail')}</Text>
                </Text>
            </View>
        </WorkspaceSection>

        <WorkspaceSection
            title={translate('workspace.bills.hassleFreeBills')}
            icon={Apple} // TODO: Replace this with the proper icon
            menuItems={[
                {
                    title: translate('workspace.common.bills'),
                    // eslint-disable-next-line max-len
                    onPress: () => openSignedInLink(`https://www.expensify.com/reports?param={"startDate":"","endDate":"","reportName":"","policyID":"${policyID}","from":"all","type":"bill","states":{"Open":false,"Processing":true,"Approved":true,"Reimbursed":false,"Archived":false},"isAdvancedFilterMode":true}`),
                    icon: Receipt, // TODO: Replace this with the right bills upload icon
                    shouldShowRightIcon: true,
                    iconRight: NewWindow,
                },
            ]}
        >
            <View style={[styles.mv4]}>
                <Text>{translate('workspace.bills.VBACopy')}</Text>
            </View>
        </WorkspaceSection>
    </>
);

WorkspaceBillsVBAView.propTypes = propTypes;
WorkspaceBillsVBAView.displayName = 'WorkspaceBillsVBAView';

export default withLocalize(WorkspaceBillsVBAView);
