import PropTypes from 'prop-types';
import React, {
    createRef,
    forwardRef,
    useImperativeHandle,
} from 'react';
import {
    Animated,
    Dimensions, Platform,
    ScrollView,
    TextInput,
} from 'react-native';
import _ from 'underscore';
import Reanimated, {
    KeyboardState,
    runOnUI,
    useAnimatedKeyboard, useAnimatedStyle, useSharedValue, withSpring,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import InvertedFlatList from '../../../components/InvertedFlatList';
import withDrawerState, {
    withDrawerPropTypes,
} from '../../../components/withDrawerState';
import compose from '../../../libs/compose';
import * as ReportScrollManager from '../../../libs/ReportScrollManager';
import styles from '../../../styles/styles';
import * as ReportUtils from '../../../libs/ReportUtils';
import withWindowDimensions, {
    windowDimensionsPropTypes,
} from '../../../components/withWindowDimensions';
import {
    withNetwork,
    withPersonalDetails,
} from '../../../components/OnyxProvider';
import ReportActionItem from './ReportActionItem';
import ReportActionsSkeletonView from '../../../components/ReportActionsSkeletonView';
import variables from '../../../styles/variables';
import participantPropTypes from '../../../components/participantPropTypes';
import * as ReportActionsUtils from '../../../libs/ReportActionsUtils';
import reportActionPropTypes from './reportActionPropTypes';
import CONST from '../../../CONST';
import * as StyleUtils from '../../../styles/StyleUtils';
import reportPropTypes from '../../reportPropTypes';
import networkPropTypes from '../../../components/networkPropTypes';
import {popoverHeightSharedValue} from '../../../Expensify';

const KeyboardSpace = forwardRef((props, ref) => {
    const safeArea = useSafeAreaInsets();
    const keyboard = useAnimatedKeyboard();
    const lastKeyboardHeight = useSharedValue(0);
    const IS_ANDROID = Platform.OS === 'android';
    const {keyboardSpaceState} = props;
    const windowHeight = Dimensions.get('screen').height;

    useImperativeHandle(ref, () => ({
        storeKeyboard() {
            if (IS_ANDROID) {
                runOnUI(() => {
                    'worklet';

                    lastKeyboardHeight.value = keyboard.height.value;
                })();
            } else {
                lastKeyboardHeight.value = keyboard.height.value;
            }
        },
        clearKeyboard() {
            if (IS_ANDROID) {
                runOnUI(() => {
                    'worklet';

                    lastKeyboardHeight.value = 0;
                })();
            } else {
                lastKeyboardHeight.value = 0;
            }

            popoverHeightSharedValue.value = 0;
        },
    }));

    const ratio = 1.1;
    const mass = 0.4;
    const stiffness = IS_ANDROID ? 200.0 : 100.0;
    const damping = ratio * 2.0 * Math.sqrt(mass * stiffness);

    const config = {
        stiffness,
        damping,
        mass,
        restDisplacementThreshold: 1,
        restSpeedThreshold: 5,
    };

    const animatedStyle = useAnimatedStyle(() => {
        if (keyboardSpaceState.value == null) {
            return {
                height: 0,
            };
        }
        if (global.__keyboardHeight === undefined) {
            global.__keyboardHeight = 0;
        }
        if (keyboard.state.value === KeyboardState.OPEN) {
            global.__keyboardHeight = keyboard.height.value;
        }

        const {measurements, keyboardVisible} = keyboardSpaceState.value;

        if (!keyboardVisible) {
            // this means the bottom sheet was opened when the keyboard was closed
            const position = (popoverHeightSharedValue.value - (windowHeight - measurements.fy)) + measurements.height + safeArea.top;

            return {
                height: withSpring(position, config),
            };
        }

        const invertedHeight = keyboard.state.value === KeyboardState.CLOSED ? global.__keyboardHeight - safeArea.bottom : 0;

        const position = popoverHeightSharedValue.value
          - (windowHeight - measurements.fy)
          + measurements.height
          + global.__keyboardHeight
          + 20;

        return {
            height: invertedHeight,

            // state === KeyboardState.CLOSED && popoverHeightSharedValue.value > 0

            //     ? withSpring(position, config) : invertedHeight,
        };
    });

    return <Reanimated.View style={[animatedStyle]} />;
});

function ScrollComponent({
    children,
    keyboardSpacerRef,
    keyboardSpaceState,
    ...props
}) {
    return (
        <ScrollView {...props}>
            <KeyboardSpace
                keyboardSpaceState={keyboardSpaceState}
                ref={keyboardSpacerRef}
            />
            {children}
        </ScrollView>
    );
}

const propTypes = {
    /** Position of the "New" line marker */
    newMarkerReportActionID: PropTypes.string,

    /** Personal details of all the users */
    personalDetails: PropTypes.objectOf(participantPropTypes),

    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    /** Sorted actions prepared for display */
    sortedReportActions: PropTypes.arrayOf(PropTypes.shape(reportActionPropTypes)).isRequired,

    /** The ID of the most recent IOU report action connected with the shown report */
    mostRecentIOUReportActionID: PropTypes.string,

    /** Are we loading more report actions? */
    isLoadingMoreReportActions: PropTypes.bool,

    /** Callback executed on list layout */
    onLayout: PropTypes.func.isRequired,

    /** Callback executed on scroll */
    onScroll: PropTypes.func.isRequired,

    /** Function to load more chats */
    loadMoreChats: PropTypes.func.isRequired,

    /** Information about the network */
    network: networkPropTypes.isRequired,

    ...withDrawerPropTypes,
    ...windowDimensionsPropTypes,
};

const defaultProps = {
    newMarkerReportActionID: '',
    personalDetails: {},
    mostRecentIOUReportActionID: '',
    isLoadingMoreReportActions: false,
};

class ReportActionsList extends React.Component {
    constructor(props) {
        super(props);
        this.renderItem = this.renderItem.bind(this);
        this.keyExtractor = this.keyExtractor.bind(this);
        this.onReportShowPopover = this.onReportShowPopover.bind(this);
        this.onReportHidePopover = this.onReportHidePopover.bind(this);

        this.state = {
            fadeInAnimation: new Animated.Value(0),
            skeletonViewHeight: 0,
        };
    }

    componentDidMount() {
        this.fadeIn();
    }

    fadeIn() {
        Animated.timing(this.state.fadeInAnimation, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
        }).start();
    }

    keyboardSpacerRef = createRef();

    onReportShowPopover(index, measurements, keyboardVisible) {
        this.props.keyboardSpaceState.value = {
            measurements,
            height: this.state.skeletonViewHeight,
            keyboardVisible,
        };

        this.keyboardSpacerRef.current?.storeKeyboard();
    }

    onReportHidePopover() {
        this.keyboardSpacerRef.current?.clearKeyboard();

        if (Platform.OS === 'android') {
            //   this._input.focus();
        }
    }

    /**
     * Calculates the ideal number of report actions to render in the first render, based on the screen height and on
     * the height of the smallest report action possible.
     * @return {Number}
     */
    calculateInitialNumToRender() {
        const minimumReportActionHeight = styles.chatItem.paddingTop + styles.chatItem.paddingBottom
            + variables.fontSizeNormalHeight;
        const availableHeight = this.props.windowHeight
            - (CONST.CHAT_FOOTER_MIN_HEIGHT + variables.contentHeaderHeight);
        return Math.ceil(availableHeight / minimumReportActionHeight);
    }

    /**
     * Create a unique key for each action in the FlatList.
     * We use the reportActionID that is a string representation of a random 64-bit int, which should be
     * random enough to avoid collisions
     * @param {Object} item
     * @param {Object} item.action
     * @return {String}
     */
    keyExtractor(item) {
        return item.reportActionID;
    }

    /**
     * Do not move this or make it an anonymous function it is a method
     * so it will not be recreated each time we render an item
     *
     * See: https://reactnative.dev/docs/optimizing-flatlist-configuration#avoid-anonymous-function-on-renderitem
     *
     * @param {Object} args
     * @param {Number} args.index
     *
     * @returns {React.Component}
     */
    renderItem({
        item: reportAction,
        index,
    }) {
        // When the new indicator should not be displayed we explicitly set it to null
        const shouldDisplayNewMarker = reportAction.reportActionID === this.props.newMarkerReportActionID;
        return (
            <ReportActionItem
                onShowPopover={this.onReportShowPopover}
                onHidePopover={this.onReportHidePopover}
                report={this.props.report}
                action={reportAction}
                displayAsGroup={ReportActionsUtils.isConsecutiveActionMadeByPreviousActor(this.props.sortedReportActions, index)}
                shouldDisplayNewMarker={shouldDisplayNewMarker}
                isMostRecentIOUReportAction={reportAction.reportActionID === this.props.mostRecentIOUReportActionID}
                hasOutstandingIOU={this.props.report.hasOutstandingIOU}
                index={index}
            />
        );
    }

    render() {
        // Native mobile does not render updates flatlist the changes even though component did update called.
        // To notify there something changes we can use extraData prop to flatlist
        const extraData = (!this.props.isDrawerOpen && this.props.isSmallScreenWidth) ? this.props.newMarkerReportActionID : undefined;
        const shouldShowReportRecipientLocalTime = ReportUtils.canShowReportRecipientLocalTime(this.props.personalDetails, this.props.report);
        return (
            <Animated.View style={[StyleUtils.fade(this.state.fadeInAnimation), styles.flex1]}>
                <InvertedFlatList
                    accessibilityLabel="List of chat messages"
                    ref={ReportScrollManager.flatListRef}
                    data={this.props.sortedReportActions}
                    renderItem={this.renderItem}
                    contentContainerStyle={[
                        styles.chatContentScrollView,
                        shouldShowReportRecipientLocalTime && styles.pt0,
                    ]}
                    renderScrollComponent={props => (
                        <ScrollComponent
                            keyboardSpaceState={this.props.keyboardSpaceState}
                            keyboardSpacerRef={this.keyboardSpacerRef}
                            animatedRefs={this.animatedRefs}
                            {...props}
                        />
                    )}
                    keyExtractor={this.keyExtractor}
                    initialRowHeight={32}
                    initialNumToRender={this.calculateInitialNumToRender()}
                    onEndReached={this.props.loadMoreChats}
                    onEndReachedThreshold={0.75}
                    ListFooterComponent={() => {
                        if (this.props.report.isLoadingMoreReportActions) {
                            return (
                                <ReportActionsSkeletonView
                                    containerHeight={CONST.CHAT_SKELETON_VIEW.AVERAGE_ROW_HEIGHT * 3}
                                />
                            );
                        }

                        // Make sure the oldest report action loaded is not the first. This is so we do not show the
                        // skeleton view above the created action in a newly generated optimistic chat or one with not
                        // that many comments.
                        const lastReportAction = _.last(this.props.sortedReportActions) || {};
                        if (this.props.report.isLoadingReportActions && lastReportAction.actionName !== CONST.REPORT.ACTIONS.TYPE.CREATED) {
                            return (
                                <ReportActionsSkeletonView
                                    containerHeight={this.state.skeletonViewHeight}
                                    animate={!this.props.network.isOffline}
                                />
                            );
                        }

                        return null;
                    }}
                    keyboardShouldPersistTaps="handled"
                    onLayout={(event) => {
                        this.setState({
                            skeletonViewHeight: event.nativeEvent.layout.height,
                        });
                        this.props.onLayout(event);
                    }}
                    onScroll={this.props.onScroll}
                    extraData={extraData}
                />
            </Animated.View>
        );
    }
}

ReportActionsList.propTypes = propTypes;
ReportActionsList.defaultProps = defaultProps;

function withSharedValue(name, initialValue) {
    return WrappedComponent => function (props) {
        const passProps = {
            [name]: useSharedValue(initialValue),
        };

        return <WrappedComponent {...props} {...passProps} />;
    };
}

export default compose(
    withDrawerState,
    withWindowDimensions,
    withPersonalDetails(),
    withNetwork(),
    withSharedValue('keyboardSpaceState', null),
)(ReportActionsList);
