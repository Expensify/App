import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import {
    Bank,
    Receipt,
    NewWindow,
} from '../../../components/Icon/Expensicons';
import {BankUserGreen, ReceiptYellow} from '../../../components/Icon/Illustrations';
import WorkspaceSection from '../WorkspaceSection';
import CopyTextToClipboard from '../../../components/CopyTextToClipboard';
import {openOldDotLink} from '../../../libs/actions/Link';

const propTypes = {
    /** The policy ID currently being configured */
    policyID: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

const WorkspaceReimburseVBAView = ({translate, policyID}) => (
    <>
        <WorkspaceSection
            title={translate('workspace.reimburse.captureReceipts')}
            icon={ReceiptYellow}
            menuItems={[
                {
                    title: translate('workspace.reimburse.viewAllReceipts'),
                    onPress: () => openOldDotLink(`expenses?policyIDList=${policyID}&billableReimbursable=reimbursable&submitterEmail=%2B%2B`),
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
            icon={BankUserGreen}
            menuItems={[
                {
                    title: translate('workspace.reimburse.reimburseReceipts'),
                    onPress: () => openOldDotLink(`reports?policyID=${policyID}&from=all&type=expense&showStates=Archived&isAdvancedFilterMode=true`),
                    icon: Bank,
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
