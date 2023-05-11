import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import Text from '../../../components/Text';
import Button from '../../../components/Button';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as Expensicons from '../../../components/Icon/Expensicons';
import * as Illustrations from '../../../components/Icon/Illustrations';
import UnorderedList from '../../../components/UnorderedList';
import Section from '../../../components/Section';
import * as Link from '../../../libs/actions/Link';
import * as User from '../../../libs/actions/User';
import ONYXKEYS from '../../../ONYXKEYS';
import compose from '../../../libs/compose';
import CONST from '../../../CONST';
import userPropTypes from '../../settings/userPropTypes';

const propTypes = {
    /** Information about the logged in user's account */
    user: userPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    user: {},
};

const WorkspaceCardVBANoECardView = (props) => (
    <>
        <Section
            title={props.translate('workspace.card.header')}
            icon={Illustrations.CreditCardsNew}
        >
            <View style={[styles.mv3]}>
                <UnorderedList
                    items={[
                        props.translate('workspace.card.benefit1'),
                        props.translate('workspace.card.benefit2'),
                        props.translate('workspace.card.benefit3'),
                        props.translate('workspace.card.benefit4'),
                    ]}
                />
            </View>
            <Button
                text={props.translate('workspace.card.addWorkEmail')}
                onPress={() => {
                    Link.openOldDotLink(CONST.ADD_SECONDARY_LOGIN_URL);
                    User.subscribeToExpensifyCardUpdates();
                }}
                icon={Expensicons.Mail}
                style={[styles.mt4]}
                iconStyles={[styles.buttonCTAIcon]}
                shouldShowRightIcon
                large
                success
            />
        </Section>
        {Boolean(props.user.isCheckingDomain) && <Text style={[styles.m5, styles.formError]}>{props.translate('workspace.card.checkingDomain')}</Text>}
    </>
);

WorkspaceCardVBANoECardView.propTypes = propTypes;
WorkspaceCardVBANoECardView.defaultProps = defaultProps;
WorkspaceCardVBANoECardView.displayName = 'WorkspaceCardVBANoECardView';

export default compose(
    withLocalize,
    withOnyx({
        user: {
            key: ONYXKEYS.USER,
        },
    }),
)(WorkspaceCardVBANoECardView);
