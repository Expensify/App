import React, {Suspense, lazy} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import ReportActionPropTypes from './ReportActionPropTypes';
import ReportActionItemMessage from './ReportActionItemMessage';
import ReportActionItemFragment from './ReportActionItemFragment';
import styles from '../../../styles/styles';
import CONST from '../../../CONST';
import Avatar from '../../../components/Avatar';

const ReportActionItemDate = lazy(() => import('./ReportActionItemDate'));

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
                            isAttachment={action.isAttachment}
                            isLoading={action.loading}
                        />
                    ))}
                    <Suspense fallback={<View />}>
                        <ReportActionItemDate timestamp={action.timestamp} />
                    </Suspense>
                </View>
                <ReportActionItemMessage action={action} />
            </View>
        </View>
    );
};

ReportActionItemSingle.propTypes = propTypes;
export default ReportActionItemSingle;
