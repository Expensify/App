import _ from 'underscore';
import lodashGet from 'lodash/get';
import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {
    TouchableOpacity,
    View,
    StyleSheet,
} from 'react-native';
import styles from '../styles/styles';
import * as StyleUtils from '../styles/StyleUtils';
import optionPropTypes from './optionPropTypes';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import MultipleAvatars from './MultipleAvatars';
import Hoverable from './Hoverable';
import DisplayNames from './DisplayNames';
import IOUBadge from './IOUBadge';
import themeColors from '../styles/themes/default';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import Text from './Text';
import SelectCircle from './SelectCircle';
import SubscriptAvatar from './SubscriptAvatar';
import OfflineWithFeedback from './OfflineWithFeedback';
import CONST from '../CONST';
import * as ReportUtils from '../libs/ReportUtils';
import variables from '../styles/variables';

const propTypes = {
    /** The accessibility hint for the entire option row. Primarily used for unit testing to identify the component */
    accessibilityHint: PropTypes.string,

    /** The accessibility hint for alternative text label. Primarily used for unit testing to identify the component */
    alternateTextAccessibilityLabel: PropTypes.string,

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

    /** A flag to indicate whether to show additional optional states, such as pin and draft icons */
    hideAdditionalOptionStates: PropTypes.bool,

    /** Whether we should show the selected state */
    showSelectedState: PropTypes.bool,

    /** Whether this item is selected */
    isSelected: PropTypes.bool,

    /** Force the text style to be the unread style */
    forceTextUnreadStyle: PropTypes.bool,

    /** Whether to show the title tooltip */
    showTitleTooltip: PropTypes.bool,

    /** Toggle between compact and default view */
    mode: PropTypes.oneOf(_.values(CONST.OPTION_MODE)),

    /** Whether this option should be disabled */
    isDisabled: PropTypes.bool,

    /** Whether to show a line separating options in list */
    shouldHaveOptionSeparator: PropTypes.bool,

    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    ...withLocalizePropTypes,
};

const defaultProps = {
    accessibilityHint: '',
    alternateTextAccessibilityLabel: '',
    backgroundColor: themeColors.appBG,
    hoverStyle: styles.sidebarLinkHover,
    hideAdditionalOptionStates: false,
    showSelectedState: false,
    isSelected: false,
    forceTextUnreadStyle: false,
    showTitleTooltip: false,
    mode: 'default',
    onSelectRow: () => {},
    isDisabled: false,
    optionIsFocused: false,
    style: null,
    shouldHaveOptionSeparator: false,
};

