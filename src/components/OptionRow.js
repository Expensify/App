import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useEffect, useRef, useState} from 'react';
import {InteractionManager, StyleSheet, View} from 'react-native';
import _ from 'underscore';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as StyleUtils from '@styles/StyleUtils';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import Button from './Button';
import DisplayNames from './DisplayNames';
import Hoverable from './Hoverable';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import MultipleAvatars from './MultipleAvatars';
import OfflineWithFeedback from './OfflineWithFeedback';
import optionPropTypes from './optionPropTypes';
import PressableWithFeedback from './Pressable/PressableWithFeedback';
import SelectCircle from './SelectCircle';
import SubscriptAvatar from './SubscriptAvatar';
import Text from './Text';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

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

    /** Whether to show a button pill instead of a tickbox */
    shouldShowSelectedStateAsButton: PropTypes.bool,

    /** Text for button pill */
    selectedStateButtonText: PropTypes.string,

    /** Callback to fire when the multiple selector (tickbox or button) is clicked */
    onSelectedStatePressed: PropTypes.func,

    /** Whether we highlight selected option */
    highlightSelected: PropTypes.bool,

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

    /** Whether to prevent default focusing on select */
    shouldPreventDefaultFocusOnSelectRow: PropTypes.bool,

    /** Whether to wrap large text up to 2 lines */
    isMultilineSupported: PropTypes.bool,

    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    ...withLocalizePropTypes,
};

const defaultProps = {
    hoverStyle: undefined,
    showSelectedState: false,
    shouldShowSelectedStateAsButton: false,
    selectedStateButtonText: 'Select',
    onSelectedStatePressed: () => {},
    highlightSelected: false,
    isSelected: false,
    boldStyle: false,
    showTitleTooltip: false,
    onSelectRow: undefined,
    isDisabled: false,
    optionIsFocused: false,
    isMultilineSupported: false,
    style: null,
    shouldHaveOptionSeparator: false,
    shouldDisableRowInnerPadding: false,
    shouldPreventDefaultFocusOnSelectRow: false,
};

