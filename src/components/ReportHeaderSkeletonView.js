import React from 'react';
import {Pressable, View} from 'react-native';
import styles from '../styles/styles';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';

const propTypes = {
    ...windowDimensionsPropTypes,
};

const ReportHeaderSkeletonView = props => (
    <View style={[styles.appContentHeader]}>
        <View style={[styles.appContentHeaderTitle, !props.isSmallScreenWidth && styles.pl5]}>
            <Pressable
                onPress={() => {}}
                style={[styles.LHNToggle]}
                accessibilityHint="Navigate back to chats list"
            >
                <Icon src={Expensicons.BackArrow} />
            </Pressable>
        </View>
    </View>
);

ReportHeaderSkeletonView.propTypes = propTypes;
ReportHeaderSkeletonView.displayName = 'ReportHeaderSkeletonView';
export default withWindowDimensions(ReportHeaderSkeletonView);
