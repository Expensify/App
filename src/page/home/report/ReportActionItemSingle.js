import React from 'react';
import {View, Image} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import ReportHistoryPropsTypes from './ReportActionPropsTypes';
import ReportActionItemMessage from './ReportActionItemMessage';
import ReportActionItemFragment from './ReportActionItemFragment';
import styles from '../../../style/StyleSheet';
import CONST from '../../../CONST';
import ReportActionItemDate from './ReportActionItemDate';

const propTypes = {
    // All the data of the history item
    historyItem: PropTypes.shape(ReportHistoryPropsTypes).isRequired,
};

class ReportActionItemSingle extends React.PureComponent {
    render() {
        const {historyItem} = this.props;
        const avatarUrl = historyItem.automatic
            ? `${CONST.CLOUDFRONT_URL}/images/icons/concierge_2019.svg`
            : historyItem.avatar;
        return (
            <View style={[styles.chatItem]}>
                <View style={[styles.chatItemLeft]}>
                    <View style={[styles.historyItemAvatarWrapper]}>
                        <Image
                            source={{uri: avatarUrl}}
                            style={[styles.historyItemAvatar]}
                        />
                    </View>
                </View>
                <View style={[styles.chatItemRight]}>
                    <View style={[styles.chatItemMessageHeader]}>
                        {historyItem.person.map(fragment => (
                            <View key={_.uniqueId('person-', historyItem.sequenceNumber)}>
                                <ReportActionItemFragment fragment={fragment} />
                            </View>
                        ))}
                        <View>
                            <ReportActionItemDate timestamp={historyItem.timestamp} />
                        </View>
                    </View>
                    <View style={[styles.chatItemMessage]}>
                        <ReportActionItemMessage historyItem={historyItem} />
                    </View>
                </View>
            </View>
        );
    }
}

ReportActionItemSingle.propTypes = propTypes;

export default ReportActionItemSingle;
