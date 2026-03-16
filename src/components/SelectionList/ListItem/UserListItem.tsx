import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Icon from '@components/Icon';
import ReportActionAvatars from '@components/ReportActionAvatars';
import SelectionCheckbox from '@components/SelectionList/components/SelectionCheckbox';
import {ListItemFocusContext} from '@components/SelectionList/ListItemFocusContext';
import Text from '@components/Text';
import TextWithTooltip from '@components/TextWithTooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import getButtonState from '@libs/getButtonState';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import BaseListItem from './BaseListItem';
import type {ListItem, UserListItemProps} from './types';

const reportExistsSelector = (report: OnyxEntry<Report>) => !!report;

function UserListItem<TItem extends ListItem>({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    canSelectMultiple,
    onSelectRow,
    onCheckboxPress,
    onDismissError,
    shouldPreventEnterKeySubmit,
    rightHandSideComponent,
    onFocus,
    shouldSyncFocus,
    wrapperStyle,
    pressableStyle,
    shouldUseDefaultRightHandSideCheckmark,
    forwardedFSClass,
    shouldDisableHoverStyle,
}: UserListItemProps<TItem>) {
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight', 'Checkmark'] as const);
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();

    const focusedBackgroundColor = styles.sidebarLinkActive.backgroundColor;
    const subscriptAvatarBorderColor = isFocused ? focusedBackgroundColor : theme.sidebar;
    const hoveredBackgroundColor = !!styles.sidebarLinkHover && 'backgroundColor' in styles.sidebarLinkHover ? styles.sidebarLinkHover.backgroundColor : theme.sidebar;

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- some utils that are used to get reportID return empty string "", which would make subscription to the whole collection with nullish coalescing operator, example of this could be found in NewChatPage.tsx where some hooks return reportID as empty strings
    const [isReportInOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${item.reportID || undefined}`, {
        selector: reportExistsSelector,
    });

    const reportExists = isReportInOnyx && !!item.reportID;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const itemAccountID = Number(item.accountID || item.icons?.at(1)?.id) || 0;

    const isThereOnlyWorkspaceIcon = item.icons?.length === 1 && item.icons?.at(0)?.type === CONST.ICON_TYPE_WORKSPACE;
    const shouldUseIconPolicyID = !item.reportID && !item.accountID && !item.policyID;
    const policyID = isThereOnlyWorkspaceIcon && shouldUseIconPolicyID ? String(item.icons?.at(0)?.id) : item.policyID;

    const shouldDisableAccessibleGrouping = !!rightHandSideComponent && !canSelectMultiple;

    const contactAccessibilityLabel = item.text === item.alternateText ? (item.text ?? '') : [item.text, item.alternateText].filter(Boolean).join(', ');
    return (
        <BaseListItem
            item={item}
            wrapperStyle={[styles.flex1, styles.justifyContentBetween, styles.sidebarLinkInner, styles.userSelectNone, styles.peopleRow, wrapperStyle]}
            isFocused={isFocused}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            canSelectMultiple={canSelectMultiple}
            onSelectRow={onSelectRow}
            onDismissError={onDismissError}
            shouldPreventEnterKeySubmit={shouldPreventEnterKeySubmit}
            rightHandSideComponent={rightHandSideComponent}
            errors={item.errors}
            pendingAction={item.pendingAction}
            pressableStyle={pressableStyle}
            FooterComponent={
                item.invitedSecondaryLogin ? (
                    <Text style={[styles.ml9, styles.ph5, styles.pb3, styles.textLabelSupporting]}>{translate('workspace.people.invitedBySecondaryLogin', item.invitedSecondaryLogin)}</Text>
                ) : undefined
            }
            shouldUseDefaultRightHandSideCheckmark={false}
            keyForList={item.keyForList}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
            accessible={shouldDisableAccessibleGrouping ? false : undefined}
            shouldDisableHoverStyle={shouldDisableHoverStyle}
        >
            {(hovered?: boolean) => {
                const isHovered = !!hovered && !shouldDisableHoverStyle;

                return (
                    <View
                        accessible={shouldDisableAccessibleGrouping || undefined}
                        accessibilityLabel={shouldDisableAccessibleGrouping ? contactAccessibilityLabel : undefined}
                        role={shouldDisableAccessibleGrouping ? CONST.ROLE.BUTTON : undefined}
                        style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}
                    >
                        {!shouldUseDefaultRightHandSideCheckmark && !!canSelectMultiple && (
                            <SelectionCheckbox
                                item={item}
                                onSelectRow={onCheckboxPress ?? onSelectRow}
                                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                                disabled={isDisabled || item.isDisabledCheckbox}
                                style={styles.mr3}
                            />
                        )}
                        {(!!reportExists || !!itemAccountID || !!policyID) && (
                            <ReportActionAvatars
                                subscriptAvatarBorderColor={isHovered && !isFocused ? hoveredBackgroundColor : subscriptAvatarBorderColor}
                                shouldShowTooltip={showTooltip}
                                secondaryAvatarContainerStyle={[
                                    StyleUtils.getBackgroundAndBorderStyle(theme.sidebar),
                                    isFocused ? StyleUtils.getBackgroundAndBorderStyle(focusedBackgroundColor) : undefined,
                                    isHovered && !isFocused ? StyleUtils.getBackgroundAndBorderStyle(hoveredBackgroundColor) : undefined,
                                ]}
                                reportID={reportExists ? item.reportID : undefined}
                                /* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */
                                accountIDs={!reportExists && !!itemAccountID ? [itemAccountID] : []}
                                policyID={!reportExists && !!policyID ? policyID : undefined}
                                singleAvatarContainerStyle={[styles.actionAvatar, styles.mr3]}
                                fallbackDisplayName={item.text ?? item.alternateText ?? undefined}
                            />
                        )}
                        <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch, styles.optionRow]}>
                            <TextWithTooltip
                                shouldShowTooltip={showTooltip}
                                text={Str.removeSMSDomain(item.text ?? '')}
                                style={[
                                    styles.optionDisplayName,
                                    isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText,
                                    item.isBold !== false && styles.sidebarLinkTextBold,
                                    styles.pre,
                                    item.alternateText ? styles.mb1 : null,
                                ]}
                            />
                            {!!item.alternateText && (
                                <TextWithTooltip
                                    shouldShowTooltip={showTooltip}
                                    text={Str.removeSMSDomain(item.alternateText ?? '')}
                                    style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                                    forwardedFSClass={forwardedFSClass}
                                />
                            )}
                        </View>
                        {!!item.rightElement && <ListItemFocusContext.Provider value={{isFocused}}>{item.rightElement}</ListItemFocusContext.Provider>}
                        {!!item.shouldShowRightCaret && (
                            <View style={[styles.popoverMenuIcon, styles.pointerEventsAuto, isDisabled && styles.cursorDisabled]}>
                                <Icon
                                    src={icons.ArrowRight}
                                    fill={StyleUtils.getIconFillColor(getButtonState(isHovered, false, false, !!isDisabled, item.isInteractive !== false))}
                                />
                            </View>
                        )}
                        {!!shouldUseDefaultRightHandSideCheckmark && !!canSelectMultiple && (
                            <SelectionCheckbox
                                item={item}
                                onSelectRow={onCheckboxPress ?? onSelectRow}
                                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                                disabled={isDisabled || item.isDisabledCheckbox}
                                style={styles.ml3}
                            />
                        )}
                    </View>
                );
            }}
        </BaseListItem>
    );
}

export default UserListItem;
