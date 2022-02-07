import _ from 'underscore';
import lodashGet from 'lodash/get';
import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {
    TouchableOpacity,
    View,
    StyleSheet,
} from 'react-native';
import Str from 'expensify-common/lib/str';
import styles from '../../../styles/styles';
import * as StyleUtils from '../../../styles/StyleUtils';
import {optionPropTypes} from './optionPropTypes';
import Icon from '../../../components/Icon';
import * as Expensicons from '../../../components/Icon/Expensicons';
import MultipleAvatars from '../../../components/MultipleAvatars';
import Hoverable from '../../../components/Hoverable';
import DisplayNames from '../../../components/DisplayNames';
import IOUBadge from '../../../components/IOUBadge';
import colors from '../../../styles/colors';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import Text from '../../../components/Text';
import SelectCircle from '../../../components/SelectCircle';

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
    mode: PropTypes.oneOf(['compact', 'default']),

    /** Whether this option should be disabled */
    isDisabled: PropTypes.bool,

    /** Whether to disable the interactivity of this row */
    disableRowInteractivity: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    backgroundColor: colors.white,
    hoverStyle: styles.sidebarLinkHover,
    hideAdditionalOptionStates: false,
    showSelectedState: false,
    isSelected: false,
    forceTextUnreadStyle: false,
    showTitleTooltip: false,
    mode: 'default',
    onSelectRow: null,
    isDisabled: false,
    optionIsFocused: false,
    disableRowInteractivity: false,
};

const OptionRow = (props) => {
    const textStyle = props.optionIsFocused
        ? styles.sidebarLinkActiveText
        : styles.sidebarLinkText;
    const textUnreadStyle = (props.option.isUnread || props.forceTextUnreadStyle)
        ? [textStyle, styles.sidebarLinkTextUnread] : [textStyle];
    const displayNameStyle = props.mode === 'compact'
        ? [styles.optionDisplayName, ...textUnreadStyle, styles.optionDisplayNameCompact, styles.mr2]
        : [styles.optionDisplayName, ...textUnreadStyle];
    const alternateTextStyle = props.mode === 'compact'
        ? [textStyle, styles.optionAlternateText, styles.textLabelSupporting, styles.optionAlternateTextCompact]
        : [textStyle, styles.optionAlternateText, styles.textLabelSupporting];
    const contentContainerStyles = props.mode === 'compact'
        ? [styles.flex1, styles.flexRow, styles.overflowHidden, styles.alignItemsCenter]
        : [styles.flex1];
    const sidebarInnerRowStyle = StyleSheet.flatten(props.mode === 'compact' ? [
        styles.chatLinkRowPressable,
        styles.flexGrow1,
        styles.optionItemAvatarNameWrapper,
        styles.sidebarInnerRowSmall,
        styles.justifyContentCenter,
    ] : [
        styles.chatLinkRowPressable,
        styles.flexGrow1,
        styles.optionItemAvatarNameWrapper,
        styles.sidebarInnerRow,
        styles.justifyContentCenter,
    ]);
    const hoveredBackgroundColor = props.hoverStyle && props.hoverStyle.backgroundColor
        ? props.hoverStyle.backgroundColor
        : props.backgroundColor;
    const focusedBackgroundColor = styles.sidebarLinkActive.backgroundColor;
    const isMultipleParticipant = lodashGet(props.option, 'participantsList.length', 0) > 1;
    const displayNamesWithTooltips = _.map(

        // We only create tooltips for the first 10 users or so since some reports have hundreds of users causing
        // performance to degrade.
        (props.option.participantsList || []).slice(0, 10),
        ({displayName, firstName, login}) => {
            const displayNameTrimmed = Str.isSMSLogin(login) ? props.toLocalPhone(displayName) : displayName;

            return {
                displayName: (isMultipleParticipant ? firstName : displayNameTrimmed) || Str.removeSMSDomain(login),
                tooltip: Str.removeSMSDomain(login),
            };
        },
    );

    const avatarTooltip = _.pluck(displayNamesWithTooltips, 'tooltip');

    return (
        <Hoverable>
            {hovered => (
                <TouchableOpacity
                    onPress={(e) => {
                        e.preventDefault();
                        props.onSelectRow(props.option);
                    }}
                    disabled={props.disableRowInteractivity}
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
                                    <MultipleAvatars
                                        avatarImageURLs={props.option.icons}
                                        size={props.mode === 'compact' ? 'small' : 'default'}
                                        secondAvatarStyle={[
                                            StyleUtils.getBackgroundAndBorderStyle(props.backgroundColor),
                                            props.optionIsFocused
                                                ? StyleUtils.getBackgroundAndBorderStyle(focusedBackgroundColor)
                                                : undefined,
                                            hovered && !props.optionIsFocused
                                                ? StyleUtils.getBackgroundAndBorderStyle(hoveredBackgroundColor)
                                                : undefined,
                                        ]}
                                        isChatRoom={props.option.isChatRoom}
                                        isArchivedRoom={props.option.isArchivedRoom}
                                        avatarTooltips={avatarTooltip}
                                    />
                                )
                            }
                            <View style={contentContainerStyles}>
                                <DisplayNames
                                    fullTitle={props.option.text}
                                    displayNamesWithTooltips={displayNamesWithTooltips}
                                    tooltipEnabled={props.showTitleTooltip}
                                    numberOfLines={1}
                                    textStyles={displayNameStyle}
                                    shouldUseFullTitle={props.option.isChatRoom}
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
                            {props.showSelectedState && <SelectCircle isChecked={props.isSelected} />}
                        </View>
                    </View>
                    {!props.hideAdditionalOptionStates && (
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
                    )}
                </TouchableOpacity>
            )}
        </Hoverable>
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

    return true;
}));
