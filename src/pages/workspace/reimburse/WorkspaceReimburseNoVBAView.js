import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import {
    NewWindow,
    Bank,
    Receipt,
} from '../../../components/Icon/Expensicons';
import {ReceiptYellow, JewelBoxGreen} from '../../../components/Icon/Illustrations';
import WorkspaceSection from '../WorkspaceSection';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import CopyTextToClipboard from '../../../components/CopyTextToClipboard';
import {openOldDotLink} from '../../../libs/actions/Link';

const propTypes = {
    /** The policy ID currently being configured */
    policyID: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

const WorkspaceReimburseNoVBAView = ({translate, policyID}) => (
    <>
        <WorkspaceSection
            title={translate('workspace.reimburse.captureReceipts')}
            icon={ReceiptYellow}
            menuItems={[
                {
                    title: translate('workspace.reimburse.viewAllReceipts'),
                    onPress: () => openOldDotLink(`reports?param={"startDate":"","endDate":"","reportName":"","policyID":"${policyID}","from":"all","type":"expense","showStates":"Archived","isAdvancedFilterMode":"true"}`),
                    icon: Receipt,
                    shouldShowRightIcon: true,
                    iconRight: NewWindow,
                },
            ]}
        >
            <View style={[styles.mv4, styles.flexRow, styles.flexWrap]}>
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
            title={translate('workspace.reimburse.unlockNextDayReimbursements')}
            icon={JewelBoxGreen}
            menuItems={[
                {
                    title: translate('workspace.common.bankAccount'),
                    onPress: () => Navigation.navigate(ROUTES.getWorkspaceBankAccountRoute(policyID)),
                    icon: Bank,
                    shouldShowRightIcon: true,
                },
            ]}
        >
            <View style={[styles.mv4]}>
                <Text>{translate('workspace.reimburse.unlockNoVBACopy')}</Text>
            </View>
        </WorkspaceSection>
    </>
);

WorkspaceReimburseNoVBAView.propTypes = propTypes;
WorkspaceReimburseNoVBAView.displayName = 'WorkspaceReimburseNoVBAView';

export default withLocalize(WorkspaceReimburseNoVBAView);
