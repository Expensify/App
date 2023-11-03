import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import {Circle, Rect} from 'react-native-svg';
import compose from '@libs/compose';
import styles from '@styles/styles';
import themeColors from '@styles/themes/default';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import PressableWithFeedback from './Pressable/PressableWithFeedback';
import SkeletonViewContentLoader from './SkeletonViewContentLoader';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';

const propTypes = {
    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
    shouldAnimate: PropTypes.bool,
};

const defaultProps = {
    shouldAnimate: true,
};

function ReportHeaderSkeletonView(props) {
    return (
        <View style={[styles.appContentHeader]}>
            <View style={[styles.appContentHeaderTitle, !props.isSmallScreenWidth && styles.pl5]}>
                {props.isSmallScreenWidth && (
                    <PressableWithFeedback
                        onPress={() => {}}
                        style={[styles.LHNToggle]}
                        role={CONST.ACCESSIBILITY_ROLE.BUTTON}
                        accessibilityLabel={props.translate('common.back')}
                    >
                        <Icon src={Expensicons.BackArrow} />
                    </PressableWithFeedback>
                )}
                <SkeletonViewContentLoader
                    animate={props.shouldAnimate}
                    width={styles.w100.width}
                    height={variables.contentHeaderHeight}
                    backgroundColor={themeColors.highlightBG}
                    foregroundColor={themeColors.border}
                >
                    <Circle
                        cx="20"
                        cy="33"
                        r="20"
                    />
                    <Rect
                        x="55"
                        y="20"
                        width="30%"
                        height="8"
                    />
                    <Rect
                        x="55"
                        y="40"
                        width="40%"
                        height="8"
                    />
                </SkeletonViewContentLoader>
            </View>
        </View>
    );
}

ReportHeaderSkeletonView.propTypes = propTypes;
ReportHeaderSkeletonView.defaultProps = defaultProps;
ReportHeaderSkeletonView.displayName = 'ReportHeaderSkeletonView';
export default compose(withWindowDimensions, withLocalize)(ReportHeaderSkeletonView);
