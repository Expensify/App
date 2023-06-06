import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {View, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import themeColors from '../styles/themes/default';
import variables from '../styles/variables';
import Text from './Text';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import * as StyleUtils from '../styles/StyleUtils';
import DisplayNames from './DisplayNames';
import MultipleAvatars from './MultipleAvatars';
import CONST from '../CONST';
import avatarPropTypes from './avatarPropTypes';

const propTypes = {
    /** Array of avatar URLs or icons */
    icons: PropTypes.arrayOf(avatarPropTypes),

    /** The title to display */
    text: PropTypes.string,

    /** The description to display */
    alternateText: PropTypes.string,

    /** The function to call when the link is pressed */
    onPress: PropTypes.func.isRequired,

    /** Label for the Link */
    label: PropTypes.string.isRequired,

    /** Whether it is a share location */
    isShareDestination: PropTypes.bool,

    /** Whether the Touchable should be disabled */
    disabled: PropTypes.bool,

    /** Whether we're creating a new task or editing */
    isNewTask: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    icons: [],
    text: '',
    alternateText: '',
    isShareDestination: false,
    disabled: false,
    isNewTask: true,
};

const TaskSelectorLink = (props) => {
    const displayNameStyle = StyleUtils.combineStyles(styles.optionDisplayName, styles.pre);
    const alternateTextStyle = StyleUtils.combineStyles(styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting, styles.pre);
    return (
        <TouchableOpacity
            style={[styles.flexRow, styles.taskSelectorLink, styles.mb1]}
            onPress={props.onPress}
            disabled={props.disabled}
        >
            <View style={[styles.flexRow, styles.containerWithSpaceBetween, styles.alignItemsCenter]}>
                {props.icons.length !== 0 || props.text !== '' ? (
                    <View style={[styles.flex1, styles.alignItemsStart]}>
                        <Text style={[styles.label, styles.textWhite, styles.mb2]}>{props.translate(props.label)}</Text>
                        <View style={[styles.flexRow, styles.w100, styles.alignItemsCenter]}>
                            <MultipleAvatars
                                icons={props.icons}
                                size={CONST.AVATAR_SIZE.DEFAULT}
                                secondAvatarStyle={[StyleUtils.getBackgroundAndBorderStyle(themeColors.appBG)]}
                            />
                            <View style={[styles.flex1]}>
                                <DisplayNames
                                    accessibilityLabel={props.translate('accessibilityHints.chatUserDisplayNames')}
                                    fullTitle={props.text}
                                    tooltipEnabled={false}
                                    numberOfLines={1}
                                    textStyles={displayNameStyle}
                                    shouldUseFullTitle={props.isShareDestination}
                                />
                                {props.alternateText ? (
                                    <Text
                                        style={alternateTextStyle}
                                        numberOfLines={1}
                                    >
                                        {props.alternateText}
                                    </Text>
                                ) : null}
                            </View>
                        </View>
                    </View>
                ) : (
                    <Text style={[styles.textWhite, styles.textNormal]}>{props.translate(props.label)}</Text>
                )}
                {props.disabled || !props.isNewTask ? null : (
                    <Icon
                        src={Expensicons.ArrowRight}
                        fill={themeColors.textLight}
                        width={variables.iconSizeSmall}
                        height={variables.iconSizeSmall}
                        inline
                    />
                )}
            </View>
        </TouchableOpacity>
    );
};

TaskSelectorLink.defaultProps = defaultProps;
TaskSelectorLink.propTypes = propTypes;
TaskSelectorLink.displayName = 'TaskSelectorLink';

export default withLocalize(TaskSelectorLink);
