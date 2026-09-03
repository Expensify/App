import ListItemComposed from '@components/SelectionList/ListItemComposed';
import TextWithTooltip from '@components/TextWithTooltip';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';

import type {InviteMemberListItemProps, ListItem} from './types';

/**
 * A user row with avatar, name, and subtitle used for person selection and invitation. Adds
 * secondary-login footers and product training tooltips on top of the standard user row layout.
 * Composes ListItem directly because the selection button presence is state-dependent:
 * disabled, unselected rows render without one.
 */
function InviteMemberListItem<TItem extends ListItem>({
    item,
    isFocused,
    isFocusVisible,
    showTooltip: shouldShowTooltip,
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
    const {formatPhoneNumber} = useLocalize();

    const firstItemIconID = Number(item?.icons?.at(0)?.id);

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const accountID = !item.reportID ? item.accountID || firstItemIconID : undefined;

    const shouldShowSelectionButton = !item.shouldHideSelectionButton && !(item.isDisabled && !item.isSelected);

    return (
        <ListItemComposed
            item={item}
            shouldShowTooltip={shouldShowTooltip}
            isFocused={isFocused}
            isFocusVisible={isFocusVisible}
            isDisabled={isDisabled}
            canSelectMultiple={canSelectMultiple}
            onSelectRow={onSelectRow}
            onDismissError={onDismissError}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
        >
            <View
                testID={item.text}
                style={[styles.flex1, styles.justifyContentBetween, styles.sidebarLinkInner, styles.userSelectNone, styles.peopleRow, wrapperStyle]}
            >
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.flex1]}>
                    {(!!item.reportID || !!accountID || !!item.text || !!item.alternateText) &&
                        (accountID ? (
                            <ListItemComposed.UserAvatar
                                accountID={accountID}
                                fallbackDisplayName={item.text ?? item.alternateText ?? undefined}
                            />
                        ) : (
                            <ListItemComposed.ReportAvatar
                                reportID={item.reportID}
                                fallbackDisplayName={item.text ?? item.alternateText ?? undefined}
                            />
                        ))}
                    <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch, styles.optionRow]}>
                        <View style={[styles.flexRow, styles.alignItemsCenter]}>
                            <TextWithTooltip
                                shouldShowTooltip={shouldShowTooltip}
                                text={Str.isSMSLogin(item.text ?? '') ? formatPhoneNumber(item.text ?? '') : (item.text ?? '')}
                                numberOfLines={isMultilineSupported ? 2 : 1}
                                style={[
                                    styles.optionDisplayName,
                                    styles.sidebarLinkText,
                                    item.isBold !== false && styles.sidebarLinkTextBold,
                                    isMultilineSupported ? styles.preWrap : styles.pre,
                                    item.alternateText ? styles.mb1 : null,
                                ]}
                            />
                        </View>
                        {!!item.alternateText && (
                            <ListItemComposed.Subtitle text={Str.isSMSLogin(item.alternateText ?? '') ? formatPhoneNumber(item.alternateText ?? '') : (item.alternateText ?? '')} />
                        )}
                    </View>
                    {item.rightElement}
                </View>
                {!(canSelectMultiple && !item.isDisabled) && <ListItemComposed.RBRIndicator item={item} />}
                {shouldShowSelectionButton && (
                    <ListItemComposed.SelectionButton
                        item={item}
                        onPress={onSelectionButtonPress ?? onSelectRow}
                        canSelectMultiple={canSelectMultiple}
                        style={styles.ml3}
                    />
                )}
                {typeof rightHandSideComponent === 'function' ? rightHandSideComponent(item, isFocused) : rightHandSideComponent}
            </View>
            {!!item.invitedSecondaryLogin && <ListItemComposed.InvitedSecondaryLoginFooter invitedSecondaryLogin={item.invitedSecondaryLogin} />}
        </ListItemComposed>
    );
}

export default InviteMemberListItem;
