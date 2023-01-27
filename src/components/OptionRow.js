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
    /** Style for hovered state */
    // eslint-disable-next-line react/forbid-prop-types
    hoverStyle: PropTypes.object,

    /** Option to allow the user to choose from can be type 'report' or 'user' */
    option: optionPropTypes.isRequired,

    /** Whether this option is currently in focus so we can modify its style */
    optionIsFocused: PropTypes.bool,

    /** A function that is called when an option is selected. Selected option is passed as a param */
    onSelectRow: PropTypes.func,

    /** Whether we should show the selected state */
    showSelectedState: PropTypes.bool,

    /** Whether this item is selected */
    isSelected: PropTypes.bool,

    /** Display the text of the option in bold font style */
    boldStyle: PropTypes.bool,

    /** Whether to show the title tooltip */
    showTitleTooltip: PropTypes.bool,

    /** Whether this option should be disabled */
    isDisabled: PropTypes.bool,

    /** Whether to show a line separating options in list */
    shouldHaveOptionSeparator: PropTypes.bool,

    /** Whether to remove the lateral padding and align the content with the margins */
    disableInnerPadding: PropTypes.bool,

    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    ...withLocalizePropTypes,
};

const defaultProps = {
    hoverStyle: styles.sidebarLinkHover,
    showSelectedState: false,
    isSelected: false,
    boldStyle: false,
    showTitleTooltip: false,
    onSelectRow: () => {},
    isDisabled: false,
    optionIsFocused: false,
    style: null,
    shouldHaveOptionSeparator: false,
    disableInnerPadding: false,
};

const OptionRow = (props) => {
    let touchableRef = null;
    const textStyle = props.optionIsFocused
        ? styles.sidebarLinkActiveText
        : styles.sidebarLinkText;
    const textUnreadStyle = (props.boldStyle || props.option.boldStyle)
        ? [textStyle, styles.sidebarLinkTextBold] : [textStyle];
    const displayNameStyle = StyleUtils.combineStyles(styles.optionDisplayName, textUnreadStyle, props.style);
    const alternateTextStyle = StyleUtils.combineStyles(textStyle, styles.optionAlternateText, styles.textLabelSupporting, props.style);
    const contentContainerStyles = [styles.flex1];
    const sidebarInnerRowStyle = StyleSheet.flatten([
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
                            !props.disableInnerPadding && styles.sidebarLinkInner,
                            props.optionIsFocused ? styles.sidebarLinkActive : null,
                            hovered && !props.optionIsFocused ? props.hoverStyle : null,
                            props.isDisabled && styles.cursorDisabled,
                            props.shouldHaveOptionSeparator && styles.borderTop,
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
                                            size={CONST.AVATAR_SIZE.DEFAULT}
                                        />
                                    ) : (
                                        <MultipleAvatars
                                            icons={props.option.icons}
                                            size={CONST.AVATAR_SIZE.DEFAULT}
                                            secondAvatarStyle={[
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
                        {props.option.customIcon && (
                            <View
                                style={[styles.flexRow, styles.alignItemsCenter]}
                                accessible={false}
                            >
                                <View>
                                    <Icon
                                        src={lodashGet(props.option, 'customIcon.src', '')}
                                        height={16}
                                        width={16}
                                        fill={lodashGet(props.option, 'customIcon.color')}
                                    />
                                </View>
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
export default withLocalize(memo(OptionRow, (prevProps, nextProps) => prevProps.optionIsFocused === nextProps.optionIsFocused
    && prevProps.isSelected === nextProps.isSelected
    && prevProps.option.alternateText === nextProps.option.alternateText
    && prevProps.option.descriptiveText === nextProps.option.descriptiveText
    && _.isEqual(prevProps.option.icons, nextProps.option.icons)
    && prevProps.option.text === nextProps.option.text
    && prevProps.showSelectedState === nextProps.showSelectedState
    && prevProps.isDisabled === nextProps.isDisabled
    && prevProps.showTitleTooltip === nextProps.showTitleTooltip
    && prevProps.option.brickRoadIndicator === nextProps.option.brickRoadIndicator));