function OptionRow(props) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const pressableRef = useRef(null);
    const [isDisabled, setIsDisabled] = useState(props.isDisabled);

    useEffect(() => {
        setIsDisabled(props.isDisabled);
    }, [props.isDisabled]);

    const text = lodashGet(props.option, 'text', '');
    const fullTitle = props.isMultilineSupported ? text.trimStart() : text;
    const indentsLength = text.length - fullTitle.length;
    const paddingLeft = Math.floor(indentsLength / CONST.INDENTS.length) * styles.ml3.marginLeft;
    const textStyle = props.optionIsFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText;
    const textUnreadStyle = props.boldStyle || props.option.boldStyle ? [textStyle, styles.sidebarLinkTextBold] : [textStyle];
    const displayNameStyle = StyleUtils.combineStyles(
        styles.optionDisplayName,
        textUnreadStyle,
        props.style,
        styles.pre,
        isDisabled ? styles.optionRowDisabled : {},
        props.isMultilineSupported ? {paddingLeft} : {},
    );
    const alternateTextStyle = StyleUtils.combineStyles(
        textStyle,
        styles.optionAlternateText,
        styles.textLabelSupporting,
        props.style,
        lodashGet(props.option, 'alternateTextMaxLines', 1) === 1 ? styles.pre : styles.preWrap,
    );
    const contentContainerStyles = [styles.flex1];
    const sidebarInnerRowStyle = StyleSheet.flatten([styles.chatLinkRowPressable, styles.flexGrow1, styles.optionItemAvatarNameWrapper, styles.optionRow, styles.justifyContentCenter]);
    const hoveredBackgroundColor =
        (props.hoverStyle || styles.sidebarLinkHover) && (props.hoverStyle || styles.sidebarLinkHover).backgroundColor
            ? (props.hoverStyle || styles.sidebarLinkHover).backgroundColor
            : props.backgroundColor;
    const focusedBackgroundColor = styles.sidebarLinkActive.backgroundColor;
    const isMultipleParticipant = lodashGet(props.option, 'participantsList.length', 0) > 1;
    const defaultSubscriptSize = props.option.isExpenseRequest ? CONST.AVATAR_SIZE.SMALL_NORMAL : CONST.AVATAR_SIZE.DEFAULT;

    // We only create tooltips for the first 10 users or so since some reports have hundreds of users, causing performance to degrade.
    const displayNamesWithTooltips = ReportUtils.getDisplayNamesWithTooltips(
        (props.option.participantsList || (props.option.accountID ? [props.option] : [])).slice(0, 10),
        isMultipleParticipant,
    );
    let subscriptColor = theme.appBG;
    if (props.optionIsFocused) {
        subscriptColor = focusedBackgroundColor;
    }

    return (
        <OfflineWithFeedback
            pendingAction={props.option.pendingAction}
            errors={props.option.allReportErrors}
            shouldShowErrorMessages={false}
            needsOffscreenAlphaCompositing
        >
            <Hoverable>
                {(hovered) => (
                    <PressableWithFeedback
                        ref={(el) => (pressableRef.current = el)}
                        onPress={(e) => {
                            if (!props.onSelectRow) {
                                return;
                            }

                            setIsDisabled(true);
                            if (e) {
                                e.preventDefault();
                            }
                            let result = props.onSelectRow(props.option, pressableRef.current);
                            if (!(result instanceof Promise)) {
                                result = Promise.resolve();
                            }
                            InteractionManager.runAfterInteractions(() => {
                                result.finally(() => setIsDisabled(props.isDisabled));
                            });
                        }}
                        disabled={isDisabled}
                        style={[
                            styles.flexRow,
                            styles.alignItemsCenter,
                            styles.justifyContentBetween,
                            styles.sidebarLink,
                            !props.isDisabled && styles.cursorPointer,
                            props.shouldDisableRowInnerPadding ? null : styles.sidebarLinkInner,
                            props.optionIsFocused ? styles.sidebarLinkActive : null,
                            props.shouldHaveOptionSeparator && styles.borderTop,
                            !props.onSelectRow && !props.isDisabled ? styles.cursorDefault : null,
                        ]}
                        accessibilityLabel={props.option.text}
                        role={CONST.ACCESSIBILITY_ROLE.BUTTON}
                        hoverDimmingValue={1}
                        hoverStyle={props.hoverStyle || styles.sidebarLinkHover}
                        needsOffscreenAlphaCompositing={lodashGet(props.option, 'icons.length', 0) >= 2}
                        onMouseDown={props.shouldPreventDefaultFocusOnSelectRow ? (e) => e.preventDefault() : undefined}
                    >
                        <View style={sidebarInnerRowStyle}>
                            <View style={[styles.flexRow, styles.alignItemsCenter]}>
                                {!_.isEmpty(props.option.icons) &&
                                    (props.option.shouldShowSubscript ? (
                                        <SubscriptAvatar
                                            mainAvatar={props.option.icons[0]}
                                            secondaryAvatar={props.option.icons[1]}
                                            backgroundColor={hovered ? hoveredBackgroundColor : subscriptColor}
                                            size={defaultSubscriptSize}
                                        />
                                    ) : (
                                        <MultipleAvatars
                                            icons={props.option.icons}
                                            size={CONST.AVATAR_SIZE.DEFAULT}
                                            secondAvatarStyle={[StyleUtils.getBackgroundAndBorderStyle(hovered ? hoveredBackgroundColor : subscriptColor)]}
                                            shouldShowTooltip={props.showTitleTooltip && OptionsListUtils.shouldOptionShowTooltip(props.option)}
                                        />
                                    ))}
                                <View style={contentContainerStyles}>
                                    <DisplayNames
                                        accessibilityLabel={props.translate('accessibilityHints.chatUserDisplayNames')}
                                        fullTitle={fullTitle}
                                        displayNamesWithTooltips={displayNamesWithTooltips}
                                        tooltipEnabled={props.showTitleTooltip}
                                        numberOfLines={props.isMultilineSupported ? 2 : 1}
                                        textStyles={displayNameStyle}
                                        shouldUseFullTitle={
                                            props.option.isChatRoom ||
                                            props.option.isPolicyExpenseChat ||
                                            props.option.isMoneyRequestReport ||
                                            props.option.isThread ||
                                            props.option.isTaskReport
                                        }
                                    />
                                    {props.option.alternateText ? (
                                        <Text
                                            style={alternateTextStyle}
                                            numberOfLines={lodashGet(props.option, 'alternateTextMaxLines', 1)}
                                        >
                                            {props.option.alternateText}
                                        </Text>
                                    ) : null}
                                </View>
                                {props.option.descriptiveText ? (
                                    <View style={[styles.flexWrap, styles.pl2]}>
                                        <Text style={[styles.textLabel]}>{props.option.descriptiveText}</Text>
                                    </View>
                                ) : null}
                                {props.option.brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR && (
                                    <View style={[styles.alignItemsCenter, styles.justifyContentCenter]}>
                                        <Icon
                                            src={Expensicons.DotIndicator}
                                            fill={theme.danger}
                                        />
                                    </View>
                                )}
                                {props.showSelectedState && (
                                    <>
                                        {props.shouldShowSelectedStateAsButton && !props.isSelected ? (
                                            <Button
                                                style={[styles.pl2]}
                                                text={props.selectedStateButtonText}
                                                onPress={() => props.onSelectedStatePressed(props.option)}
                                                small
                                            />
                                        ) : (
                                            <PressableWithFeedback
                                                onPress={() => props.onSelectedStatePressed(props.option)}
                                                disabled={isDisabled}
                                                role={CONST.ACCESSIBILITY_ROLE.CHECKBOX}
                                                accessibilityLabel={CONST.ACCESSIBILITY_ROLE.CHECKBOX}
                                            >
                                                <SelectCircle isChecked={props.isSelected} />
                                            </PressableWithFeedback>
                                        )}
                                    </>
                                )}
                                {props.isSelected && props.highlightSelected && (
                                    <View style={styles.defaultCheckmarkWrapper}>
                                        <Icon
                                            src={Expensicons.Checkmark}
                                            fill={theme.iconSuccessFill}
                                        />
                                    </View>
                                )}
                            </View>
                        </View>
                        {Boolean(props.option.customIcon) && (
                            <View
                                style={[styles.flexRow, styles.alignItemsCenter]}
                                accessible={false}
                            >
                                <View>
                                    <Icon
                                        src={lodashGet(props.option, 'customIcon.src', '')}
                                        fill={lodashGet(props.option, 'customIcon.color')}
                                    />
                                </View>
                            </View>
                        )}
                    </PressableWithFeedback>
                )}
            </Hoverable>
        </OfflineWithFeedback>
    );
}

