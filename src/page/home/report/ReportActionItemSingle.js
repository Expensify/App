import React from 'react';
import {View, Image} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import ReportActionPropTypes from './ReportActionPropTypes';
import ReportActionItemMessage from './ReportActionItemMessage';
import ReportActionItemFragment from './ReportActionItemFragment';
import styles from '../../../style/StyleSheet';
import CONST from '../../../CONST';
import ReportActionItemDate from './ReportActionItemDate';

const propTypes = {
    // All the data of the action
    action: PropTypes.shape(ReportActionPropTypes).isRequired,
};

class ReportActionItemSingle extends React.PureComponent {
    render() {
        const {action} = this.props;
        const avatarUrl = action.automatic
            ? `${CONST.CLOUDFRONT_URL}/images/icons/concierge_2019.svg`
            : action.avatar;
        return (
            <View style={[styles.chatItem]}>
                <View style={[styles.chatItemLeft]}>
                    <View style={[styles.actionAvatarWrapper]}>
                        <Image
                            source={{uri: avatarUrl}}
                            style={[styles.actionAvatar]}
                        />
                    </View>
                </View>
                <View style={[styles.chatItemRight]}>
                    <View style={[styles.chatItemMessageHeader]}>
                        {action.person.map(fragment => (
                            <View key={_.uniqueId('person-', action.sequenceNumber)}>
                                <ReportActionItemFragment fragment={fragment} />
                            </View>
                        ))}
                        <View>
                            <ReportActionItemDate timestamp={action.timestamp} />
                        </View>
                    </View>
                    <View style={[styles.chatItemMessage]}>
                        <ReportActionItemMessage action={action} />
                    </View>
                </View>
            </View>
        );
    }
}

ReportActionItemSingle.propTypes = propTypes;

export default ReportActionItemSingle;
