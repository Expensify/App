import React from 'react';
import {View, Pressable, Text} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import * as Report from '../../../libs/actions/Report';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import CONST from '../../../CONST';
import avatarPropTypes from '../../../components/avatarPropTypes';
import MultipleAvatars from '../../../components/MultipleAvatars';
import compose from '../../../libs/compose';

const propTypes = {
    /** List of participant icons for the thread */
    icons: PropTypes.arrayOf(avatarPropTypes).isRequired,

    /** Number of comments under the thread */
    numberOfReplies: PropTypes.number.isRequired,

    /** Time of the most recent reply */
    mostRecentReply: PropTypes.string.isRequired,

    /** ID of child thread report */
    childReportID: PropTypes.string.isRequired,

    /** Whether the thread item / message is being hovered */
    isHovered: PropTypes.bool.isRequired,

    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
};

const ReportActionItemThread = (props) => {
    const numberOfRepliesText = props.numberOfReplies > CONST.MAX_THREAD_REPLIES_PREVIEW ? `${CONST.MAX_THREAD_REPLIES_PREVIEW}+` : `${props.numberOfReplies}`;
    const replyText = props.numberOfReplies === 1 ? props.translate('threads.reply') : props.translate('threads.replies');

    const timeStamp = props.datetimeToCalendarTime(props.mostRecentReply, false, true);

    return (
        <View style={[styles.chatItemMessage]}>
            <Pressable
                onPress={() => {
                    Report.navigateToAndOpenChildReport(props.childReportID);
                }}
            >
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mt2]}>
                    <MultipleAvatars
                        size={CONST.AVATAR_SIZE.SMALL}
                        icons={props.icons}
                        shouldStackHorizontally
                        isHovered={props.isHovered}
                        isInReportAction
                    />
                    <View style={[styles.flex1, styles.flexRow, styles.lh140Percent, styles.alignItemsEnd]}>
                        <Text
                            selectable={false}
                            style={[styles.link, styles.ml2, styles.h4, styles.noWrap]}
                        >
                            {`${numberOfRepliesText} ${replyText}`}
                        </Text>
                        <Text
                            selectable={false}
                            numberOfLines={1}
                            style={[styles.ml2, styles.textMicroSupporting, styles.flex1]}
                        >{`${props.translate('threads.lastReply')} ${timeStamp}`}</Text>
                    </View>
                </View>
            </Pressable>
        </View>
    );
};

ReportActionItemThread.propTypes = propTypes;
ReportActionItemThread.displayName = 'ReportActionItemThread';

export default compose(withLocalize, withWindowDimensions)(ReportActionItemThread);
