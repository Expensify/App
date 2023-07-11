import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import Text from './Text';
import ReportActionsSkeletonView from './ReportActionsSkeletonView';
import CONST from '../CONST';

const propTypes = {
    dataLoaded: PropTypes.bool,
    dataEmptyText: PropTypes.string,
    skeletonHeight: PropTypes.number,
};

const defaultProps = {
    dataLoaded: false,
    dataEmptyText: undefined,
    skeletonHeight: CONST.CHAT_SKELETON_VIEW.AVERAGE_ROW_HEIGHT,
};

function WorkspaceMembersPlaceholder(props) {
    return props.dataLoaded && props.dataEmptyText ? (
        <View style={[styles.ph5]}>
            <Text style={[styles.textLabel, styles.colorMuted]}>{props.dataEmptyText}</Text>
        </View>
    ) : (
        <ReportActionsSkeletonView
            shouldAnimate
            containerHeight={props.skeletonHeight}
        />
    );
}

WorkspaceMembersPlaceholder.displayName = 'WorkspaceMembersPlaceholder';
WorkspaceMembersPlaceholder.propTypes = propTypes;
WorkspaceMembersPlaceholder.defaultProps = defaultProps;

export default WorkspaceMembersPlaceholder;