OptionRow.propTypes = propTypes;
OptionRow.defaultProps = defaultProps;
OptionRow.displayName = 'OptionRow';

export default React.memo(
    withLocalize(OptionRow),
    (prevProps, nextProps) =>
        prevProps.isDisabled === nextProps.isDisabled &&
        prevProps.isMultilineSupported === nextProps.isMultilineSupported &&
        prevProps.isSelected === nextProps.isSelected &&
        prevProps.shouldHaveOptionSeparator === nextProps.shouldHaveOptionSeparator &&
        prevProps.selectedStateButtonText === nextProps.selectedStateButtonText &&
        prevProps.showSelectedState === nextProps.showSelectedState &&
        prevProps.highlightSelected === nextProps.highlightSelected &&
        prevProps.showTitleTooltip === nextProps.showTitleTooltip &&
        !_.isEqual(prevProps.option.icons, nextProps.option.icons) &&
        prevProps.optionIsFocused === nextProps.optionIsFocused &&
        prevProps.option.text === nextProps.option.text &&
        prevProps.option.alternateText === nextProps.option.alternateText &&
        prevProps.option.descriptiveText === nextProps.option.descriptiveText &&
        prevProps.option.brickRoadIndicator === nextProps.option.brickRoadIndicator &&
        prevProps.option.shouldShowSubscript === nextProps.option.shouldShowSubscript &&
        prevProps.option.ownerAccountID === nextProps.option.ownerAccountID &&
        prevProps.option.subtitle === nextProps.option.subtitle &&
        prevProps.option.pendingAction === nextProps.option.pendingAction &&
        prevProps.option.customIcon === nextProps.option.customIcon,
);
