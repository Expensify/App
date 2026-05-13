import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';
import ReportActionAvatars from '@components/ReportActionAvatars';
import {ListItemFocusContext} from '@components/SelectionList/ListItemFocusContext';
import Text from '@components/Text';
import TextWithTooltip from '@components/TextWithTooltip';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import BaseListItem from './BaseListItem';
import SelectableListItem from './SelectableListItem';
import type {InviteMemberListItemProps, ListItem} from './types';

/**
 * A user row with avatar, name, and subtitle used for person selection and invitation. Adds
 * secondary-login footers and product training tooltips on top of the standard user row layout.
 */
function InviteMemberListItem<TItem extends ListItem>({
    item,
    isFocused,
    isFocusVisible,
    showTooltip,
    isDisabled,
    canSelectMultiple,
    onSelectRow,
    onSelectionButtonPress,
    onDismissError,
    rightHandSideComponent,
    onFocus,
    shouldSyncFocus,
    wrapperStyle,
    isMultilineSupported,
}: InviteMemberListItemProps<TItem>) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();

    const focusedBackgroundColor = styles.sidebarLinkActive.backgroundColor;
    const subscriptAvatarBorderColor = isFocusVisible ? focusedBackgroundColor : theme.sidebar;
    const hoveredBackgroundColor = !!styles.sidebarLinkHover && 'backgroundColor' in styles.sidebarLinkHover ? styles.sidebarLinkHover.backgroundColor : theme.sidebar;

    const firstItemIconID = Number(item?.icons?.at(0)?.id);

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const accountID = !item.reportID ? item.accountID || firstItemIconID : undefined;

    const ListItemWrapper = item.isDisabled && !item.isSelected ? BaseListItem : SelectableListItem;

    return (
        <ListItemWrapper
            item={item}
            wrapperStyle={[styles.flex1, styles.justifyContentBetween, styles.sidebarLinkInner, styles.userSelectNone, styles.peopleRow, wrapperStyle]}
            isFocused={isFocused}
            isFocusVisible={isFocusVisible}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            canSelectMultiple={canSelectMultiple}
            onSelectRow={onSelectRow}
            onDismissError={onDismissError}
            rightHandSideComponent={rightHandSideComponent}
            errors={item.errors}
            pendingAction={item.pendingAction}
            FooterComponent={
                item.invitedSecondaryLogin ? (
                    <Text style={[styles.ml9, styles.ph5, styles.pb3, styles.textLabelSupporting]}>{translate('workspace.people.invitedBySecondaryLogin', item.invitedSecondaryLogin)}</Text>
                ) : undefined
            }
            keyForList={item.keyForList}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
            shouldDisplayRBR={!(canSelectMultiple && !item.isDisabled)}
            onSelectionButtonPress={onSelectionButtonPress}
            testID={item.text}
        >
            {(hovered?: boolean) => (
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.flex1]}>
                    {(!!item.reportID || !!accountID || !!item.text || !!item.alternateText) && (
                        <ReportActionAvatars
                            subscriptAvatarBorderColor={hovered && !isFocusVisible ? hoveredBackgroundColor : subscriptAvatarBorderColor}
                            shouldShowTooltip={showTooltip}
                            secondaryAvatarContainerStyle={[
                                StyleUtils.getBackgroundAndBorderStyle(theme.sidebar),
                                isFocusVisible ? StyleUtils.getBackgroundAndBorderStyle(focusedBackgroundColor) : undefined,
                                hovered && !isFocusVisible ? StyleUtils.getBackgroundAndBorderStyle(hoveredBackgroundColor) : undefined,
                            ]}
                            fallbackDisplayName={item.text ?? item.alternateText ?? undefined}
                            singleAvatarContainerStyle={[styles.actionAvatar, styles.mr3]}
                            reportID={item.reportID}
                            accountIDs={accountID ? [accountID] : undefined}
                        />
                    )}
                    <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch, styles.optionRow]}>
                        <View style={[styles.flexRow, styles.alignItemsCenter]}>
                            <TextWithTooltip
                                shouldShowTooltip={showTooltip}
                                text={Str.removeSMSDomain(item.text ?? '')}
                                numberOfLines={isMultilineSupported ? 2 : 1}
                                style={[
                                    styles.optionDisplayName,
                                    isFocusVisible ? styles.sidebarLinkActiveText : styles.sidebarLinkText,
                                    item.isBold !== false && styles.sidebarLinkTextBold,
                                    isMultilineSupported ? styles.preWrap : styles.pre,
                                    item.alternateText ? styles.mb1 : null,
                                ]}
                            />
                        </View>
                        {!!item.alternateText && (
                            <TextWithTooltip
                                shouldShowTooltip={showTooltip}
                                text={Str.removeSMSDomain(item.alternateText ?? '')}
                                style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                            />
                        )}
                    </View>
                    {!!item.rightElement && <ListItemFocusContext.Provider value={{isFocused}}>{item.rightElement}</ListItemFocusContext.Provider>}
                </View>
            )}
        </ListItemWrapper>
    );
}

export default InviteMemberListItem;
