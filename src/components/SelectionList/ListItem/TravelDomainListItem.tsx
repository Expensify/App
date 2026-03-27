import React from 'react';
import {View} from 'react-native';
import Badge from '@components/Badge';
import SelectionCheckbox from '@components/SelectionList/components/SelectionCheckbox';
import TextWithTooltip from '@components/TextWithTooltip';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import BaseListItem from './BaseListItem';
import type {ListItem, TravelDomainListItemProps} from './types';

function TravelDomainListItem<TItem extends ListItem>({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    onSelectRow,
    onCheckboxPress,
    onFocus,
    shouldSyncFocus,
    accessibilityState,
}: TravelDomainListItemProps<TItem>) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const showRecommendedTag = item.isRecommended ?? false;

    return (
        <BaseListItem
            item={item}
            wrapperStyle={[styles.flex1, styles.sidebarLinkInner, styles.userSelectNone, styles.optionRow, styles.justifyContentBetween]}
            isFocused={isFocused}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            canSelectMultiple
            onSelectRow={onSelectRow}
            keyForList={item.keyForList}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
            accessibilityState={accessibilityState}
        >
            <>
                <View style={[styles.flexRow, styles.alignItemsCenter]}>
                    <SelectionCheckbox
                        item={item}
                        onSelectRow={onCheckboxPress ?? onSelectRow}
                        disabled={isDisabled ?? undefined}
                        isCircular
                        style={styles.mr2}
                    />
                    <View style={[styles.flexRow, styles.alignItemsCenter]}>
                        <TextWithTooltip
                            shouldShowTooltip={showTooltip}
                            text={item.text ?? ''}
                            style={[
                                styles.optionDisplayName,
                                isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText,
                                item.isBold !== false && styles.sidebarLinkTextBold,
                                styles.pre,
                            ]}
                        />
                    </View>
                </View>
                {showRecommendedTag && <Badge text={translate('travel.domainSelector.recommended')} />}
            </>
        </BaseListItem>
    );
}

export default TravelDomainListItem;
