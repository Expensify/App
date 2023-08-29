import React from 'react';
import PropTypes from 'prop-types';
import SkeletonViewContentLoader from 'react-content-loader/native';
import {Circle, Rect} from 'react-native-svg';
import {View} from 'react-native';
import * as StyleUtils from '../../styles/StyleUtils';
import CONST from '../../CONST';
import themeColors from '../../styles/themes/default';
import variables from '../../styles/variables';
import styles from '../../styles/styles';

const propTypes = {
    /** Whether to animate the skeleton view */
    shouldAnimate: PropTypes.bool,
};

const defaultProps = {
    shouldAnimate: true,
};

function CurrentUserPersonalDetailsSkeletonView(props) {
    const avatarPlaceholderSize = StyleUtils.getAvatarSize(CONST.AVATAR_SIZE.LARGE);
    const avatarPlaceholderRadius = avatarPlaceholderSize / 2;
    const spaceBetweenAvatarAndHeadline = styles.mb3.marginBottom + styles.mt1.marginTop + (variables.lineHeightXXLarge - variables.fontSizeXLarge) / 2;
    const headlineSize = variables.fontSizeXLarge;
    const spaceBetweenHeadlineAndLabel = styles.mt1.marginTop + (variables.lineHeightXXLarge - variables.fontSizeXLarge) / 2;
    const labelSize = variables.fontSizeLabel;
    return (
        <View style={styles.avatarSectionWrapperSkeleton}>
            <SkeletonViewContentLoader
                animate={props.shouldAnimate}
                backgroundColor={themeColors.highlightBG}
                foregroundColor={themeColors.border}
                height={avatarPlaceholderSize + spaceBetweenAvatarAndHeadline + headlineSize + spaceBetweenHeadlineAndLabel + labelSize}
            >
                <Circle
                    cx="50%"
                    cy={avatarPlaceholderRadius}
                    r={avatarPlaceholderRadius}
                />
                <Rect
                    x="20%"
                    y={avatarPlaceholderSize + spaceBetweenAvatarAndHeadline}
                    width="60%"
                    height={headlineSize}
                />
                <Rect
                    x="15%"
                    y={avatarPlaceholderSize + spaceBetweenAvatarAndHeadline + headlineSize + spaceBetweenHeadlineAndLabel}
                    width="70%"
                    height={labelSize}
                />
            </SkeletonViewContentLoader>
        </View>
    );
}

CurrentUserPersonalDetailsSkeletonView.displayName = 'CurrentUserPersonalDetailsSkeletonView';
CurrentUserPersonalDetailsSkeletonView.propTypes = propTypes;
CurrentUserPersonalDetailsSkeletonView.defaultProps = defaultProps;
export default CurrentUserPersonalDetailsSkeletonView;
