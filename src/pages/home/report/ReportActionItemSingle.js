import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import ReportActionPropTypes from './ReportActionPropTypes';
import ReportActionItemMessage from './ReportActionItemMessage';
import ReportActionItemFragment from './ReportActionItemFragment';
import styles from '../../../styles/styles';
import CONST from '../../../CONST';
import ReportActionItemDate from './ReportActionItemDate';
import Avatar from '../../../components/Avatar';

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
            <Avatar
                style={[styles.actionAvatar]}
                source={avatarUrl}
            />
            <View style={[styles.chatItemRight]}>
                <View style={[styles.chatItemMessageHeader]}>
                    {_.map(action.person, (fragment, index) => (
                        <ReportActionItemFragment
                            key={`person-${action.sequenceNumber}-${index}`}
                            fragment={fragment}
                            tooltipText={action.actorEmail}
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
