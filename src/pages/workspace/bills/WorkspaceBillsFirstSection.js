import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Linking,
} from 'react-native';
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
import userPropTypes from '../../settings/userPropTypes';

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

    /** Information about the logged in user's account */
    user: userPropTypes.isRequired,
};

const WorkspaceBillsFirstSection = ({
    translate,
    policyID,
    session,
    user,
}) => {
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
                        {user.isFromPublicDomain ? (
                            <TouchableOpacity
                                onPress={() => Linking.openURL('https://community.expensify.com/discussion/7500/how-to-pay-your-company-bills-in-expensify/')}
                            >
                                <Text style={[styles.textBlue]}>example.com@expensify.cash</Text>
                            </TouchableOpacity>
                        ) : (
                            <CopyTextToClipboard
                                text={`${emailDomain}@expensify.cash`}
                                textStyles={[styles.textBlue]}
                            />
                        )}
                        <Text>{translate('workspace.bills.askYourVendorsAfterEmail')}</Text>
                    </Text>
                </View>
            </WorkspaceSection>
        </>
    );
};

WorkspaceBillsFirstSection.propTypes = propTypes;
WorkspaceBillsFirstSection.displayName = 'WorkspaceBillsFirstSection';

export default compose(
    withLocalize,
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
        user: {
            key: ONYXKEYS.USER,
        },
    }),
)(WorkspaceBillsFirstSection);
