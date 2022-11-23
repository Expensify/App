import React from 'react';
import {Pressable, View} from 'react-native';
import {Rect, Circle} from 'react-native-svg';
import SkeletonViewContentLoader from 'react-content-loader/native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import variables from '../styles/variables';
import themeColors from '../styles/themes/default';

const propTypes = {
    ...windowDimensionsPropTypes,
    animate: PropTypes.bool,
};

const defaultProps = {
    animate: true,
};

const ReportHeaderSkeletonView = props => (
    <View style={[styles.appContentHeader]}>
        <View style={[styles.appContentHeaderTitle, !props.isSmallScreenWidth && styles.pl5]}>
            <Pressable
                onPress={() => {}}
                style={[styles.LHNToggle]}
            >
                <Icon src={Expensicons.BackArrow} />
            </Pressable>
            <SkeletonViewContentLoader
                animate={props.animate}
                width={styles.w100.width}
                height={variables.contentHeaderHeight}
                backgroundColor={themeColors.highlightBG}
                foregroundColor={themeColors.border}
            >
                <Circle cx="20" cy="33" r="20" />
                <Rect x="55" y="20" width="30%" height="8" />
                <Rect x="55" y="40" width="40%" height="8" />
            </SkeletonViewContentLoader>
        </View>
    </View>
);

ReportHeaderSkeletonView.propTypes = propTypes;
ReportHeaderSkeletonView.defaultProps = defaultProps;
ReportHeaderSkeletonView.displayName = 'ReportHeaderSkeletonView';
export default withWindowDimensions(ReportHeaderSkeletonView);
