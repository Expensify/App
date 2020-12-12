import React from 'react';
import {View, Image} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import ReportActionPropTypes from './ReportActionPropTypes';
import ReportActionItemMessage from './ReportActionItemMessage';
import ReportActionItemFragment from './ReportActionItemFragment';
import styles from '../../../styles/StyleSheet';
import CONST from '../../../CONST';
import ReportActionItemDate from './ReportActionItemDate';

const propTypes = {
    // All the data of the action
    action: PropTypes.shape(ReportActionPropTypes).isRequired,
};

const ReportActionItemSingle = ({action}) => {
    const avatarUrl = action.automatic
        ? `${CONST.CLOUDFRONT_URL}/images/icons/concierge_2019.svg`
        : action.avatar;
    return (
        <View style={[styles.chatItem]}>
            <Image
                source={{uri: avatarUrl}}
                style={[styles.actionAvatar]}
            />
            <View style={[styles.chatItemRight]}>
                <View style={[styles.chatItemMessageHeader]}>
                    {_.map(action.person, (fragment, index) => (
                        <ReportActionItemFragment
                            key={`person-${action.sequenceNumber}-${index}`}
                            fragment={fragment}
                            isAttachment={action.isAttachment}
                            isLoading={action.loading}
                        />
                    ))}
                    <ReportActionItemDate timestamp={action.timestamp} />
                </View>
                <ReportActionItemMessage action={action} />
            </View>
        </View>
    );
};

ReportActionItemSingle.propTypes = propTypes;
export default ReportActionItemSingle;
