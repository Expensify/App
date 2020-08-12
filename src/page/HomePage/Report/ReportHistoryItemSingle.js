import React from 'react';
import {View, Image, Text} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import ReportHistoryPropsTypes from './ReportHistoryPropsTypes';
import ReportHistoryItemMessage from './ReportHistoryItemMessage';
import ReportHistoryItemFragment from './ReportHistoryItemFragment';
import styles from '../../../style/StyleSheet';
import CONST from '../../../CONST';
import ReportHistoryItemDate from './ReportHistoryItemDate';

const propTypes = {
    // All the data of the history item
    historyItem: PropTypes.shape(ReportHistoryPropsTypes).isRequired,
};

const ReportHistoryItemSingle = ({historyItem}) => {
    const avatarUrl = historyItem.automatic
        ? `${CONST.CLOUDFRONT_URL}/images/icons/concierge_2019.svg`
        : historyItem.avatar;
    return (
        <View style={[styles.chatItem]}>
            <View style={[styles.flexRow]}>
                <View style={[styles.historyItemAvatarWrapper]}>
                    <Image
                        source={{uri: avatarUrl}}
                        style={[styles.historyItemAvatar]}
                    />
                </View>
                <View style={[styles.flexRow]}>
                    <View style={[styles.p1]}>
                        {historyItem.person.map(fragment => (
                            <ReportHistoryItemFragment
                                key={_.uniqueId('person-', historyItem.sequenceNumber)}
                                fragment={fragment}
                            />
                        ))}
                    </View>
                    <View style={[styles.p1, styles.flexGrow1]}>
                        <ReportHistoryItemDate timestamp={historyItem.timestamp} />
                    </View>
                </View>
            </View>
            <Text style={[styles.historyItemMessageWrapper]}>
                <ReportHistoryItemMessage historyItem={historyItem} />
            </Text>
        </View>
    );
};

ReportHistoryItemSingle.propTypes = propTypes;

export default ReportHistoryItemSingle;
