import Str from 'expensify-common/lib/str';
import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import CopyTextToClipboard from '@components/CopyTextToClipboard';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import Section from '@components/Section';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import compose from '@libs/compose';
import userPropTypes from '@pages/settings/userPropTypes';
import useThemeStyles from '@styles/useThemeStyles';
import * as Link from '@userActions/Link';
import ONYXKEYS from '@src/ONYXKEYS';

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
    const styles = useThemeStyles();
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
