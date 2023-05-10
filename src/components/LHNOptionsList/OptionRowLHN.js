import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {TouchableOpacity, View, StyleSheet} from 'react-native';
import * as optionRowStyles from '../../styles/optionRowStyles';
import styles from '../../styles/styles';
import * as StyleUtils from '../../styles/StyleUtils';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import MultipleAvatars from '../MultipleAvatars';
import Hoverable from '../Hoverable';
import DisplayNames from '../DisplayNames';
import colors from '../../styles/colors';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import Text from '../Text';
import SubscriptAvatar from '../SubscriptAvatar';
import CONST from '../../CONST';
import themeColors from '../../styles/themes/default';
import SidebarUtils from '../../libs/SidebarUtils';
import TextPill from '../TextPill';
import OfflineWithFeedback from '../OfflineWithFeedback';

const propTypes = {
    /** Style for hovered state */
    // eslint-disable-next-line react/forbid-prop-types
    hoverStyle: PropTypes.object,

    /** The ID of the report that the option is for */
    reportID: PropTypes.string.isRequired,

    /** Whether this option is currently in focus so we can modify its style */
    isFocused: PropTypes.bool,

    /** A function that is called when an option is selected. Selected option is passed as a param */
    onSelectRow: PropTypes.func,

    /** Toggle between compact and default view */
    viewMode: PropTypes.oneOf(_.values(CONST.OPTION_MODE)),

    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    ...withLocalizePropTypes,
};

const defaultProps = {
    hoverStyle: styles.sidebarLinkHover,
    viewMode: 'default',
    onSelectRow: () => {},
    isFocused: false,
    style: null,
};

