import React from 'react';
import {View, Pressable, Text} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import ONYXKEYS from '../../../ONYXKEYS';
import styles from '../../../styles/styles';
import * as Report from '../../../libs/actions/Report';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import CONST from '../../../CONST';
import MultipleAvatars from '../../../components/MultipleAvatars';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import reportActionPropTypes from './reportActionPropTypes';
import personalDetailsPropType from '../../personalDetailsPropType';
import compose from '../../../libs/compose';
import * as ReportUtils from '../../../libs/ReportUtils';

const propTypes = {
    /** ID of parent (current) action  */
    reportActionID: PropTypes.string.isRequired,

    /** ID of child thread report */
    // eslint-disable-next-line react/no-unused-prop-types
    childReportID: PropTypes.string.isRequired,

    /** ID of parent thread report */
    // eslint-disable-next-line react/no-unused-prop-types
    reportID: PropTypes.string.isRequired,

    /** All of the personalDetails */
    personalDetails: PropTypes.objectOf(personalDetailsPropType),

    /** ONYX Props */

    /** ID of parent thread report */
    // eslint-disable-next-line react/no-unused-prop-types
    reportActions: PropTypes.objectOf(PropTypes.shape(reportActionPropTypes)),

    // eslint-disable-next-line react/no-unused-prop-types
    childReportActions: PropTypes.objectOf(PropTypes.shape(reportActionPropTypes)),

    /** localization props */
    ...withLocalizePropTypes,
};

const defaultProps = {
    childReportActions: {},
    reportActions: {},
    personalDetails: {},
};

const ReportActionItemThread = (props) => {
    const action = lodashGet(props.reportActions, props.reportActionID, {});
    const oldestFourEmails = lodashGet(action, 'childOldestFourEmails', '').split(',');
    const childReportID = `${action.childReportID}`;
    const numberOfReplies = action.childVisibleActionCount || 0;
    const mostRecentReply = `${action.childLastVisibleActionCreated}`;
    const icons = ReportUtils.getIconsForParticipants(oldestFourEmails, props.personalDetails);

    return (
        <View style={[styles.chatItemMessage]}>
            <Pressable
                onPress={() => {
                    Report.openReport(childReportID);
                    Navigation.navigate(ROUTES.getReportRoute(childReportID));
                }}
            >
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mt2]}>
                    <MultipleAvatars
                        size={CONST.AVATAR_SIZE.SMALLER}
                        icons={icons}
                        shouldStackHorizontally
                        avatarTooltips={_.map(icons, (icon) => icon.name)}
                    />
                    <View style={[styles.flexRow, styles.lh140Percent, styles.alignItemsEnd]}>
                        <Text
                            selectable={false}
                            style={[styles.link, styles.ml2, styles.h4]}
                        >
                            {`${numberOfReplies} ${numberOfReplies === 1 ? props.translate('threads.reply') : props.translate('threads.replies')}`}
                        </Text>
                        <Text
                            selectable={false}
                            style={[styles.ml2, styles.textMicroSupporting]}
                        >{`${props.translate('threads.lastReply')} ${props.datetimeToCalendarTime(mostRecentReply)}`}</Text>
                    </View>
                </View>
            </Pressable>
        </View>
    );
};
ReportActionItemThread.defaultProps = defaultProps;
ReportActionItemThread.propTypes = propTypes;
ReportActionItemThread.displayName = 'ReportActionItemThread';

export default compose(
    withLocalize,
    withOnyx({
        childReportActions: {
            key: ({childReportID}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${childReportID}`,
            canEvict: false,
        },
        reportActions: {
            key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            canEvict: false,
        },
    }),
)(ReportActionItemThread);
