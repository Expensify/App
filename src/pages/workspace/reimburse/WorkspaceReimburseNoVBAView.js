import React from 'react';
import {View, Text} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import {
    Apple,
    Receipt,
    NewWindow,
    Bank,
    Clipboard,
    Checkmark,
} from '../../../components/Icon/Expensicons';
import WorkspaceSection from '../WorkspaceSection';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import Icon from '../../../components/Icon';
import CopyTextToClipboard from '../../../components/CopyTextToClipboard';
import {openSignedInLink} from '../../../libs/actions/App';

const propTypes = {
    /** The policy ID currently being configured */
    policyID: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

const WorkspaceCardNoVBAView = ({translate, policyID}) => (
    <>
        <WorkspaceSection
            title={translate('workspace.reimburse.captureReceipts')}
            icon={Apple} // TODO: Replace this with the proper icon
            menuItems={[
                {
                    title: translate('workspace.reimburse.viewAllReceipts'),
                    onPress: () => openSignedInLink(`expenses?param={"policyID":"${policyID}"}`),
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
            icon={Apple} // TODO: Replace this with the proper icon
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

WorkspaceCardNoVBAView.propTypes = propTypes;
WorkspaceCardNoVBAView.displayName = 'WorkspaceCardNoVBAView';

export default withLocalize(WorkspaceCardNoVBAView);
