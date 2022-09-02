import _ from 'underscore';
import lodashGet from 'lodash/get';
import React from 'react';
import PropTypes from 'prop-types';
import {
    TouchableOpacity,
    View,
    StyleSheet,
} from 'react-native';
import styles from '../../styles/styles';
import * as StyleUtils from '../../styles/StyleUtils';
import optionPropTypes from '../optionPropTypes';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import MultipleAvatars from '../MultipleAvatars';
import Hoverable from '../Hoverable';
import DisplayNames from '../DisplayNames';
import IOUBadge from '../IOUBadge';
import colors from '../../styles/colors';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import Text from '../Text';
import SubscriptAvatar from '../SubscriptAvatar';
import CONST from '../../CONST';
import * as ReportUtils from '../../libs/ReportUtils';
import variables from '../../styles/variables';

const propTypes = {
    /** Background Color of the Option Row */
    backgroundColor: PropTypes.string,

    /** Style for hovered state */
    // eslint-disable-next-line react/forbid-prop-types
    hoverStyle: PropTypes.object,

    /** Option to allow the user to choose from can be type 'report' or 'user' */
    option: optionPropTypes.isRequired,

    /** Whether this option is currently in focus so we can modify its style */
    optionIsFocused: PropTypes.bool,

    /** A function that is called when an option is selected. Selected option is passed as a param */
    onSelectRow: PropTypes.func,

    /** Toggle between compact and default view */
    viewMode: PropTypes.oneOf(_.values(CONST.OPTION_MODE)),

    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    ...withLocalizePropTypes,
};

const defaultProps = {
    backgroundColor: colors.white,
    hoverStyle: styles.sidebarLinkHover,
    viewMode: 'default',
    onSelectRow: () => {},
    optionIsFocused: false,
    style: null,
};

