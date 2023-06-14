import React from 'react';
import {View} from 'react-native';
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
import TextLink from '../../../components/TextLink';

const propTypes = {
    /** The policy ID currently being configured */
    policyID: PropTypes.string.isRequired,

    ...withLocalizePropTypes,

    /* From Onyx */
    /** Session of currently logged in user */
    session: PropTypes.shape({
        /** Email address */
        email: PropTypes.string.isRequired,
    }),

    /** Information about the logged in user's account */
    user: userPropTypes,
};

const defaultProps = {
    session: {
        email: null,
    },
    user: {},
};

function WorkspaceBillsFirstSection(props) {
    const emailDomain = Str.extractEmailDomain(props.session.email);
    const manageYourBillsUrl = `reports?policyID=${props.policyID}&from=all&type=bill&showStates=Open,Processing,Approved,Reimbursed,Archived&isAdvancedFilterMode=true`;
    return (
        <Section
            title={props.translate('workspace.bills.manageYourBills')}
            icon={Illustrations.PinkBill}
            menuItems={[
                {
                    title: props.translate('workspace.bills.viewAllBills'),
                    onPress: () => Link.openOldDotLink(manageYourBillsUrl),
                    icon: Expensicons.Bill,
                    shouldShowRightIcon: true,
                    iconRight: Expensicons.NewWindow,
                    wrapperStyle: [styles.cardMenuItem],
                    link: () => Link.buildOldDotURL(manageYourBillsUrl),
                },
            ]}
            containerStyles={[styles.cardSection]}
        >
            <View style={[styles.mv3]}>
                <Text>
                    {props.translate('workspace.bills.askYourVendorsBeforeEmail')}
                    {props.user.isFromPublicDomain ? (
                        <TextLink onPress={() => Link.openExternalLink('https://community.expensify.com/discussion/7500/how-to-pay-your-company-bills-in-expensify/')}>
                            example.com@expensify.cash
                        </TextLink>
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
}

WorkspaceBillsFirstSection.propTypes = propTypes;
WorkspaceBillsFirstSection.defaultProps = defaultProps;
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
