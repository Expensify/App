import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import Text from '@components/Text';
import TextWithTooltip from '@components/TextWithTooltip';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import BaseListItem from './BaseListItem';
import type {ListItem, OnboardingListItemProps} from './types';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

function OnboardingListItem<TItem extends ListItem>({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    canSelectMultiple,
    onSelectRow,
    onDismissError,
    shouldPreventEnterKeySubmit,
    rightHandSideComponent,
    onFocus,
    shouldSyncFocus,
    pressableStyle,
}: OnboardingListItemProps<TItem>) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();

    return (
        <BaseListItem
            item={item}
            wrapperStyle={[
                styles.flex1,
                styles.justifyContentBetween,
                styles.onboardingItemWrapper,
                styles.userSelectNone,
                styles.peopleRow,
                isFocused && styles.sidebarLinkActive,
                onboardingIsMediumOrLargerScreenWidth ? styles.ph8 : styles.ph5,
            ]}
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
                    <Text style={[styles.ml9, styles.ph5, styles.pb3, styles.textLabelSupporting]}>
                        {translate('workspace.people.invitedBySecondaryLogin', {secondaryLogin: item.invitedSecondaryLogin})}
                    </Text>
                ) : undefined
            }
            keyForList={item.keyForList}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
        >
            <>
                {item.onboardingIcon && (
                    <View style={[styles.mr3, styles.onboardingIconWrapper]}>
                        <Icon
                            src={item.onboardingIcon.icon}
                            width={item.onboardingIcon.iconWidth}
                            height={item.onboardingIcon.iconHeight}
                            additionalStyles={item.onboardingIcon.iconStyles}
                            fill={item.onboardingIcon.iconFill}
                        />
                    </View>
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
                        />
                    )}
                </View>
                {!!item.rightElement && item.rightElement}
            </>
        </BaseListItem>
    );
}

OnboardingListItem.displayName = 'OnboardingListItem';

export default OnboardingListItem;
