import _ from 'underscore';
import lodashGet from 'lodash/get';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
    TouchableOpacity,
    View,
    StyleSheet,
    InteractionManager,
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
    shouldDisableRowInnerPadding: PropTypes.bool,

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
    shouldDisableRowInnerPadding: false,
};

class OptionRow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isDisabled: this.props.isDisabled,
        };
    }

    // It is very important to use shouldComponentUpdate here so SectionList items will not unnecessarily re-render
    shouldComponentUpdate(nextProps, nextState) {
        return this.state.isDisabled !== nextState.isDisabled
            || this.props.isDisabled !== nextProps.isDisabled
            || this.props.isSelected !== nextProps.isSelected
            || this.props.showSelectedState !== nextProps.showSelectedState
            || this.props.showTitleTooltip !== nextProps.showTitleTooltip
            || !_.isEqual(this.props.option.icons, nextProps.option.icons)
            || this.props.optionIsFocused !== nextProps.optionIsFocused
            || this.props.option.text !== nextProps.option.text
            || this.props.option.alternateText !== nextProps.option.alternateText
            || this.props.option.descriptiveText !== nextProps.option.descriptiveText
            || this.props.option.brickRoadIndicator !== nextProps.option.brickRoadIndicator;
    }

    componentDidUpdate(prevProps) {
        if (this.props.isDisabled === prevProps.isDisabled) {
            return;
        }

        this.setState({isDisabled: this.props.isDisabled});
    }

    render() {
        let touchableRef = null;
        const textStyle = this.props.optionIsFocused
            ? styles.sidebarLinkActiveText
            : styles.sidebarLinkText;
        const textUnreadStyle = (this.props.boldStyle || this.props.option.boldStyle)
            ? [textStyle, styles.sidebarLinkTextBold] : [textStyle];
        const displayNameStyle = StyleUtils.combineStyles(styles.optionDisplayName, textUnreadStyle, this.props.style);
        const alternateTextStyle = StyleUtils.combineStyles(textStyle, styles.optionAlternateText, styles.textLabelSupporting, this.props.style);
        const contentContainerStyles = [styles.flex1];
        const sidebarInnerRowStyle = StyleSheet.flatten([
            styles.chatLinkRowPressable,
            styles.flexGrow1,
            styles.optionItemAvatarNameWrapper,
            styles.optionRow,
            styles.justifyContentCenter,
        ]);
        const hoveredBackgroundColor = this.props.hoverStyle && this.props.hoverStyle.backgroundColor
            ? this.props.hoverStyle.backgroundColor
            : this.props.backgroundColor;
        const focusedBackgroundColor = styles.sidebarLinkActive.backgroundColor;
        const isMultipleParticipant = lodashGet(this.props.option, 'participantsList.length', 0) > 1;

        // We only create tooltips for the first 10 users or so since some reports have hundreds of users, causing performance to degrade.
        const displayNamesWithTooltips = ReportUtils.getDisplayNamesWithTooltips((this.props.option.participantsList || []).slice(0, 10), isMultipleParticipant);
        const avatarTooltips = this.props.showTitleTooltip && !this.props.option.isChatRoom && !this.props.option.isArchivedRoom ? _.pluck(displayNamesWithTooltips, 'tooltip') : undefined;

        let subscriptColor = themeColors.appBG;
        if (this.props.optionIsFocused) {
            subscriptColor = focusedBackgroundColor;
        }

        return (
            <OfflineWithFeedback
                pendingAction={this.props.option.pendingAction}
                errors={this.props.option.allReportErrors}
                shouldShowErrorMessages={false}
            >
                <Hoverable
                    containerStyles={[
                        this.props.isDisabled ? styles.userSelectNone : null,
                    ]}
                >
                    {hovered => (
                        <TouchableOpacity
                            ref={el => touchableRef = el}
                            onPress={(e) => {
                                this.setState({isDisabled: true});
                                if (e) {
                                    e.preventDefault();
                                }
                                let result = this.props.onSelectRow(this.props.option, touchableRef);
                                if (!(result instanceof Promise)) {
                                    result = Promise.resolve();
                                }
                                InteractionManager.runAfterInteractions(() => {
                                    result.then(() => this.setState({isDisabled: this.props.isDisabled}));
                                });
                            }}
                            disabled={this.state.isDisabled}
                            activeOpacity={0.8}
                            style={[
                                styles.flexRow,
                                styles.alignItemsCenter,
                                styles.justifyContentBetween,
                                styles.sidebarLink,
                                this.props.shouldDisableRowInnerPadding ? null : styles.sidebarLinkInner,
                                this.props.optionIsFocused ? styles.sidebarLinkActive : null,
                                hovered && !this.props.optionIsFocused ? this.props.hoverStyle : null,
                                this.props.isDisabled && styles.cursorDisabled,
                                this.props.shouldHaveOptionSeparator && styles.borderTop,
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
                                        !_.isEmpty(this.props.option.icons)
                                        && (
                                            this.props.option.shouldShowSubscript ? (
                                                <SubscriptAvatar
                                                    mainAvatar={this.props.option.icons[0]}
                                                    secondaryAvatar={this.props.option.icons[1]}
                                                    mainTooltip={this.props.option.ownerEmail}
                                                    secondaryTooltip={this.props.option.subtitle}
                                                    size={CONST.AVATAR_SIZE.DEFAULT}
                                                    backgroundColor={
                                                    hovered && !this.props.optionIsFocused
                                                        ? hoveredBackgroundColor
                                                        : subscriptColor
                                                    }
                                                />
                                            ) : (
                                                <MultipleAvatars
                                                    icons={this.props.option.icons}
                                                    size={CONST.AVATAR_SIZE.DEFAULT}
                                                    secondAvatarStyle={[
                                                        StyleUtils.getBackgroundAndBorderStyle(themeColors.appBG),
                                                        this.props.optionIsFocused
                                                            ? StyleUtils.getBackgroundAndBorderStyle(focusedBackgroundColor)
                                                            : undefined,
                                                        hovered && !this.props.optionIsFocused
                                                            ? StyleUtils.getBackgroundAndBorderStyle(hoveredBackgroundColor)
                                                            : undefined,
                                                    ]}
                                                    avatarTooltips={this.props.option.isPolicyExpenseChat ? [this.props.option.subtitle] : avatarTooltips}
                                                />
                                            )
                                        )
                                    }
                                    <View style={contentContainerStyles}>
                                        <DisplayNames
                                            accessibilityLabel="Chat user display names"
                                            fullTitle={this.props.option.text}
                                            displayNamesWithTooltips={displayNamesWithTooltips}
                                            tooltipEnabled={this.props.showTitleTooltip}
                                            numberOfLines={1}
                                            textStyles={displayNameStyle}
                                            shouldUseFullTitle={this.props.option.isChatRoom || this.props.option.isPolicyExpenseChat}
                                        />
                                        {this.props.option.alternateText ? (
                                            <Text
                                                style={alternateTextStyle}
                                                numberOfLines={1}
                                            >
                                                {this.props.option.alternateText}
                                            </Text>
                                        ) : null}
                                    </View>
                                    {this.props.option.descriptiveText ? (
                                        <View style={[styles.flexWrap, styles.pl2]}>
                                            <Text style={[styles.textLabel]}>
                                                {this.props.option.descriptiveText}
                                            </Text>
                                        </View>
                                    ) : null}
                                    {this.props.option.brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR && (
                                    <View style={[styles.alignItemsCenter, styles.justifyContentCenter]}>
                                        <Icon
                                            src={Expensicons.DotIndicator}
                                            fill={themeColors.danger}
                                            height={variables.iconSizeSmall}
                                            width={variables.iconSizeSmall}
                                        />
                                    </View>
                                    )}
                                    {this.props.showSelectedState && <SelectCircle isChecked={this.props.isSelected} />}
                                </View>
                            </View>
                            {this.props.option.customIcon && (
                                <View
                                    style={[styles.flexRow, styles.alignItemsCenter]}
                                    accessible={false}
                                >
                                    <View>
                                        <Icon
                                            src={lodashGet(this.props.option, 'customIcon.src', '')}
                                            height={16}
                                            width={16}
                                            fill={lodashGet(this.props.option, 'customIcon.color')}
                                        />
                                    </View>
                                </View>
                            )}
                        </TouchableOpacity>
                    )}
                </Hoverable>
            </OfflineWithFeedback>
        );
    }
}

OptionRow.propTypes = propTypes;
OptionRow.defaultProps = defaultProps;

export default withLocalize(OptionRow);
