import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Text from './Text';
import styles from '../styles/styles';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import reportPropTypes from '../pages/reportPropTypes';
import Avatar from './Avatar';
import * as ReportUtils from '../libs/ReportUtils';
import CONST from '../CONST';

const propTypes = {
    /** Report object for the current report */
    report: reportPropTypes,

    /** The policies which the user has access to and which the report could be tied to */
    policies: PropTypes.shape({
        /** Name of the policy */
        name: PropTypes.string,
    }),

    /** Offline status */
    isOffline: PropTypes.bool.isRequired,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    report: {reportID: '0'},
    policies: {},
};

const JoinRoomPrompt = (props) => {
    const icons = ReportUtils.getIcons(props.report);
    const subtitle = ReportUtils.getChatRoomSubtitle(props.report, props.policies);

    return (
        <View style={styles.joinRoomPromptContainer}>
            <View style={[styles.dFlex, styles.flexRow, styles.flex1]}>
                <Avatar
                    source={icons[0]}
                    size={CONST.AVATAR_SIZE.MEDIUM}
                    containerStyles={[styles.mr3]}
                />
                <View style={styles.joinRoomPromptTextContainer}>
                    <Text style={[styles.textHeadline]} numberOfLines={1}>
                        {props.report.displayName}
                    </Text>
                    <Text
                        style={[
                            styles.sidebarLinkText,
                            styles.optionAlternateText,
                            styles.textLabelSupporting,
                        ]}
                    >
                        {subtitle}
                    </Text>
                </View>
            </View>
            <View style={[styles.flex1]}>

            </View>
        </View>
    );
    
};

JoinRoomPrompt.displayName = 'JoinRoomPrompt';
JoinRoomPrompt.propTypes = propTypes;
JoinRoomPrompt.defaultProps = defaultProps;

export default withWindowDimensions(JoinRoomPrompt);
