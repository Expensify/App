import React from 'react';
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

const propTypes = {
    /** The images to display */
    icons: PropTypes.arrayOf(PropTypes.string),

    /** The title to display */
    text: PropTypes.string,

    /** The description to display */
    alternateText: PropTypes.string,

    /** The function to call when the link is pressed */
    onPress: PropTypes.func.isRequired,

    /** Label for the Link */
    label: PropTypes.string.isRequired,

    /** Whether it is a share location */
    isShareLocation: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    icons: [],
    text: '',
    alternateText: '',
    isShareLocation: false,
};

// eslint-disable-next-line react/destructuring-assignment
const TaskSelectorLink = (props) => {
    // console.log('props', !_.isEmpty(props.icons), props.icons);
    const displayNameStyle = StyleUtils.combineStyles(styles.optionDisplayName, styles.pre);
    const alternateTextStyle = StyleUtils.combineStyles(styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting, styles.pre);
    return (
        <TouchableOpacity style={[styles.flexRow, styles.taskSelectorLink, styles.mb8]} onPress={props.onPress}>
            <View style={[styles.flexRow, styles.containerWithSpaceBetween, styles.alignItemsCenter]}>
                {props.icons || props.text ? (
                    <View style={[styles.flexColumn, styles.justify, styles.alignItemsStart]}>
                        <Text style={[styles.label, styles.textWhite, styles.mb2]}>{props.translate(props.label)}</Text>
                        <View style={[styles.flexRow, styles.justifyContentCenter]}>
                            <View style={[styles.flexRow, styles.alignItemsCenter]}>
                                <MultipleAvatars icons={props.icons} size={CONST.AVATAR_SIZE.DEFAULT} secondAvatarStyle={[StyleUtils.getBackgroundAndBorderStyle(themeColors.appBG)]} />
                                <View style={[styles.flex1]}>
                                    <DisplayNames
                                        accessibilityLabel={props.translate('accessibilityHints.chatUserDisplayNames')}
                                        fullTitle={props.text}
                                        tooltipEnabled={false}
                                        numberOfLines={1}
                                        textStyles={displayNameStyle}
                                        shouldUseFullTitle={props.isShareLocation}
                                    />
                                    {props.alternateText ? (
                                        <Text style={alternateTextStyle} numberOfLines={1}>
                                            {props.alternateText}
                                        </Text>
                                    ) : null}
                                </View>
                            </View>
                        </View>
                    </View>
                ) : (
                    <View>
                        <Text style={[styles.optionAlternateText, styles.textWhite]}>{props.translate(props.label)}</Text>
                    </View>
                )}
                <Icon src={Expensicons.ArrowRight} fill={themeColors.textLight} width={variables.iconSizeSmall} height={variables.iconSizeSmall} inline />
            </View>
        </TouchableOpacity>
    );
};

TaskSelectorLink.defaultProps = defaultProps;
TaskSelectorLink.propTypes = propTypes;
TaskSelectorLink.displayName = 'TaskSelectorLink';

export default withLocalize(TaskSelectorLink);