const OptionRowLHN = (props) => {
    const optionItem = SidebarUtils.getOptionData(props.reportID);
    if (!optionItem) {
        return null;
    }

    let touchableRef = null;
    const textStyle = props.isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText;
    const textUnreadStyle = optionItem.isUnread ? [textStyle, styles.sidebarLinkTextBold] : [textStyle];
    const displayNameStyle = StyleUtils.combineStyles([styles.optionDisplayName, styles.optionDisplayNameCompact, styles.pre, ...textUnreadStyle], props.style);
    const textPillStyle = props.isFocused ? [styles.ml1, StyleUtils.getBackgroundColorWithOpacityStyle(themeColors.icon, 0.5)] : [styles.ml1];
    const alternateTextStyle = StyleUtils.combineStyles(
        props.viewMode === CONST.OPTION_MODE.COMPACT
            ? [textStyle, styles.optionAlternateText, styles.pre, styles.textLabelSupporting, styles.optionAlternateTextCompact, styles.ml2]
            : [textStyle, styles.optionAlternateText, styles.pre, styles.textLabelSupporting],
        props.style,
    );
    const contentContainerStyles =
        props.viewMode === CONST.OPTION_MODE.COMPACT ? [styles.flex1, styles.flexRow, styles.overflowHidden, optionRowStyles.compactContentContainerStyles] : [styles.flex1];
    const sidebarInnerRowStyle = StyleSheet.flatten(
        props.viewMode === CONST.OPTION_MODE.COMPACT
            ? [styles.chatLinkRowPressable, styles.flexGrow1, styles.optionItemAvatarNameWrapper, styles.optionRowCompact, styles.justifyContentCenter]
            : [styles.chatLinkRowPressable, styles.flexGrow1, styles.optionItemAvatarNameWrapper, styles.optionRow, styles.justifyContentCenter],
    );
    const hoveredBackgroundColor = props.hoverStyle && props.hoverStyle.backgroundColor ? props.hoverStyle.backgroundColor : themeColors.sidebar;
    const focusedBackgroundColor = styles.sidebarLinkActive.backgroundColor;

    const avatarTooltips = !optionItem.isChatRoom && !optionItem.isArchivedRoom ? _.pluck(optionItem.displayNamesWithTooltips, 'tooltip') : undefined;
    const hasBrickError = optionItem.brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
    const shouldShowGreenDotIndicator = !hasBrickError && (optionItem.isUnreadWithMention || (optionItem.hasOutstandingIOU && !optionItem.isIOUReportOwner));

    return (
        <OfflineWithFeedback
            pendingAction={optionItem.pendingAction}
            errors={optionItem.allReportErrors}
            shouldShowErrorMessages={false}
        >
            <Hoverable>
                {(hovered) => (
                    <TouchableOpacity
                        ref={(el) => (touchableRef = el)}
                        onPress={(e) => {
                            if (e) {
                                e.preventDefault();
                            }

                            props.onSelectRow(optionItem, touchableRef);
                        }}
                        activeOpacity={0.8}
                        style={[
                            styles.flexRow,
                            styles.alignItemsCenter,
                            styles.justifyContentBetween,
                            styles.sidebarLink,
                            styles.sidebarLinkInner,
                            StyleUtils.getBackgroundColorStyle(themeColors.sidebar),
                            props.isFocused ? styles.sidebarLinkActive : null,
                            hovered && !props.isFocused ? props.hoverStyle : null,
                        ]}
                    >
                        <View
                            accessibilityHint={props.translate('accessibilityHints.navigatesToChat')}
                            style={sidebarInnerRowStyle}
                        >
                            <View style={[styles.flexRow, styles.alignItemsCenter]}>
                                {!_.isEmpty(optionItem.icons) &&
                                    (optionItem.shouldShowSubscript ? (
                                        <SubscriptAvatar
                                            backgroundColor={props.isFocused ? themeColors.activeComponentBG : themeColors.sidebar}
                                            mainAvatar={optionItem.icons[0]}
                                            secondaryAvatar={optionItem.icons[1]}
                                            mainTooltip={optionItem.ownerEmail}
                                            secondaryTooltip={optionItem.subtitle}
                                            size={props.viewMode === CONST.OPTION_MODE.COMPACT ? CONST.AVATAR_SIZE.SMALL : CONST.AVATAR_SIZE.DEFAULT}
                                        />
                                    ) : (
                                        <MultipleAvatars
                                            icons={optionItem.icons}
                                            isFocusMode={props.viewMode === CONST.OPTION_MODE.COMPACT}
                                            size={props.viewMode === CONST.OPTION_MODE.COMPACT ? CONST.AVATAR_SIZE.SMALL : CONST.AVATAR_SIZE.DEFAULT}
                                            secondAvatarStyle={[
                                                StyleUtils.getBackgroundAndBorderStyle(themeColors.sidebar),
                                                props.isFocused ? StyleUtils.getBackgroundAndBorderStyle(focusedBackgroundColor) : undefined,
                                                hovered && !props.isFocused ? StyleUtils.getBackgroundAndBorderStyle(hoveredBackgroundColor) : undefined,
                                            ]}
                                            avatarTooltips={optionItem.isPolicyExpenseChat ? [optionItem.subtitle] : avatarTooltips}
                                        />
                                    ))}
                                <View style={contentContainerStyles}>
                                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.mw100, styles.overflowHidden]}>
                                        <DisplayNames
                                            accessibilityLabel={props.translate('accessibilityHints.chatUserDisplayNames')}
                                            fullTitle={optionItem.text}
                                            displayNamesWithTooltips={optionItem.displayNamesWithTooltips}
                                            tooltipEnabled
                                            numberOfLines={1}
                                            textStyles={displayNameStyle}
                                            shouldUseFullTitle={optionItem.isChatRoom || optionItem.isPolicyExpenseChat}
                                        />
                                        {optionItem.isChatRoom && (
                                            <TextPill
                                                style={textPillStyle}
                                                accessibilityLabel={props.translate('accessibilityHints.workspaceName')}
                                                text={optionItem.subtitle}
                                            />
                                        )}
                                    </View>
                                    {optionItem.alternateText ? (
                                        <Text
                                            style={alternateTextStyle}
                                            numberOfLines={1}
                                            accessibilityLabel={props.translate('accessibilityHints.lastChatMessagePreview')}
                                        >
                                            {optionItem.alternateText}
                                        </Text>
                                    ) : null}
                                </View>
                                {optionItem.descriptiveText ? (
                                    <View style={[styles.flexWrap]}>
                                        <Text style={[styles.textLabel]}>{optionItem.descriptiveText}</Text>
                                    </View>
                                ) : null}
                                {hasBrickError && (
                                    <View style={[styles.alignItemsCenter, styles.justifyContentCenter]}>
                                        <Icon
                                            src={Expensicons.DotIndicator}
                                            fill={colors.red}
                                        />
                                    </View>
                                )}
                            </View>
                        </View>
                        <View
                            style={[styles.flexRow, styles.alignItemsCenter]}
                            accessible={false}
                        >
                            {shouldShowGreenDotIndicator && (
                                <Icon
                                    src={Expensicons.DotIndicator}
                                    fill={themeColors.success}
                                />
                            )}
                            {optionItem.hasDraftComment && (
                                <View
                                    style={styles.ml2}
                                    accessibilityLabel={props.translate('sidebarScreen.draftedMessage')}
                                >
                                    <Icon src={Expensicons.Pencil} />
                                </View>
                            )}
                            {!shouldShowGreenDotIndicator && optionItem.isPinned && (
                                <View
                                    style={styles.ml2}
                                    accessibilityLabel={props.translate('sidebarScreen.chatPinned')}
                                >
                                    <Icon src={Expensicons.Pin} />
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                )}
            </Hoverable>
        </OfflineWithFeedback>
    );
};

OptionRowLHN.propTypes = propTypes;
OptionRowLHN.defaultProps = defaultProps;
OptionRowLHN.displayName = 'OptionRowLHN';

export default withLocalize(OptionRowLHN);
