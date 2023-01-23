import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Text from './Text';
import styles from '../styles/styles';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import reportPropTypes from '../pages/reportPropTypes';
import * as Report from '../libs/actions/Report';
import Avatar from './Avatar';
import Button from './Button';
import * as ReportUtils from '../libs/ReportUtils';
import CONST from '../CONST';
import compose from '../libs/compose';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';

const propTypes = {
    /** Report object for the current report */
    report: reportPropTypes,

    /** The policies which the user has access to and which the report could be tied to */
    policies: PropTypes.shape({
        /** Name of the policy */
        name: PropTypes.string,
    }),

    ...windowDimensionsPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    report: {reportID: '0'},
    policies: {},
};

const JoinRoomPrompt = (props) => {
    const icons = ReportUtils.getIcons(props.report);
    const subtitle = `${ReportUtils.getChatRoomSubtitle(props.report, props.policies)} - ${props.report.participants.length} member${props.report.participants.length > 1 ? 's' : ''}`;

    return (
        <View style={[styles.joinRoomPromptContainer, props.isSmallScreenWidth && styles.flexColumn]}>
            <View style={[styles.dFlex, styles.flexRow, styles.flex1, props.isSmallScreenWidth && [styles.flexShrink0, styles.mb2]]}>
                <Avatar
                    source={icons[0]}
                    size={CONST.AVATAR_SIZE.MEDIUM}
                    containerStyles={[styles.mr3]}
                />
                <View style={styles.joinRoomPromptTextContainer}>
                    <Text
                        style={[styles.textHeadline, styles.flexShrink0]}
                        numberOfLines={1}
                    >
                        {props.report.displayName}
                    </Text>
                    <Text
                        style={[
                            styles.sidebarLinkText,
                            styles.optionAlternateText,
                            styles.textLabelSupporting,
                            styles.flex1,
                        ]}
                    >
                        {subtitle}
                    </Text>
                </View>
            </View>
            <View style={styles.joinRoomPromptButtonContainer}>
                <Button
                    innerStyles={[styles.m1]}
                    text={props.translate('common.details')}
                    medium
                    onPress={() => Navigation.navigate(ROUTES.getReportDetailsRoute(props.report.reportID))}
                    style={[props.isSmallScreenWidth && styles.flexGrow1]}
                />
                <Button
                    success
                    innerStyles={[styles.m1]}
                    text={props.translate('joinRoomPrompt.joinRoom')}
                    medium
                    onPress={() => Report.joinWorkspaceRoom(props.report)}
                    pressOnEnter
                    style={[props.isSmallScreenWidth && styles.flexGrow1]}
                />
            </View>
        </View>
    );
};

JoinRoomPrompt.displayName = 'JoinRoomPrompt';
JoinRoomPrompt.propTypes = propTypes;
JoinRoomPrompt.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withLocalize,
)(JoinRoomPrompt);