const OptionRow = (props) => {
    let touchableRef = null;
    const textStyle = props.optionIsFocused
        ? styles.sidebarLinkActiveText
        : styles.sidebarLinkText;
    const textUnreadStyle = (props.option.isUnread || props.forceTextUnreadStyle)
        ? [textStyle, styles.sidebarLinkTextUnread] : [textStyle];
    const displayNameStyle = StyleUtils.combineStyles(props.mode === CONST.OPTION_MODE.COMPACT
        ? [styles.optionDisplayName, ...textUnreadStyle, styles.optionDisplayNameCompact, styles.mr2]
        : [styles.optionDisplayName, ...textUnreadStyle], props.style);
    const alternateTextStyle = StyleUtils.combineStyles(props.mode === CONST.OPTION_MODE.COMPACT
        ? [textStyle, styles.optionAlternateText, styles.textLabelSupporting, styles.optionAlternateTextCompact]
        : [textStyle, styles.optionAlternateText, styles.textLabelSupporting], props.style);
    const contentContainerStyles = props.mode === CONST.OPTION_MODE.COMPACT
        ? [styles.flex1, styles.flexRow, styles.overflowHidden, styles.alignItemsCenter]
        : [styles.flex1];
    const sidebarInnerRowStyle = StyleSheet.flatten(props.mode === CONST.OPTION_MODE.COMPACT ? [
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
    const avatarTooltips = props.showTitleTooltip && !props.option.isChatRoom && !props.option.isArchivedRoom ? _.pluck(displayNamesWithTooltips, 'tooltip') : undefined;

    return (
        <OfflineWithFeedback
            pendingAction={props.option.pendingAction}
            errors={props.option.allReportErrors}
            shouldShowErrorMessages={false}
        >
            <Hoverable
                containerStyles={[
                    props.isDisabled ? styles.userSelectNone : null,
                ]}
            >
                {hovered => (
                    <TouchableOpacity
                        ref={el => touchableRef = el}
                        onPress={(e) => {
                            if (e) {
                                e.preventDefault();
                            }

                            props.onSelectRow(props.option, touchableRef);
                        }}
                        disabled={props.isDisabled}
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
                            props.isDisabled && styles.cursorDisabled,
                            props.shouldHaveOptionSeparator && styles.borderTop,
                        ]}
                    >
                        <View accessibilityHint={props.accessibilityHint} style={sidebarInnerRowStyle}>
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
                                            size={props.mode === CONST.OPTION_MODE.COMPACT ? CONST.AVATAR_SIZE.SMALL : CONST.AVATAR_SIZE.DEFAULT}
                                        />
                                    ) : (
                                        <MultipleAvatars
                                            icons={props.option.icons}
                                            size={props.mode === CONST.OPTION_MODE.COMPACT ? CONST.AVATAR_SIZE.SMALL : CONST.AVATAR_SIZE.DEFAULT}
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
                                        accessibilityLabel="Chat user display names"
                                        fullTitle={props.option.text}
                                        displayNamesWithTooltips={displayNamesWithTooltips}
                                        tooltipEnabled={props.showTitleTooltip}
                                        numberOfLines={1}
                                        textStyles={displayNameStyle}
                                        shouldUseFullTitle={props.option.isChatRoom || props.option.isPolicyExpenseChat}
                                    />
                                    {props.option.alternateText ? (
                                        <Text
                                            accessibilityLabel={props.alternateTextAccessibilityLabel}
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
                                        fill={themeColors.danger}
                                        height={variables.iconSizeSmall}
                                        width={variables.iconSizeSmall}
                                    />
                                </View>
                                )}
                                {props.showSelectedState && <SelectCircle isChecked={props.isSelected} />}
                            </View>
                        </View>
                        {!props.hideAdditionalOptionStates && (
                            <View
                                style={[styles.flexRow, styles.alignItemsCenter]}
                                accessible={false}
                            >
                                {props.option.hasDraftComment && (
                                    <View
                                        style={styles.ml2}
                                        accessibilityLabel={props.translate('sidebarScreen.draftedMessage')}
                                    >
                                        <Icon src={Expensicons.Pencil} height={16} width={16} />
                                    </View>
                                )}
                                {props.option.hasOutstandingIOU && (
                                    <IOUBadge iouReportID={props.option.iouReportID} />
                                )}
                                {props.option.isPinned && (
                                    <View
                                        style={styles.ml2}
                                        accessibilityLabel={props.translate('sidebarScreen.chatPinned')}
                                    >
                                        <Icon src={Expensicons.Pin} height={16} width={16} />
                                    </View>
                                )}
                                {Boolean(props.option.customIcon) && (
                                    <View>
                                        <Icon
                                            src={lodashGet(props.option, 'customIcon.src', '')}
                                            height={16}
                                            width={16}
                                            fill={lodashGet(props.option, 'customIcon.color')}
                                        />
                                    </View>
                                )}
                            </View>
                        )}
                    </TouchableOpacity>
                )}
            </Hoverable>
        </OfflineWithFeedback>
    );
};

OptionRow.propTypes = propTypes;
OptionRow.defaultProps = defaultProps;
OptionRow.displayName = 'OptionRow';

// It it very important to use React.memo here so SectionList items will not unnecessarily re-render
export default withLocalize(memo(OptionRow, (prevProps, nextProps) => {
    if (prevProps.optionIsFocused !== nextProps.optionIsFocused) {
        return false;
    }

    if (prevProps.isSelected !== nextProps.isSelected) {
        return false;
    }

    if (prevProps.mode !== nextProps.mode) {
        return false;
    }

    if (prevProps.option.isUnread !== nextProps.option.isUnread) {
        return false;
    }

    if (prevProps.option.alternateText !== nextProps.option.alternateText) {
        return false;
    }

    if (prevProps.option.descriptiveText !== nextProps.option.descriptiveText) {
        return false;
    }

    if (prevProps.option.hasDraftComment !== nextProps.option.hasDraftComment) {
        return false;
    }

    if (prevProps.option.isPinned !== nextProps.option.isPinned) {
        return false;
    }

    if (prevProps.option.hasOutstandingIOU !== nextProps.option.hasOutstandingIOU) {
        return false;
    }

    if (!_.isEqual(prevProps.option.icons, nextProps.option.icons)) {
        return false;
    }

    // Re-render when the text changes
    if (prevProps.option.text !== nextProps.option.text) {
        return false;
    }

    if (prevProps.showSelectedState !== nextProps.showSelectedState) {
        return false;
    }

    if (prevProps.isDisabled !== nextProps.isDisabled) {
        return false;
    }

    if (prevProps.showTitleTooltip !== nextProps.showTitleTooltip) {
        return false;
    }

    if (prevProps.backgroundColor !== nextProps.backgroundColor) {
        return false;
    }

    if (prevProps.option.brickRoadIndicator !== nextProps.option.brickRoadIndicator) {
        return false;
    }

    return true;
}));
