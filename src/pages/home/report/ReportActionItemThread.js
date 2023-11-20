import PropTypes from 'prop-types';
import React from 'react';
import {Text, View} from 'react-native';
import avatarPropTypes from '@components/avatarPropTypes';
import MultipleAvatars from '@components/MultipleAvatars';
import PressableWithSecondaryInteraction from '@components/PressableWithSecondaryInteraction';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '@components/withWindowDimensions';
import compose from '@libs/compose';
import useThemeStyles from '@styles/useThemeStyles';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';

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

    /** The function that should be called when the thread is LongPressed or right-clicked */
    onSecondaryInteraction: PropTypes.func.isRequired,

    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
};

function ReportActionItemThread(props) {
    const styles = useThemeStyles();
    const numberOfRepliesText = props.numberOfReplies > CONST.MAX_THREAD_REPLIES_PREVIEW ? `${CONST.MAX_THREAD_REPLIES_PREVIEW}+` : `${props.numberOfReplies}`;
    const replyText = props.numberOfReplies === 1 ? props.translate('threads.reply') : props.translate('threads.replies');

    const timeStamp = props.datetimeToCalendarTime(props.mostRecentReply, false);

    return (
        <View style={[styles.chatItemMessage]}>
            <PressableWithSecondaryInteraction
                onPress={() => {
                    Report.navigateToAndOpenChildReport(props.childReportID);
                }}
                role={CONST.ACCESSIBILITY_ROLE.BUTTON}
                accessibilityLabel={`${props.numberOfReplies} ${replyText}`}
                onSecondaryInteraction={props.onSecondaryInteraction}
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
                            style={[styles.link, styles.ml2, styles.h4, styles.noWrap, styles.userSelectNone]}
                            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                        >
                            {`${numberOfRepliesText} ${replyText}`}
                        </Text>
                        <Text
                            numberOfLines={1}
                            style={[styles.ml2, styles.textMicroSupporting, styles.flex1, styles.userSelectNone]}
                            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                        >
                            {timeStamp}
                        </Text>
                    </View>
                </View>
            </PressableWithSecondaryInteraction>
        </View>
    );
}

ReportActionItemThread.propTypes = propTypes;
ReportActionItemThread.displayName = 'ReportActionItemThread';

export default compose(withLocalize, withWindowDimensions)(ReportActionItemThread);
