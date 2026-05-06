import React, {useRef} from 'react';
import type {ViewStyle} from 'react-native';
import {StyleSheet, View} from 'react-native';
import Icon from '@components/Icon';
import {useLHNTooltipContext} from '@components/LHNOptionsList/LHNTooltipContext';
import type {OptionRowLHNProps} from '@components/LHNOptionsList/types';
import Text from '@components/Text';
import getContextMenuAccessibilityHint from '@components/utils/getContextMenuAccessibilityHint';
import getContextMenuAccessibilityProps from '@components/utils/getContextMenuAccessibilityProps';
import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import FS from '@libs/Fullstory';
import {shouldUseBoldText} from '@libs/OptionsListUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import OptionRowAlternateText from './OptionRowAlternateText';
import OptionRowAvatar from './OptionRowAvatar';
import OptionRowErrorBadge from './OptionRowErrorBadge';
import OptionRowInfoBadge from './OptionRowInfoBadge';
import OptionRowPressable from './OptionRowPressable';
import OptionRowTitleWithStatus from './OptionRowTitleWithStatus';
import OptionRowTooltipLayer from './OptionRowTooltipLayer';

function OptionRowLHN({
    reportID,
    report,
    isOptionFocused = false,
    onSelectRow = () => {},
    optionItem,
    viewMode = 'default',
    style,
    onLayout = () => {},
    hasDraftComment,
    testID,
}: OptionRowLHNProps) {
    const {isProduction} = useEnvironment();
    const theme = useTheme();
    const styles = useThemeStyles();
    const popoverAnchor = useRef<View>(null);
    const StyleUtils = useStyleUtils();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Pencil', 'Pin']);

    const {isScreenFocused} = useLHNTooltipContext();

    const {translate} = useLocalize();
    const isInFocusMode = viewMode === CONST.OPTION_MODE.COMPACT;
    const sidebarInnerRowStyle = StyleSheet.flatten<ViewStyle>(
        isInFocusMode
            ? [styles.chatLinkRowPressable, styles.flexGrow1, styles.optionItemAvatarNameWrapper, styles.optionRowCompact, styles.justifyContentCenter]
            : [styles.chatLinkRowPressable, styles.flexGrow1, styles.optionItemAvatarNameWrapper, styles.optionRow, styles.justifyContentCenter],
    );

    const singleAvatarContainerStyle = [styles.actionAvatar, styles.mr3];

    const brickRoadIndicator = optionItem.brickRoadIndicator;
    const actionBadgeText = !isProduction && optionItem.actionBadge ? translate(`common.actionBadge.${optionItem.actionBadge}`) : '';
    let accessibilityLabelForBadge = '';
    if (brickRoadIndicator) {
        accessibilityLabelForBadge = [translate('common.yourReviewIsRequired'), actionBadgeText].filter(Boolean).join(', ');
    } else if (optionItem.isPinned) {
        accessibilityLabelForBadge = translate('common.pinned');
    }
    const textStyle = isOptionFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText;
    const textUnreadStyle = shouldUseBoldText(optionItem) ? [textStyle, styles.sidebarLinkTextBold] : [textStyle];
    const displayNameStyle = [styles.optionDisplayName, styles.optionDisplayNameCompact, styles.pre, textUnreadStyle, styles.flexShrink0, style];

    const contentContainerStyles = isInFocusMode ? [styles.flex1, styles.flexRow, styles.overflowHidden, StyleUtils.getCompactContentContainerStyles()] : [styles.flex1];
    const hoveredBackgroundColor = !!styles.sidebarLinkHover && 'backgroundColor' in styles.sidebarLinkHover ? styles.sidebarLinkHover.backgroundColor : theme.sidebar;
    const focusedBackgroundColor = styles.sidebarLinkActive.backgroundColor;

    const subscriptAvatarBorderColor = isOptionFocused ? focusedBackgroundColor : theme.sidebar;

    const accessibilityLabel = [
        `${translate('accessibilityHints.navigatesToChat')} ${optionItem.text}`,
        optionItem.isUnread ? translate('common.unread') : '',
        optionItem.alternateText ?? '',
        accessibilityLabelForBadge,
    ]
        .filter(Boolean)
        .join('. ');
    const contextMenuHint = getContextMenuAccessibilityHint({translate});
    const {accessibilityLabel: accessibilityLabelWithContextMenuHint, accessibilityHint} = getContextMenuAccessibilityProps({
        accessibilityLabel,
        nativeAccessibilityHint: accessibilityLabel,
        contextMenuHint,
    });

    const renderPressableRow = () => (
        <OptionRowPressable
            reportID={reportID}
            optionItem={optionItem}
            isOptionFocused={isOptionFocused}
            isScreenFocused={isScreenFocused}
            popoverAnchor={popoverAnchor}
            onSelectRow={onSelectRow}
            onLayout={onLayout}
            accessibilityLabel={accessibilityLabelWithContextMenuHint}
            accessibilityHint={accessibilityHint}
            // reportID may be a number contrary to the type definition
            testID={typeof optionItem.reportID === 'number' ? String(optionItem.reportID) : optionItem.reportID}
        >
            {(hovered) => {
                let secondaryAvatarBgColor = theme.sidebar;
                if (isOptionFocused) {
                    secondaryAvatarBgColor = focusedBackgroundColor;
                } else if (hovered) {
                    secondaryAvatarBgColor = hoveredBackgroundColor;
                }
                return (
                    <>
                        <View style={sidebarInnerRowStyle}>
                            <View style={[styles.flexRow, styles.alignItemsCenter]}>
                                <OptionRowAvatar
                                    optionItem={optionItem}
                                    report={report}
                                    isInFocusMode={isInFocusMode}
                                    subscriptAvatarBorderColor={hovered && !isOptionFocused ? hoveredBackgroundColor : subscriptAvatarBorderColor}
                                    secondaryAvatarBackgroundColor={secondaryAvatarBgColor}
                                    singleAvatarContainerStyle={singleAvatarContainerStyle}
                                />
                                <View style={contentContainerStyles}>
                                    <OptionRowTitleWithStatus
                                        optionItem={optionItem}
                                        report={report}
                                        displayNameStyle={displayNameStyle}
                                        testID={testID}
                                    />
                                    <OptionRowAlternateText
                                        alternateText={optionItem.alternateText}
                                        report={report}
                                        viewMode={viewMode}
                                        isOptionFocused={isOptionFocused}
                                        style={style}
                                    />
                                </View>
                                {optionItem?.descriptiveText ? (
                                    <View
                                        style={[styles.flexWrap]}
                                        fsClass={FS.getChatFSClass(report)}
                                    >
                                        <Text style={[styles.textLabel]}>{optionItem.descriptiveText}</Text>
                                    </View>
                                ) : null}
                                <OptionRowErrorBadge
                                    brickRoadIndicator={brickRoadIndicator}
                                    actionBadgeText={actionBadgeText}
                                />
                            </View>
                        </View>
                        <View style={[styles.flexRow, styles.alignItemsCenter]}>
                            <OptionRowInfoBadge
                                brickRoadIndicator={brickRoadIndicator}
                                actionBadgeText={actionBadgeText}
                            />
                            {hasDraftComment && !!optionItem.isAllowedToComment && (
                                <View
                                    style={styles.ml2}
                                    accessibilityLabel={translate('sidebarScreen.draftedMessage')}
                                >
                                    <Icon
                                        testID="Pencil Icon"
                                        fill={theme.icon}
                                        src={expensifyIcons.Pencil}
                                        width={variables.iconSizeSmall}
                                        height={variables.iconSizeSmall}
                                    />
                                </View>
                            )}
                            {!brickRoadIndicator && !!optionItem.isPinned && (
                                <View
                                    style={styles.ml2}
                                    accessibilityLabel={translate('sidebarScreen.chatPinned')}
                                >
                                    <Icon
                                        testID="Pin Icon"
                                        fill={theme.icon}
                                        src={expensifyIcons.Pin}
                                        width={variables.iconSizeSmall}
                                        height={variables.iconSizeSmall}
                                    />
                                </View>
                            )}
                        </View>
                    </>
                );
            }}
        </OptionRowPressable>
    );

    return (
        <OptionRowTooltipLayer
            reportID={reportID}
            report={report}
            optionItem={optionItem}
            renderChildren={renderPressableRow}
        />
    );
}

OptionRowLHN.displayName = 'OptionRowLHN';

export default React.memo(OptionRowLHN);
