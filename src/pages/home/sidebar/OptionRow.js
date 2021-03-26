import _ from 'underscore';
import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
} from 'react-native';
import styles from '../../../styles/styles';
import {optionPropTypes} from './optionPropTypes';
import Icon from '../../../components/Icon';
import {Pencil, PinCircle, Checkmark} from '../../../components/Icon/Expensicons';
import MultipleAvatars from '../../../components/MultipleAvatars';
import themeColors from '../../../styles/themes/default';
import Hoverable from '../../../components/Hoverable';
import OptionRowTitle from './OptionRowTitle';

const propTypes = {
    // Style for hovered state
    // eslint-disable-next-line react/forbid-prop-types
    hoverStyle: PropTypes.object,

    // Option to allow the user to choose from can be type 'report' or 'user'
    option: optionPropTypes.isRequired,

    // Whether this option is currently in focus so we can modify its style
    optionIsFocused: PropTypes.bool.isRequired,

    // A function that is called when an option is selected. Selected option is passed as a param
    onSelectRow: PropTypes.func.isRequired,

    // A flag to indicate whether to show additional optional states, such as pin and draft icons
    hideAdditionalOptionStates: PropTypes.bool,

    // Whether we should show the selected state
    showSelectedState: PropTypes.bool,

    // Whether this item is selected
    isSelected: PropTypes.bool,

    // Force the text style to be the unread style
    forceTextUnreadStyle: PropTypes.bool,

    // Whether to show the title tooltip
    showTitleTooltip: PropTypes.bool,

    // Toggle between compact and default view
    mode: PropTypes.oneOf(['compact', 'default']),
};

const defaultProps = {
    hoverStyle: styles.sidebarLinkHover,
    hideAdditionalOptionStates: false,
    showSelectedState: false,
    isSelected: false,
    forceTextUnreadStyle: false,
    showTitleTooltip: false,
    mode: 'default',
};

const OptionRow = ({
    hoverStyle,
    option,
    optionIsFocused,
    onSelectRow,
    hideAdditionalOptionStates,
    showSelectedState,
    isSelected,
    forceTextUnreadStyle,
    showTitleTooltip,
    mode,
}) => {
    const textStyle = optionIsFocused
        ? styles.sidebarLinkActiveText
        : styles.sidebarLinkText;
    const textUnreadStyle = (option.isUnread || forceTextUnreadStyle)
        ? [textStyle, styles.sidebarLinkTextUnread] : [textStyle];
    const displayNameStyle = mode === 'compact'
        ? [styles.optionDisplayName, textUnreadStyle, styles.optionDisplayNameCompact, styles.mr2]
        : [styles.optionDisplayName, textUnreadStyle];
    const alternateTextStyle = mode === 'compact'
        ? [textStyle, styles.optionAlternateText, styles.optionAlternateTextCompact]
        : [textStyle, styles.optionAlternateText, styles.mt1];
    const contentContainerStyles = mode === 'compact'
        ? [styles.flex1, styles.flexRow, styles.overflowHidden, styles.alignItemsCenter]
        : [styles.flex1];
    const sidebarInnerRowStyle = StyleSheet.flatten(mode === 'compact' ? [
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

    return (
        <Hoverable>
            {hovered => (
                <TouchableOpacity
                    onPress={() => onSelectRow(option)}
                    activeOpacity={0.8}
                    style={[
                        styles.flexRow,
                        styles.alignItemsCenter,
                        styles.justifyContentBetween,
                        styles.sidebarLink,
                        styles.sidebarLinkInner,
                        optionIsFocused ? styles.sidebarLinkActive : null,
                        hovered && !optionIsFocused ? hoverStyle : null,
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
                                !_.isEmpty(option.icons)
                                && (
                                    <MultipleAvatars
                                        avatarImageURLs={option.icons}
                                        optionIsFocused={optionIsFocused}
                                        size={mode === 'compact' ? 'small' : 'default'}
                                        styles={hovered && !optionIsFocused && {
                                            secondAvatar: {
                                                backgroundColor: themeColors.sidebarHover,
                                                borderColor: themeColors.sidebarHover,
                                            },
                                        }}
                                    />
                                )
                            }
                            <View style={contentContainerStyles}>
                                <OptionRowTitle
                                    option={option}
                                    tooltipEnabled={showTitleTooltip}
                                    numberOfLines={1}
                                    style={displayNameStyle}
                                />

                                {option.alternateText ? (
                                    <Text
                                        style={alternateTextStyle}
                                        numberOfLines={1}
                                    >
                                        {option.alternateText}
                                    </Text>
                                ) : null}
                            </View>
                            {showSelectedState && (
                                <View style={[styles.selectCircle]}>
                                    {isSelected && (
                                        <Icon src={Checkmark} fill={themeColors.iconSuccessFill} />
                                    )}
                                </View>
                            )}
                        </View>
                    </View>
                    {!hideAdditionalOptionStates && (
                        <View style={[styles.flexRow, styles.pr5]}>
                            {option.hasDraftComment && (
                                <View style={styles.ml2}>
                                    <Icon src={Pencil} />
                                </View>
                            )}
                            {option.isPinned && (
                                <View style={styles.ml2}>
                                    <Icon src={PinCircle} />
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
export default memo(OptionRow, (prevProps, nextProps) => {
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

    if (prevProps.option.hasDraftComment !== nextProps.option.hasDraftComment) {
        return false;
    }

    if (prevProps.option.isPinned !== nextProps.option.isPinned) {
        return false;
    }

    if (!_.isEqual(prevProps.option.icons, nextProps.option.icons)) {
        return false;
    }

    return true;
});
