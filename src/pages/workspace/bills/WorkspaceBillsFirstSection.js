import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as Expensicons from '../../../components/Icon/Expensicons';
import * as Illustrations from '../../../components/Icon/Illustrations';
import Section from '../../../components/Section';
import CopyTextToClipboard from '../../../components/CopyTextToClipboard';
import * as Link from '../../../libs/actions/Link';
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

const WorkspaceBillsFirstSection = (props) => {
    const emailDomain = Str.extractEmailDomain(props.session.email);
    return (
        <Section
            title={props.translate('workspace.bills.manageYourBills')}
            icon={Illustrations.InvoiceOrange}
            menuItems={[
                {
                    title: props.translate('workspace.bills.viewAllBills'),
                    onPress: () => (
                        Link.openOldDotLink(`reports?policyID=${props.policyID}&from=all&type=bill&showStates=Open,Processing,Approved,Reimbursed,Archived&isAdvancedFilterMode=true`)
                    ),
                    icon: Expensicons.Bill,
                    shouldShowRightIcon: true,
                    iconRight: Expensicons.NewWindow,
                },
            ]}
        >
            <View style={[styles.mv4]}>
                <Text>
                    {props.translate('workspace.bills.askYourVendorsBeforeEmail')}
                    {props.user.isFromPublicDomain ? (
                        <TouchableOpacity
                            onPress={() => Link.openExternalLink('https://community.expensify.com/discussion/7500/how-to-pay-your-company-bills-in-expensify/')}
                        >
                            <Text style={[styles.textBlue]}>example.com@expensify.cash</Text>
                        </TouchableOpacity>
                    ) : (
                        <CopyTextToClipboard
                            text={`${emailDomain}@expensify.cash`}
                            textStyles={[styles.textBlue]}
                        />
                    )}
                    <Text>{props.translate('workspace.bills.askYourVendorsAfterEmail')}</Text>
                </Text>
            </View>
        </Section>
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
