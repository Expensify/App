import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import {Platform, StyleSheet} from 'react-native';
import Animated, {runOnJS, useAnimatedStyle, useSharedValue, withDelay, withTiming} from 'react-native-reanimated';
import ReportActionsSkeletonView from '../../../components/ReportActionsSkeletonView';
import useWindowDimensions from '../../../hooks/useWindowDimensions';
import themeColors from '../../../styles/themes/default';
import reportPropTypes from '../../reportPropTypes';
import reportActionPropTypes from './reportActionPropTypes';
import ReportActionsView from './ReportActionsView';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes,

    /** Array of report actions for this report */
    reportActions: PropTypes.arrayOf(PropTypes.shape(reportActionPropTypes)),

    /** Whether the composer is full size */
    isComposerFullSize: PropTypes.bool,

    policy: PropTypes.shape({
        /** The policy name */
        name: PropTypes.string,

        /** The type of the policy */
        type: PropTypes.string,
    }),

    /** When false the ReportActionsView will completely unmount and we will show a loader until it returns true. */
    isReportReadyForDisplay: PropTypes.bool,

    /** There are no reportActions at all to display and we are still in the process of loading the next set of actions. */
    isLoadingInitialReportActions: PropTypes.bool,

    /** Whether data indirectly related to a report is loading */
    isLoading: PropTypes.bool,
};

const defaultProps = {
    reportActions: [],
    report: {
        hasOutstandingIOU: false,
        isLoadingReportActions: false,
    },
    isComposerFullSize: false,
    policy: undefined,
    isReportReadyForDisplay: false,
    isLoadingInitialReportActions: false,
    isLoading: true,
};

const ALWAYS_SHOW_SKELETON = Platform.OS !== 'web';

function ReportActionsViewWithSkeleton(props) {
    const [isLoading, setIsLoading] = useState(ALWAYS_SHOW_SKELETON);
    const [skeletonVisible, setSkeletonVisible] = useState(ALWAYS_SHOW_SKELETON);
    const skeletonOpacity = useSharedValue(ALWAYS_SHOW_SKELETON ? 1 : 0);
    const {windowHeight} = useWindowDimensions();

    const skeletonStyle = useAnimatedStyle(() => ({
        opacity: skeletonOpacity.value,
    }));

    useEffect(() => {
        const loading = !props.isReportReadyForDisplay || props.isLoadingInitialReportActions || props.isLoading;
        if (loading !== isLoading) {
            setIsLoading(loading);
        }
    }, [props.isReportReadyForDisplay, props.isLoadingInitialReportActions, props.isLoading, isLoading]);

    useEffect(() => {
        if (isLoading) {
            return;
        }

        skeletonOpacity.value = withDelay(
            250,
            withTiming(0, {duration: 100}, () => {
                runOnJS(setSkeletonVisible)(false);
            }),
        );
    }, [isLoading, skeletonOpacity]);

    return (
        <>
            {!isLoading && (
                <ReportActionsView
                    reportActions={props.reportActions}
                    report={props.report}
                    isComposerFullSize={props.isComposerFullSize}
                    policy={props.policy}
                />
            )}

            {/* Note: The report should be allowed to mount even if the initial report actions are not loaded. If we prevent rendering the report while they are loading then
            we'll unnecessarily unmount the ReportActionsView which will clear the new marker lines initial state. */}
            {(isLoading || skeletonVisible) && (
                <Animated.View
                    style={[StyleSheet.absoluteFillObject, {backgroundColor: themeColors.appBG}, skeletonStyle]}
                    pointerEvents="none"
                >
                    <ReportActionsSkeletonView containerHeight={windowHeight} />
                </Animated.View>
            )}
        </>
    );
}

ReportActionsViewWithSkeleton.propTypes = propTypes;
ReportActionsViewWithSkeleton.defaultProps = defaultProps;

export default ReportActionsViewWithSkeleton;
