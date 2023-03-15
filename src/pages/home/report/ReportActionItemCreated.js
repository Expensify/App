import React from 'react';
import {Pressable, View} from 'react-native';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import Animated, {
    useSharedValue, useAnimatedStyle, useAnimatedSensor, SensorType, withSpring,
} from 'react-native-reanimated';
import ONYXKEYS from '../../../ONYXKEYS';
import RoomHeaderAvatars from '../../../components/RoomHeaderAvatars';
import ReportWelcomeText from '../../../components/ReportWelcomeText';
import participantPropTypes from '../../../components/participantPropTypes';
import * as ReportUtils from '../../../libs/ReportUtils';
import styles from '../../../styles/styles';
import OfflineWithFeedback from '../../../components/OfflineWithFeedback';
import * as Report from '../../../libs/actions/Report';
import reportPropTypes from '../../reportPropTypes';
import EmptyStateBackgroundImage from '../../../../assets/images/empty-state_background-fade.png';
import * as StyleUtils from '../../../styles/StyleUtils';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import compose from '../../../libs/compose';

const propTypes = {
    /** The id of the report */
    reportID: PropTypes.string.isRequired,

    /** The report currently being looked at */
    report: reportPropTypes,

    /** Personal details of all the users */
    personalDetails: PropTypes.objectOf(participantPropTypes),

    /** The policies which the user has access to and which the report could be tied to */
    policies: PropTypes.shape({
        /** Name of the policy */
        name: PropTypes.string,
    }),

    ...windowDimensionsPropTypes,
};
const defaultProps = {
    report: {},
    personalDetails: {},
    policies: {},
};

const ReportActionItemCreated = (props) => {
    const icons = ReportUtils.getIcons(props.report, props.personalDetails, props.policies);

    // Get data from phone rotation sensor and prep other variables for animation
    const animatedSensor = useAnimatedSensor(SensorType.ROTATION);
    const offsetX = useSharedValue((-props.windowWidth / 2));
    const offsetY = useSharedValue(65);

    // Apply data to create style object
    const animatedStyles = useAnimatedStyle(() => {
        const {qx, qy} = animatedSensor.sensor.value;
        if (props.isSmallScreenWidth) {
            return {
                transform: [
                    // The x vs y here seems wrong but is the way to make it feel right to the user
                    {translateX: withSpring(offsetX.value - (qy * 65))},
                    {translateY: withSpring(offsetY.value - (qx * 65))},
                ],
            };
        }
        return {};
    });

    return (
        <OfflineWithFeedback
            pendingAction={lodashGet(props.report, 'pendingFields.addWorkspaceRoom') || lodashGet(props.report, 'pendingFields.createChat')}
            errors={lodashGet(props.report, 'errorFields.addWorkspaceRoom') || lodashGet(props.report, 'errorFields.createChat')}
            errorRowStyles={[styles.ml10, styles.mr2]}
            onClose={() => Report.navigateToConciergeChatAndDeleteReport(props.report.reportID)}
        >
            <View style={StyleUtils.getReportWelcomeContainerStyle(props.isSmallScreenWidth)}>
                <Animated.Image
                    pointerEvents="none"
                    source={EmptyStateBackgroundImage}
                    style={[StyleUtils.getReportWelcomeBackgroundImageStyle(props.isSmallScreenWidth), animatedStyles]}
                />
                <View
                    accessibilityLabel="Chat welcome message"
                    style={[styles.p5, StyleUtils.getReportWelcomeTopMarginStyle(props.isSmallScreenWidth)]}
                >
                    <Pressable
                        onPress={() => ReportUtils.navigateToDetailsPage(props.report)}
                        style={[styles.ph5, styles.pb3, styles.alignSelfStart]}
                    >
                        <RoomHeaderAvatars
                            icons={icons}
                        />
                    </Pressable>
                    <View style={[styles.ph5]}>
                        <ReportWelcomeText report={props.report} />
                    </View>
                </View>
            </View>
        </OfflineWithFeedback>
    );
};

ReportActionItemCreated.defaultProps = defaultProps;
ReportActionItemCreated.propTypes = propTypes;
ReportActionItemCreated.displayName = 'ReportActionItemCreated';

export default compose(
    withWindowDimensions,
    withOnyx({
        report: {
            key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
        },
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
        policies: {
            key: ONYXKEYS.COLLECTION.POLICY,
        },
    }),
)(ReportActionItemCreated);
