import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
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

    /** The size of the avatar */
    avatarSize: PropTypes.oneOf(_.values(CONST.AVATAR_SIZE)),

    /** Background color of the skeleton view */
    backgroundColor: PropTypes.string,

    /** Foreground color of the skeleton view */
    foregroundColor: PropTypes.string,
};

const defaultProps = {
    shouldAnimate: true,
    avatarSize: CONST.AVATAR_SIZE.LARGE,
    backgroundColor: themeColors.highlightBG,
    foregroundColor: themeColors.border,
};

function CurrentUserPersonalDetailsSkeletonView(props) {
    const avatarPlaceholderSize = StyleUtils.getAvatarSize(props.avatarSize);
    const avatarPlaceholderRadius = avatarPlaceholderSize / 2;
    const spaceBetweenAvatarAndHeadline = styles.mb3.marginBottom + styles.mt1.marginTop + (variables.lineHeightXXLarge - variables.fontSizeXLarge) / 2;
    const headlineSize = variables.fontSizeXLarge;
    const spaceBetweenHeadlineAndLabel = styles.mt1.marginTop + (variables.lineHeightXXLarge - variables.fontSizeXLarge) / 2;
    const labelSize = variables.fontSizeLabel;
    return (
        <View style={styles.avatarSectionWrapperSkeleton}>
            <SkeletonViewContentLoader
                animate={props.shouldAnimate}
                backgroundColor={props.backgroundColor}
                foregroundColor={props.foregroundColor}
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
