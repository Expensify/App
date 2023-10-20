import _ from 'underscore';
import React, {useEffect, useMemo} from 'react';
import {View} from 'react-native';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import Text from './Text';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import * as StyleUtils from '../styles/StyleUtils';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import getButtonState from '../libs/getButtonState';
import convertToLTR from '../libs/convertToLTR';
import Avatar from './Avatar';
import Badge from './Badge';
import CONST from '../CONST';
import menuItemPropTypes from './menuItemPropTypes';
import SelectCircle from './SelectCircle';
import MultipleAvatars from './MultipleAvatars';
import * as defaultWorkspaceAvatars from './Icon/WorkspaceDefaultAvatars';
import PressableWithSecondaryInteraction from './PressableWithSecondaryInteraction';
import * as DeviceCapabilities from '../libs/DeviceCapabilities';
import ControlSelection from '../libs/ControlSelection';
import variables from '../styles/variables';
import * as Session from '../libs/actions/Session';
import Hoverable from './Hoverable';
import useWindowDimensions from '../hooks/useWindowDimensions';
import RenderHTML from './RenderHTML';
import DisplayNames from './DisplayNames';

const propTypes = menuItemPropTypes;

const defaultProps = {
    badgeText: undefined,
    shouldShowRightIcon: false,
    shouldShowSelectedState: false,
    shouldShowBasicTitle: false,
    shouldShowDescriptionOnTop: false,
    shouldShowHeaderTitle: false,
    shouldParseTitle: false,
    wrapperStyle: [],
    style: styles.popoverMenuItem,
    titleStyle: {},
    shouldShowTitleIcon: false,
    titleIcon: () => {},
    descriptionTextStyle: styles.breakWord,
    success: false,
    icon: undefined,
    secondaryIcon: undefined,
    iconWidth: undefined,
    iconHeight: undefined,
    description: undefined,
    iconRight: Expensicons.ArrowRight,
    iconStyles: [],
    iconFill: undefined,
    secondaryIconFill: undefined,
    focused: false,
    disabled: false,
    isSelected: false,
    subtitle: undefined,
    iconType: CONST.ICON_TYPE_ICON,
    onPress: () => {},
    onSecondaryInteraction: undefined,
    interactive: true,
    fallbackIcon: Expensicons.FallbackAvatar,
    brickRoadIndicator: '',
    floatRightAvatars: [],
    shouldStackHorizontally: false,
    avatarSize: CONST.AVATAR_SIZE.DEFAULT,
    floatRightAvatarSize: undefined,
    shouldBlockSelection: false,
    hoverAndPressStyle: [],
    furtherDetails: '',
    furtherDetailsIcon: undefined,
    isAnonymousAction: false,
    isSmallAvatarSubscriptMenu: false,
    title: '',
    numberOfLinesTitle: 1,
    shouldGreyOutWhenDisabled: true,
    error: '',
    shouldRenderAsHTML: false,
    rightComponent: undefined,
    shouldShowRightComponent: false,
    titleWithTooltips: [],
    shouldCheckActionAllowedOnPress: true,
};

