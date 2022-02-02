import _ from 'underscore';
import lodashGet from 'lodash/get';
import React, {Component} from 'react';
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

class OptionRow extends Component {
    constructor(props) {
        super(props);
        this.ref = null;
    }

    shouldComponentUpdate(nextProps) {
        if (this.props.optionIsFocused !== nextProps.optionIsFocused) {
            return false;
        }

        if (this.props.isSelected !== nextProps.isSelected) {
            return false;
        }

        if (this.props.mode !== nextProps.mode) {
            return false;
        }

        if (this.props.option.isUnread !== nextProps.option.isUnread) {
            return false;
        }

        if (this.props.option.alternateText !== nextProps.option.alternateText) {
            return false;
        }

        if (this.props.option.descriptiveText !== nextProps.option.descriptiveText) {
            return false;
        }

        if (this.props.option.hasDraftComment !== nextProps.option.hasDraftComment) {
            return false;
        }

        if (this.props.option.isPinned !== nextProps.option.isPinned) {
            return false;
        }

        if (this.props.option.hasOutstandingIOU !== nextProps.option.hasOutstandingIOU) {
            return false;
        }

        if (!_.isEqual(this.props.option.icons, nextProps.option.icons)) {
            return false;
        }

        // Re-render when the text changes
        if (this.props.option.text !== nextProps.option.text) {
            return false;
        }

        return true;
    }

    render() {
        const textStyle = this.props.optionIsFocused
            ? styles.sidebarLinkActiveText
            : styles.sidebarLinkText;
        const textUnreadStyle = (this.props.option.isUnread || this.props.forceTextUnreadStyle)
            ? [textStyle, styles.sidebarLinkTextUnread] : [textStyle];
        const displayNameStyle = this.props.mode === 'compact'
            ? [styles.optionDisplayName, ...textUnreadStyle, styles.optionDisplayNameCompact, styles.mr2]
            : [styles.optionDisplayName, ...textUnreadStyle];
        const alternateTextStyle = this.props.mode === 'compact'
            ? [textStyle, styles.optionAlternateText, styles.textLabelSupporting, styles.optionAlternateTextCompact]
            : [textStyle, styles.optionAlternateText, styles.textLabelSupporting];
        const contentContainerStyles = this.props.mode === 'compact'
            ? [styles.flex1, styles.flexRow, styles.overflowHidden, styles.alignItemsCenter]
            : [styles.flex1];
        const sidebarInnerRowStyle = StyleSheet.flatten(this.props.mode === 'compact' ? [
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
        const hoveredBackgroundColor = this.props.hoverStyle && this.props.hoverStyle.backgroundColor
            ? this.props.hoverStyle.backgroundColor
            : this.props.backgroundColor;
        const focusedBackgroundColor = styles.sidebarLinkActive.backgroundColor;
        const isMultipleParticipant = lodashGet(this.props.option, 'participantsList.length', 0) > 1;
        const displayNamesWithTooltips = _.map(

            // We only create tooltips for the first 10 users or so since some reports have hundreds of users causing
            // performance to degrade.
            (this.props.option.participantsList || []).slice(0, 10),
            ({displayName, firstName, login}) => {
                const displayNameTrimmed = Str.isSMSLogin(login) ? this.props.toLocalPhone(displayName) : displayName;

                return {
                    displayName: (isMultipleParticipant ? firstName : displayNameTrimmed) || Str.removeSMSDomain(login),
                    tooltip: Str.removeSMSDomain(login),
                };
            },
        );

        return (
            <Hoverable>
                {hovered => (
                    <TouchableOpacity
                        onPress={(e) => {
                            e.preventDefault();
                            this.props.onSelectRow(this.props.option, this.ref);
                        }}
                        disabled={this.props.disableRowInteractivity}
                        activeOpacity={0.8}
                        style={[
                            styles.flexRow,
                            styles.alignItemsCenter,
                            styles.justifyContentBetween,
                            styles.sidebarLink,
                            styles.sidebarLinkInner,
                            StyleUtils.getBackgroundColorStyle(this.props.backgroundColor),
                            this.props.optionIsFocused ? styles.sidebarLinkActive : null,
                            hovered && !this.props.optionIsFocused ? this.props.hoverStyle : null,
                            this.props.isDisabled && styles.cursorDisabled,
                        ]}
                        ref={ref => this.ref = ref}
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
                                        <MultipleAvatars
                                            avatarImageURLs={this.props.option.icons}
                                            size={this.props.mode === 'compact' ? 'small' : 'default'}
                                            secondAvatarStyle={[
                                                StyleUtils.getBackgroundAndBorderStyle(this.props.backgroundColor),
                                                this.props.optionIsFocused
                                                    ? StyleUtils.getBackgroundAndBorderStyle(focusedBackgroundColor)
                                                    : undefined,
                                                hovered && !this.props.optionIsFocused
                                                    ? StyleUtils.getBackgroundAndBorderStyle(hoveredBackgroundColor)
                                                    : undefined,
                                            ]}
                                            isChatRoom={this.props.option.isChatRoom}
                                            isArchivedRoom={this.props.option.isArchivedRoom}
                                        />
                                    )
                                }
                                <View style={contentContainerStyles}>
                                    <DisplayNames
                                        fullTitle={this.props.option.text}
                                        displayNamesWithTooltips={displayNamesWithTooltips}
                                        tooltipEnabled={this.props.showTitleTooltip}
                                        numberOfLines={1}
                                        textStyles={displayNameStyle}
                                        shouldUseFullTitle={this.props.option.isChatRoom}
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
                                    <View style={[styles.flexWrap]}>
                                        <Text style={[styles.textLabel]}>
                                            {this.props.option.descriptiveText}
                                        </Text>
                                    </View>
                                ) : null}
                                {this.props.showSelectedState && <SelectCircle isChecked={this.props.isSelected} />}
                            </View>
                        </View>
                        {!this.props.hideAdditionalOptionStates && (
                            <View style={[styles.flexRow, styles.alignItemsCenter]}>
                                {this.props.option.hasDraftComment && (
                                    <View style={styles.ml2}>
                                        <Icon src={Expensicons.Pencil} height={16} width={16} />
                                    </View>
                                )}
                                {this.props.option.hasOutstandingIOU && (
                                    <IOUBadge iouReportID={this.props.option.iouReportID} />
                                )}
                                {this.props.option.isPinned && (
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
    }
}

OptionRow.propTypes = propTypes;
OptionRow.defaultProps = defaultProps;
OptionRow.displayName = 'OptionRow';

export default withLocalize(OptionRow);
