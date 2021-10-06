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

const WorkspaceReimburseVBAView = ({translate, policyID}) => (
    <>
        <WorkspaceSection
            title={translate('workspace.reimburse.captureReceipts')}
            icon={Apple} // TODO: Replace this with the proper icon
            menuItems={[
                {
                    title: translate('workspace.reimburse.viewAllReceipts'),
                    onPress: () => openSignedInLink(`expenses?param={"policyIDList":"${policyID}"}`),
                    icon: Receipt,
                    shouldShowRightIcon: true,
                    iconRight: NewWindow,
                },
            ]}
        >
            <View style={[styles.mv4]}>
                <Text>
                    {translate('workspace.reimburse.captureNoVBACopyBeforeEmail')}
                    <CopyTextToClipboard
                        text="receipts@expensify.com"
                        textStyles={[styles.textBlue]}
                    />
                    <Text>{translate('workspace.reimburse.captureNoVBACopyAfterEmail')}</Text>
                </Text>
            </View>
        </WorkspaceSection>

        <WorkspaceSection
            title={translate('workspace.reimburse.fastReimbursementsHappyMembers')}
            icon={Apple} // TODO: Replace this with the proper icon
            menuItems={[
                {
                    title: translate('workspace.reimburse.reimburseReceipts'),
                    // eslint-disable-next-line max-len
                    onPress: () => openSignedInLink(`/reports?param={"startDate":","endDate":","reportName":","policyID":"${policyID}","from":"all","type":"expense","states":{"Open":false,"Processing":false,"Approved":false,"Reimbursed":false,"Archived":true},"isAdvancedFilterMode":true}`),
                    icon: Receipt,
                    shouldShowRightIcon: true,
                    iconRight: NewWindow,
                },
            ]}
        >
            <View style={[styles.mv4]}>
                <Text>{translate('workspace.reimburse.fastReimbursementsVBACopy')}</Text>
            </View>
        </WorkspaceSection>
    </>
);

WorkspaceReimburseVBAView.propTypes = propTypes;
WorkspaceReimburseVBAView.displayName = 'WorkspaceReimburseVBAView';

export default withLocalize(WorkspaceReimburseVBAView);