const OptionRowLHN = (props) => {
    let touchableRef = null;
    const textStyle = props.optionIsFocused
        ? styles.sidebarLinkActiveText
        : styles.sidebarLinkText;
    const textUnreadStyle = [textStyle];
    const displayNameStyle = StyleUtils.combineStyles(props.viewMode === CONST.OPTION_MODE.COMPACT
        ? [styles.optionDisplayName, ...textUnreadStyle, styles.optionDisplayNameCompact, styles.mr2]
        : [styles.optionDisplayName, ...textUnreadStyle], props.style);
    const alternateTextStyle = StyleUtils.combineStyles(props.viewMode === CONST.OPTION_MODE.COMPACT
        ? [textStyle, styles.optionAlternateText, styles.textLabelSupporting, styles.optionAlternateTextCompact]
        : [textStyle, styles.optionAlternateText, styles.textLabelSupporting], props.style);
    const contentContainerStyles = props.viewMode === CONST.OPTION_MODE.COMPACT
        ? [styles.flex1, styles.flexRow, styles.overflowHidden, styles.alignItemsCenter]
        : [styles.flex1];
    const sidebarInnerRowStyle = StyleSheet.flatten(props.viewMode === CONST.OPTION_MODE.COMPACT ? [
        styles.chatLinkRowPressable,
        styles.flexGrow1,
        styles.optionItemAvatarNameWrapper,
        styles.optionRowCompact,
        styles.justifyContentCenter,
    ] : [
        styles.chatLinkRowPressable,
        styles.flexGrow1,
        styles.optionItemAvatarNameWrapper,
        styles.optionRow,
        styles.justifyContentCenter,
    ]);
    const hoveredBackgroundColor = props.hoverStyle && props.hoverStyle.backgroundColor
        ? props.hoverStyle.backgroundColor
        : props.backgroundColor;
    const focusedBackgroundColor = styles.sidebarLinkActive.backgroundColor;
    const isMultipleParticipant = lodashGet(props.option, 'participantsList.length', 0) > 1;

    // We only create tooltips for the first 10 users or so since some reports have hundreds of users, causing performance to degrade.
    const displayNamesWithTooltips = ReportUtils.getDisplayNamesWithTooltips((props.option.participantsList || []).slice(0, 10), isMultipleParticipant);
    const avatarTooltips = !props.option.isChatRoom && !props.option.isArchivedRoom ? _.pluck(displayNamesWithTooltips, 'tooltip') : undefined;

    return (
        <Hoverable>
            {hovered => (
                <TouchableOpacity
                    ref={el => touchableRef = el}
                    onPress={(e) => {
                        e.preventDefault();
                        props.onSelectRow(props.option, touchableRef);
                    }}
                    activeOpacity={0.8}
                    style={[
                        styles.flexRow,
                        styles.alignItemsCenter,
                        styles.justifyContentBetween,
                        styles.sidebarLink,
                        styles.sidebarLinkInner,
                        StyleUtils.getBackgroundColorStyle(props.backgroundColor),
                        props.optionIsFocused ? styles.sidebarLinkActive : null,
                        hovered && !props.optionIsFocused ? props.hoverStyle : null,
                    ]}
                >
                    <View style={sidebarInnerRowStyle}>
                        <View
                            style={[
                                styles.flexRow,
                                styles.alignItemsCenter,
                            ]}
                        >
                            {
                                !_.isEmpty(props.option.icons)
                                && (
                                    props.option.shouldShowSubscript ? (
                                        <SubscriptAvatar
                                            mainAvatar={props.option.icons[0]}
                                            secondaryAvatar={props.option.icons[1]}
                                            mainTooltip={props.option.ownerEmail}
                                            secondaryTooltip={props.option.subtitle}
                                            size={props.viewMode === CONST.OPTION_MODE.COMPACT ? CONST.AVATAR_SIZE.SMALL : CONST.AVATAR_SIZE.DEFAULT}
                                        />
                                    ) : (
                                        <MultipleAvatars
                                            icons={props.option.icons}
                                            size={props.viewMode === CONST.OPTION_MODE.COMPACT ? CONST.AVATAR_SIZE.SMALL : CONST.AVATAR_SIZE.DEFAULT}
                                            secondAvatarStyle={[
                                                StyleUtils.getBackgroundAndBorderStyle(props.backgroundColor),
                                                props.optionIsFocused
                                                    ? StyleUtils.getBackgroundAndBorderStyle(focusedBackgroundColor)
                                                    : undefined,
                                                hovered && !props.optionIsFocused
                                                    ? StyleUtils.getBackgroundAndBorderStyle(hoveredBackgroundColor)
                                                    : undefined,
                                            ]}
                                            avatarTooltips={props.option.isPolicyExpenseChat ? [props.option.subtitle] : avatarTooltips}
                                        />
                                    )
                                )
                            }
                            <View style={contentContainerStyles}>
                                <DisplayNames
                                    fullTitle={props.option.text}
                                    displayNamesWithTooltips={displayNamesWithTooltips}
                                    tooltipEnabled
                                    numberOfLines={1}
                                    textStyles={displayNameStyle}
                                    shouldUseFullTitle={props.option.isChatRoom || props.option.isPolicyExpenseChat}
                                />
                                {props.option.alternateText ? (
                                    <Text
                                        style={alternateTextStyle}
                                        numberOfLines={1}
                                    >
                                        {props.option.alternateText}
                                    </Text>
                                ) : null}
                            </View>
                            {props.option.descriptiveText ? (
                                <View style={[styles.flexWrap]}>
                                    <Text style={[styles.textLabel]}>
                                        {props.option.descriptiveText}
                                    </Text>
                                </View>
                            ) : null}
                            {props.option.brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR && (
                                <View style={[styles.alignItemsCenter, styles.justifyContentCenter]}>
                                    <Icon
                                        src={Expensicons.DotIndicator}
                                        fill={colors.red}
                                        height={variables.iconSizeSmall}
                                        width={variables.iconSizeSmall}
                                    />
                                </View>
                            )}
                        </View>
                    </View>
                    <View style={[styles.flexRow, styles.alignItemsCenter]}>
                        {props.option.hasDraftComment && (
                            <View style={styles.ml2}>
                                <Icon src={Expensicons.Pencil} height={16} width={16} />
                            </View>
                        )}
                        {props.option.hasOutstandingIOU && (
                            <IOUBadge iouReportID={props.option.iouReportID} />
                        )}
                        {props.option.isPinned && (
                            <View style={styles.ml2}>
                                <Icon src={Expensicons.Pin} height={16} width={16} />
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            )}
        </Hoverable>
    );
};

OptionRowLHN.propTypes = propTypes;
OptionRowLHN.defaultProps = defaultProps;
OptionRowLHN.displayName = 'OptionRowLHN';

export default withLocalize(OptionRowLHN);
