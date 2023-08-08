import React, {memo} from 'react';
import {View} from 'react-native';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import Animated, {useSharedValue, useAnimatedStyle, useAnimatedSensor, SensorType, withSpring} from 'react-native-reanimated';
import ONYXKEYS from '../../../ONYXKEYS';
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
import withLocalize from '../../../components/withLocalize';
import PressableWithoutFeedback from '../../../components/Pressable/PressableWithoutFeedback';
import useWindowDimensions from '../../../hooks/useWindowDimensions';
import MultipleAvatars from '../../../components/MultipleAvatars';
import CONST from '../../../CONST';
import * as NumberUtils from '../../../libs/NumberUtils';

const propTypes = {
    /** The id of the report */
    reportID: PropTypes.string.isRequired,

    /** The report currently being looked at */
    report: reportPropTypes,

    /** Personal details of all the users */
    personalDetails: PropTypes.objectOf(participantPropTypes),

    /** The policy object for the current route */
    policy: PropTypes.shape({
        /** The name of the policy */
        name: PropTypes.string,

        /** The URL for the policy avatar */
        avatar: PropTypes.string,
    }),

    ...windowDimensionsPropTypes,
};
const defaultProps = {
    report: {},
    personalDetails: {},
    policy: {},
};

const IMAGE_OFFSET_Y = 75;
const ANIMATION_BOOST = 1.3;

function ReportActionItemCreated(props) {
    const {windowWidth, isSmallScreenWidth} = useWindowDimensions();
    const IMAGE_OFFSET_X = windowWidth / 2;

    // Get data from phone rotation sensor and prep other variables for animation
    const animatedSensor = useAnimatedSensor(SensorType.GYROSCOPE);
    const xOffset = useSharedValue(0);
    const yOffset = useSharedValue(0);

    // Apply data to create style object
    const animatedStyles = useAnimatedStyle(() => {
        /*
         * We use x and y gyroscope velocity and add it to position offset to move background based on device movements.
         * Position the phone was in while entering the screen is the initial position for background image.
         */
        const {x, y} = animatedSensor.sensor.value;
        // The x vs y here seems wrong but is the way to make it feel right to the user
        xOffset.value = NumberUtils.clampWorklet(xOffset.value - y * ANIMATION_BOOST, -IMAGE_OFFSET_X, IMAGE_OFFSET_X);
        yOffset.value = NumberUtils.clampWorklet(yOffset.value - x * ANIMATION_BOOST, -IMAGE_OFFSET_Y, IMAGE_OFFSET_Y);
        if (!isSmallScreenWidth) {
            return {};
        }
        return {
            transform: [{translateX: withSpring(-IMAGE_OFFSET_X - xOffset.value)}, {translateY: withSpring(yOffset.value)}],
        };
    });

    if (!ReportUtils.isChatReport(props.report)) {
        return null;
    }

    const icons = ReportUtils.getIcons(props.report, props.personalDetails);
    const shouldDisableDetailPage = ReportUtils.shouldDisableDetailPage(props.report);

    return (
        <OfflineWithFeedback
            pendingAction={lodashGet(props.report, 'pendingFields.addWorkspaceRoom') || lodashGet(props.report, 'pendingFields.createChat')}
            errors={lodashGet(props.report, 'errorFields.addWorkspaceRoom') || lodashGet(props.report, 'errorFields.createChat')}
            errorRowStyles={[styles.ml10, styles.mr2]}
            onClose={() => Report.navigateToConciergeChatAndDeleteReport(props.report.reportID)}
            needsOffscreenAlphaCompositing
        >
            <View style={StyleUtils.getReportWelcomeContainerStyle(props.isSmallScreenWidth)}>
                <Animated.Image
                    pointerEvents="none"
                    source={EmptyStateBackgroundImage}
                    style={[StyleUtils.getReportWelcomeBackgroundImageStyle(props.isSmallScreenWidth), animatedStyles]}
                />
                <View
                    accessibilityLabel={props.translate('accessibilityHints.chatWelcomeMessage')}
                    style={[styles.p5, StyleUtils.getReportWelcomeTopMarginStyle(props.isSmallScreenWidth)]}
                >
                    <PressableWithoutFeedback
                        onPress={() => ReportUtils.navigateToDetailsPage(props.report)}
                        style={[styles.mh5, styles.mb3, styles.alignSelfStart]}
                        accessibilityLabel={props.translate('common.details')}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                        disabled={shouldDisableDetailPage}
                    >
                        <MultipleAvatars
                            icons={icons}
                            size={props.isLargeScreenWidth || (icons && icons.length < 3) ? CONST.AVATAR_SIZE.LARGE : CONST.AVATAR_SIZE.MEDIUM}
                            shouldStackHorizontally
                            shouldDisplayAvatarsInRows={props.isSmallScreenWidth}
                            maxAvatarsInRow={props.isSmallScreenWidth ? CONST.AVATAR_ROW_SIZE.DEFAULT : CONST.AVATAR_ROW_SIZE.LARGE_SCREEN}
                        />
                    </PressableWithoutFeedback>
                    <View style={[styles.ph5]}>
                        <ReportWelcomeText report={props.report} />
                    </View>
                </View>
            </View>
        </OfflineWithFeedback>
    );
}

ReportActionItemCreated.defaultProps = defaultProps;
ReportActionItemCreated.propTypes = propTypes;
ReportActionItemCreated.displayName = 'ReportActionItemCreated';

export default compose(
    withWindowDimensions,
    withLocalize,
    withOnyx({
        report: {
            key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
        },
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
        policy: {
            key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
        },
    }),
)(
    memo(
        ReportActionItemCreated,
        (prevProps, nextProps) =>
            lodashGet(prevProps.props, 'policy.name') === lodashGet(nextProps, 'policy.name') &&
            lodashGet(prevProps.props, 'policy.avatar') === lodashGet(nextProps, 'policy.avatar') &&
            lodashGet(prevProps.props, 'report.lastReadTime') === lodashGet(nextProps, 'report.lastReadTime') &&
            lodashGet(prevProps.props, 'report.statusNum') === lodashGet(nextProps, 'report.statusNum') &&
            lodashGet(prevProps.props, 'report.stateNum') === lodashGet(nextProps, 'report.stateNum'),
    ),
);
