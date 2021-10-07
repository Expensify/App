import React from 'react';
import {View, Text} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import {
    Bill,
    NewWindow,
} from '../../../components/Icon/Expensicons';
import {InvoiceOrange} from '../../../components/Icon/Illustrations';
import WorkspaceSection from '../WorkspaceSection';
import CopyTextToClipboard from '../../../components/CopyTextToClipboard';
import {openSignedInLink} from '../../../libs/actions/App';
import compose from '../../../libs/compose';
import ONYXKEYS from '../../../ONYXKEYS';

const propTypes = {
    /** The policy ID currently being configured */
    policyID: PropTypes.string.isRequired,

    ...withLocalizePropTypes,

    /* From Onyx */
    /** Session of currently logged in user */
    session: PropTypes.shape({
        /** Email address */
        email: PropTypes.string.isRequired,
    }).isRequired,
};

const WorkspaceBillsNoVBAView = ({translate, policyID, session}) => {
    const emailDomain = Str.extractEmailDomain(session.email);
    return (
        <>
            <WorkspaceSection
                title={translate('workspace.bills.manageYourBills')}
                icon={InvoiceOrange}
                menuItems={[
                    {
                        title: translate('workspace.bills.viewAllBills'),
                        // eslint-disable-next-line max-len
                        onPress: () => openSignedInLink(`reports?param={"startDate":"","endDate":"","reportName":"","policyID":"${policyID}","from":"all","type":"bill","states":{"Open":true,"Processing":true,"Approved":true,"Reimbursed":true,"Archived":true},"isAdvancedFilterMode":true}`),
                        icon: Bill,
                        shouldShowRightIcon: true,
                        iconRight: NewWindow,
                    },
                ]}
            >
                <View style={[styles.mv4]}>
                    <Text>
                        {translate('workspace.bills.askYourVendorsBeforeEmail')}
                        <CopyTextToClipboard
                            text={`${emailDomain}@expensify.cash`}
                            textStyles={[styles.textBlue]}
                        />
                        <Text>{translate('workspace.bills.askYourVendorsAfterEmail')}</Text>
                    </Text>
                </View>
            </WorkspaceSection>
        </>
    );
};

WorkspaceBillsNoVBAView.propTypes = propTypes;
WorkspaceBillsNoVBAView.displayName = 'WorkspaceBillsNoVBAView';

export default compose(
    withLocalize,
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(WorkspaceBillsNoVBAView);
