import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import {View, Text, Pressable} from 'react-native-web';
import _ from 'underscore';
import styles from '../styles/styles';
import Avatar from './Avatar';
import CONST from '../CONST';
import ONYXKEYS from '../ONYXKEYS';
import {rejectTransaction} from '../libs/actions/IOU';
import ReportActionItemFragment from '../pages/home/report/ReportActionItemFragment';
import ReportActionItemDate from '../pages/home/report/ReportActionItemDate';
import personalDetailsPropType from '../pages/personalDetailsPropType';
import ReportActionPropTypes from '../pages/home/report/ReportActionPropTypes';

const propTypes = {
    action: PropTypes.shape(ReportActionPropTypes).isRequired,

    // Transaction to display
    transaction: PropTypes.shape({

        // The transaction currency
        currency: PropTypes.string,

        // The transaction comment
        comment: PropTypes.string,

        // The transaction amount
        amount: PropTypes.number,

        // Was this transaction created by the current user
        createdByUser: PropTypes.bool,
    }).isRequired,

    // All of the personalDetails
    personalDetails: PropTypes.objectOf(personalDetailsPropType),
};

const defaultProps = {
    personalDetails: {},
};

class TransactionItem extends Component {
    constructor(props) {
        super(props);

        this.removeTransaction = this.removeTransaction.bind(this);
    }

    removeTransaction() {
        // TODO: delegate to parent
        console.debug('removeTransaction');
        rejectTransaction({
            reportID: 999,
            transactionID: 999999,
            comment: 'NO!',
        });
    }

    render() {
        const {avatar, displayName} = this.props.personalDetails[this.props.action.actorEmail] || {};
        const avatarUrl = this.props.action.automatic
            ? `${CONST.CLOUDFRONT_URL}/images/icons/concierge_2019.svg`

            // Use avatar in personalDetails if we have one then fallback to avatar provided by the action
            : (avatar || this.props.action.avatar);

        // Since the display name for a report action message is delivered with the report history as an array of fragments
        // we'll need to take the displayName from personal details and have it be in the same format for now. Eventually,
        // we should stop referring to the report history items entirely for this information.
        const personArray = displayName ? [{type: 'TEXT', text: displayName}] : this.props.action.person;
        console.debug('juless: ', this.props.action.message);
        return (
            <View styles={[styles.mb5]}>
                <View style={[styles.reportTransaction]}>
                    <Avatar
                        style={[styles.actionAvatar]}
                        source={avatarUrl}
                    />
                    <View style={[styles.chatItemRight]}>
                        <View style={[styles.chatItemMessageHeader]}>
                            {_.map(personArray, (fragment, index) => (
                                <ReportActionItemFragment
                                    key={`person-${this.props.action.sequenceNumber}-${index}`}
                                    fragment={fragment}
                                    tooltipText={this.props.action.actorEmail}
                                    isAttachment={this.props.action.isAttachment}
                                    isLoading={this.props.action.loading}
                                />
                            ))}
                            <ReportActionItemDate timestamp={this.props.action.timestamp} />
                        </View>
                        <Text style={[styles.chatItemMessage]}>
                            {this.props.action.message[0].text}
                        </Text>
                    </View>
                </View>
                <Pressable
                    style={[styles.button, styles.alignItemsStart, styles.mb3]}
                    onPress={() => this.removeTransaction()}
                >
                    <Text style={[styles.buttonSmallText]}>
                        {this.props.transaction.createdByUser ? 'Cancel' : 'Decline'}
                    </Text>
                </Pressable>
            </View>
        );
    }
}

TransactionItem.displayName = 'TransactionItem';
TransactionItem.defaultProps = defaultProps;
TransactionItem.propTypes = propTypes;
export default withOnyx({
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS,
    },
})(TransactionItem);