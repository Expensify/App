import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as Expensicons from '../../../components/Icon/Expensicons';
import * as Illustrations from '../../../components/Icon/Illustrations';
import Section from '../../../components/Section';
import CopyTextToClipboard from '../../../components/CopyTextToClipboard';
import * as Link from '../../../libs/actions/Link';

const propTypes = {
    /** The policy ID currently being configured */
    policyID: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

const WorkspaceReimburseVBAView = props => (
    <>
        <Section
            title={props.translate('workspace.reimburse.captureReceipts')}
            icon={Illustrations.ReceiptYellow}
            menuItems={[
                {
                    title: props.translate('workspace.reimburse.viewAllReceipts'),
                    onPress: () => Link.openOldDotLink(`expenses?policyIDList=${props.policyID}&billableReimbursable=reimbursable&submitterEmail=%2B%2B`),
                    icon: Expensicons.Receipt,
                    shouldShowRightIcon: true,
                    iconRight: Expensicons.NewWindow,
                },
            ]}
        >
            <View style={[styles.mv4]}>
                <Text>
                    {props.translate('workspace.reimburse.captureNoVBACopyBeforeEmail')}
                    <CopyTextToClipboard
                        text="receipts@expensify.com"
                        textStyles={[styles.textBlue]}
                    />
                    <Text>{props.translate('workspace.reimburse.captureNoVBACopyAfterEmail')}</Text>
                </Text>
            </View>
        </Section>

        <Section
            title={props.translate('workspace.reimburse.fastReimbursementsHappyMembers')}
            icon={Illustrations.BankUserGreen}
            menuItems={[
                {
                    title: props.translate('workspace.reimburse.reimburseReceipts'),
                    onPress: () => Link.openOldDotLink(`reports?policyID=${props.policyID}&from=all&type=expense&showStates=Archived&isAdvancedFilterMode=true`),
                    icon: Expensicons.Bank,
                    shouldShowRightIcon: true,
                    iconRight: Expensicons.NewWindow,
                },
            ]}
        >
            <View style={[styles.mv4]}>
                <Text>{props.translate('workspace.reimburse.fastReimbursementsVBACopy')}</Text>
            </View>
        </Section>
    </>
);

WorkspaceReimburseVBAView.propTypes = propTypes;
WorkspaceReimburseVBAView.displayName = 'WorkspaceReimburseVBAView';

export default withLocalize(WorkspaceReimburseVBAView);
