import React from 'react';
import PropTypes from "prop-types";
import SkeletonViewContentLoader from 'react-content-loader/native';
import {Circle, Rect} from "react-native-svg";
import {View} from "react-native";
import * as StyleUtils from "../../styles/StyleUtils";
import CONST from '../../CONST';
import themeColors from "../../styles/themes/default";
import variables from "../../styles/variables";
import styles from "../../styles/styles";


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
    const headlineMarginTop = 16;
    const headlineSize = variables.fontSizeXLarge;
    const labelMarginTop = 4;
    const labelSize = variables.fontSizeLabel;
    return (<View style={styles.avatarSectionWrapper}>
        <SkeletonViewContentLoader
            animate={props.shouldAnimate}
            backgroundColor={themeColors.highlightBG}
            foregroundColor={themeColors.border}
        >
            <Circle
                cx="50%"
                cy={avatarPlaceholderRadius}
                r={avatarPlaceholderRadius}
            />
            <Rect
                x="20%"
                y={avatarPlaceholderSize + headlineMarginTop}
                width="60%"
                height={headlineSize}
            />
            <Rect
                x="15%"
                y={avatarPlaceholderSize + headlineMarginTop + headlineSize + labelMarginTop}
                width="70%"
                height={labelSize}
            />
        </SkeletonViewContentLoader>
    </View>)
}

CurrentUserPersonalDetailsSkeletonView.displayName = 'CurrentUserPersonalDetailsSkeletonView';
CurrentUserPersonalDetailsSkeletonView.propTypes = propTypes;
CurrentUserPersonalDetailsSkeletonView.defaultProps = defaultProps;
export default CurrentUserPersonalDetailsSkeletonView