const MenuItem = React.forwardRef((props, ref) => {
    const {isSmallScreenWidth} = useWindowDimensions();
    const [html, setHtml] = React.useState('');

    const isDeleted = _.contains(props.style, styles.offlineFeedback.deleted);
    const descriptionVerticalMargin = props.shouldShowDescriptionOnTop ? styles.mb1 : styles.mt1;
    const titleTextStyle = StyleUtils.combineStyles(
        [
            styles.flexShrink1,
            styles.popoverMenuText,
            props.icon && !_.isArray(props.icon) && (props.avatarSize === CONST.AVATAR_SIZE.SMALL ? styles.ml2 : styles.ml3),
            props.shouldShowBasicTitle ? undefined : styles.textStrong,
            props.shouldShowHeaderTitle ? styles.textHeadlineH1 : undefined,
            props.numberOfLinesTitle !== 1 ? styles.preWrap : styles.pre,
            props.interactive && props.disabled ? {...styles.userSelectNone} : undefined,
            styles.ltr,
            isDeleted ? styles.offlineFeedback.deleted : undefined,
        ],
        props.titleStyle,
    );
    const descriptionTextStyle = StyleUtils.combineStyles([
        styles.textLabelSupporting,
        props.icon && !_.isArray(props.icon) ? styles.ml3 : undefined,
        props.title ? descriptionVerticalMargin : StyleUtils.getFontSizeStyle(variables.fontSizeNormal),
        props.descriptionTextStyle,
        isDeleted ? styles.offlineFeedback.deleted : undefined,
    ]);

    const fallbackAvatarSize = props.viewMode === CONST.OPTION_MODE.COMPACT ? CONST.AVATAR_SIZE.SMALL : CONST.AVATAR_SIZE.DEFAULT;

    const titleRef = React.useRef('');
    useEffect(() => {
        if (!props.title || (titleRef.current.length && titleRef.current === props.title) || !props.shouldParseTitle) {
            return;
        }
        const parser = new ExpensiMark();
        setHtml(parser.replace(props.title));
        titleRef.current = props.title;
    }, [props.title, props.shouldParseTitle]);

    const getProcessedTitle = useMemo(() => {
        let title = '';
        if (props.shouldRenderAsHTML) {
            title = convertToLTR(props.title);
        }

        if (props.shouldParseTitle) {
            title = html;
        }

        return title ? `<comment>${title}</comment>` : '';
    }, [props.title, props.shouldRenderAsHTML, props.shouldParseTitle, html]);

    const hasPressableRightComponent = props.iconRight || (props.rightComponent && props.shouldShowRightComponent);

    const renderTitleContent = () => {
        if (props.titleWithTooltips && _.isArray(props.titleWithTooltips) && props.titleWithTooltips.length > 0) {
            return (
                <DisplayNames
                    fullTitle={props.title}
                    displayNamesWithTooltips={props.titleWithTooltips}
                    tooltipEnabled
                    numberOfLines={1}
                />
            );
        }

        return convertToLTR(props.title);
    };

    const onPressAction = (e) => {
        if (props.disabled || !props.interactive) {
            return;
        }

        if (e && e.type === 'click') {
            e.currentTarget.blur();
        }

        props.onPress(e);
    };

    return (
        <Hoverable>
            {(isHovered) => (
                <PressableWithSecondaryInteraction
                    onPress={props.shouldCheckActionAllowedOnPress ? Session.checkIfActionIsAllowed(onPressAction, props.isAnonymousAction) : onPressAction}
                    onPressIn={() => props.shouldBlockSelection && isSmallScreenWidth && DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
                    onPressOut={ControlSelection.unblock}
                    onSecondaryInteraction={props.onSecondaryInteraction}
                    style={({pressed}) => [
                        props.style,
                        !props.interactive && styles.cursorDefault,
                        StyleUtils.getButtonBackgroundColorStyle(getButtonState(props.focused || isHovered, pressed, props.success, props.disabled, props.interactive), true),
                        (isHovered || pressed) && props.hoverAndPressStyle,
                        ...(_.isArray(props.wrapperStyle) ? props.wrapperStyle : [props.wrapperStyle]),
                        props.shouldGreyOutWhenDisabled && props.disabled && styles.buttonOpacityDisabled,
                    ]}
                    disabled={props.disabled}
                    ref={ref}
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.MENUITEM}
                    accessibilityLabel={props.title ? props.title.toString() : ''}
                >
                    {({pressed}) => (
                        <>
                            <View style={[styles.flexColumn, styles.flex1]}>
                                {Boolean(props.label) && (
                                    <View style={props.icon ? styles.mb2 : null}>
                                        <Text style={StyleUtils.combineStyles(styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting, styles.pre)}>
                                            {props.label}
                                        </Text>
                                    </View>
                                )}
                                <View style={[styles.flexRow, styles.pointerEventsAuto, props.disabled && styles.cursorDisabled]}>
                                    {Boolean(props.icon) && _.isArray(props.icon) && (
                                        <MultipleAvatars
                                            isHovered={isHovered}
                                            isPressed={pressed}
                                            icons={props.icon}
                                            size={props.avatarSize}
                                            secondAvatarStyle={[
                                                StyleUtils.getBackgroundAndBorderStyle(themeColors.sidebar),
                                                pressed && props.interactive ? StyleUtils.getBackgroundAndBorderStyle(themeColors.buttonPressedBG) : undefined,
                                                isHovered && !pressed && props.interactive ? StyleUtils.getBackgroundAndBorderStyle(themeColors.border) : undefined,
                                            ]}
                                        />
                                    )}
                                    {Boolean(props.icon) && !_.isArray(props.icon) && (
                                        <View style={[styles.popoverMenuIcon, ...props.iconStyles, StyleUtils.getAvatarWidthStyle(props.avatarSize)]}>
                                            {props.iconType === CONST.ICON_TYPE_ICON && (
                                                <Icon
                                                    hovered={isHovered}
                                                    pressed={pressed}
                                                    src={props.icon}
                                                    width={props.iconWidth}
                                                    height={props.iconHeight}
                                                    fill={
                                                        props.iconFill ||
                                                        StyleUtils.getIconFillColor(
                                                            getButtonState(props.focused || isHovered, pressed, props.success, props.disabled, props.interactive),
                                                            true,
                                                        )
                                                    }
                                                />
                                            )}
                                            {props.iconType === CONST.ICON_TYPE_WORKSPACE && (
                                                <Avatar
                                                    imageStyles={[styles.alignSelfCenter]}
                                                    size={CONST.AVATAR_SIZE.DEFAULT}
                                                    source={props.icon}
                                                    fallbackIcon={props.fallbackIcon}
                                                    name={props.title}
                                                    type={CONST.ICON_TYPE_WORKSPACE}
                                                />
                                            )}
                                            {props.iconType === CONST.ICON_TYPE_AVATAR && (
                                                <Avatar
                                                    imageStyles={[styles.alignSelfCenter]}
                                                    source={props.icon}
                                                    fallbackIcon={props.fallbackIcon}
                                                    size={props.avatarSize}
                                                />
                                            )}
                                        </View>
                                    )}
                                    {Boolean(props.secondaryIcon) && (
                                        <View style={[styles.popoverMenuIcon, ...props.iconStyles]}>
                                            <Icon
                                                src={props.secondaryIcon}
                                                width={props.iconWidth}
                                                height={props.iconHeight}
                                                fill={
                                                    props.secondaryIconFill ||
                                                    StyleUtils.getIconFillColor(getButtonState(props.focused || isHovered, pressed, props.success, props.disabled, props.interactive), true)
                                                }
                                            />
                                        </View>
                                    )}
                                    <View style={[styles.justifyContentCenter, styles.flex1, StyleUtils.getMenuItemTextContainerStyle(props.isSmallAvatarSubscriptMenu)]}>
                                        {Boolean(props.description) && props.shouldShowDescriptionOnTop && (
                                            <Text
                                                style={descriptionTextStyle}
                                                numberOfLines={2}
                                            >
                                                {props.description}
                                            </Text>
                                        )}
                                        <View style={[styles.flexRow, styles.alignItemsCenter]}>
                                            {Boolean(props.title) && (Boolean(props.shouldRenderAsHTML) || (Boolean(props.shouldParseTitle) && Boolean(html.length))) && (
                                                <View style={styles.renderHTMLTitle}>
                                                    <RenderHTML html={getProcessedTitle} />
                                                </View>
                                            )}
                                            {!props.shouldRenderAsHTML && !props.shouldParseTitle && Boolean(props.title) && (
                                                <Text
                                                    style={titleTextStyle}
                                                    numberOfLines={props.numberOfLinesTitle || undefined}
                                                    dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: props.interactive && props.disabled}}
                                                >
                                                    {renderTitleContent()}
                                                </Text>
                                            )}
                                            {Boolean(props.shouldShowTitleIcon) && (
                                                <View style={[styles.ml2]}>
                                                    <Icon
                                                        src={props.titleIcon}
                                                        fill={themeColors.iconSuccessFill}
                                                    />
                                                </View>
                                            )}
                                        </View>
                                        {Boolean(props.description) && !props.shouldShowDescriptionOnTop && (
                                            <Text
                                                style={descriptionTextStyle}
                                                numberOfLines={2}
                                            >
                                                {props.description}
                                            </Text>
                                        )}
                                        {Boolean(props.error) && (
                                            <View style={[styles.mt1]}>
                                                <Text style={[styles.textLabelError]}>{props.error}</Text>
                                            </View>
                                        )}
                                        {Boolean(props.furtherDetails) && (
                                            <View style={[styles.flexRow, styles.mt1, styles.alignItemsCenter]}>
                                                <Icon
                                                    src={props.furtherDetailsIcon}
                                                    height={variables.iconSizeNormal}
                                                    width={variables.iconSizeNormal}
                                                    inline
                                                />
                                                <Text
                                                    style={[styles.furtherDetailsText, styles.ph2, styles.pt1]}
                                                    numberOfLines={2}
                                                >
                                                    {props.furtherDetails}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>
                            <View style={[styles.flexRow, styles.menuItemTextContainer, !hasPressableRightComponent && styles.pointerEventsNone]}>
                                {Boolean(props.badgeText) && (
                                    <Badge
                                        text={props.badgeText}
                                        badgeStyles={[
                                            styles.alignSelfCenter,
                                            props.brickRoadIndicator ? styles.mr2 : undefined,
                                            props.focused || isHovered || pressed ? styles.hoveredButton : {},
                                        ]}
                                    />
                                )}
                                {/* Since subtitle can be of type number, we should allow 0 to be shown */}
                                {(props.subtitle || props.subtitle === 0) && (
                                    <View style={[styles.justifyContentCenter, styles.mr1]}>
                                        <Text style={[styles.textLabelSupporting, props.style]}>{props.subtitle}</Text>
                                    </View>
                                )}
                                {!_.isEmpty(props.floatRightAvatars) && (
                                    <View style={[styles.justifyContentCenter, props.brickRoadIndicator ? styles.mr2 : undefined]}>
                                        <MultipleAvatars
                                            isHovered={isHovered}
                                            isPressed={pressed}
                                            icons={props.floatRightAvatars}
                                            size={props.floatRightAvatarSize || fallbackAvatarSize}
                                            fallbackIcon={defaultWorkspaceAvatars.WorkspaceBuilding}
                                            shouldStackHorizontally={props.shouldStackHorizontally}
                                        />
                                    </View>
                                )}
                                {Boolean(props.brickRoadIndicator) && (
                                    <View style={[styles.alignItemsCenter, styles.justifyContentCenter, styles.ml1]}>
                                        <Icon
                                            src={Expensicons.DotIndicator}
                                            fill={props.brickRoadIndicator === 'error' ? themeColors.danger : themeColors.success}
                                        />
                                    </View>
                                )}
                                {Boolean(props.shouldShowRightIcon) && (
                                    <View style={[styles.popoverMenuIcon, styles.pointerEventsAuto, props.disabled && styles.cursorDisabled]}>
                                        <Icon
                                            src={props.iconRight}
                                            fill={StyleUtils.getIconFillColor(getButtonState(props.focused || isHovered, pressed, props.success, props.disabled, props.interactive))}
                                        />
                                    </View>
                                )}
                                {props.shouldShowRightComponent && props.rightComponent}
                                {props.shouldShowSelectedState && <SelectCircle isChecked={props.isSelected} />}
                            </View>
                        </>
                    )}
                </PressableWithSecondaryInteraction>
            )}
        </Hoverable>
    );
});

MenuItem.propTypes = propTypes;
MenuItem.defaultProps = defaultProps;
MenuItem.displayName = 'MenuItem';

export default MenuItem;
