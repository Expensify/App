import React from 'react';
import {View, Pressable, Text} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import styles from '../../../styles/styles';
import * as Report from '../../../libs/actions/Report';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import CONST from '../../../CONST';
import avatarPropTypes from '../../../components/avatarPropTypes';
import MultipleAvatars from '../../../components/MultipleAvatars';

const propTypes = {
    /** List of participant icons for the thread */
    icons: PropTypes.arrayOf(avatarPropTypes).isRequired,

    /** Number of comments under the thread */
    numberOfReplies: PropTypes.number.isRequired,

    /** Time of the most recent reply */
    mostRecentReply: PropTypes.string.isRequired,

    /** ID of child thread report */
    childReportID: PropTypes.string.isRequired,

    /** localization props */
    ...withLocalizePropTypes,
};

const ReportActionItemThread = (props) => (
    <View style={[styles.chatItemMessage]}>
        <Pressable
            onPress={() => {
                Report.navigateToAndOpenChildReport(props.childReportID);
            }}
        >
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.mt2]}>
                <MultipleAvatars
                    size={CONST.AVATAR_SIZE.SMALLER}
                    icons={props.icons}
                    shouldStackHorizontally
                    avatarTooltips={_.map(props.icons, (icon) => icon.name)}
                />
                <View style={[styles.flexRow, styles.lh140Percent, styles.alignItemsEnd]}>
                    <Text
                        selectable={false}
                        style={[styles.link, styles.ml2, styles.h4]}
                    >
                        {`${props.numberOfReplies} ${props.numberOfReplies === 1 ? props.translate('threads.reply') : props.translate('threads.replies')}`}
                    </Text>
                    <Text
                        selectable={false}
                        style={[styles.ml2, styles.textMicroSupporting]}
                    >{`${props.translate('threads.lastReply')} ${props.datetimeToCalendarTime(props.mostRecentReply)}`}</Text>
                </View>
            </View>
        </Pressable>
    </View>
);

ReportActionItemThread.propTypes = propTypes;
ReportActionItemThread.displayName = 'ReportActionItemThread';

export default withLocalize(ReportActionItemThread);
