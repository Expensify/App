import React, {useCallback} from 'react';
import {View} from 'react-native';
import Badge from '@components/Badge';
import Checkbox from '@components/Checkbox';
import TextWithTooltip from '@components/TextWithTooltip';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import BaseListItem from './BaseListItem';
import type {BaseListItemProps, ListItem} from './types';

type AdditionalDomainItemProps = {
    value?: string;
    isRecommended?: boolean;
};

type DomainItemProps<TItem extends ListItem> = BaseListItemProps<TItem & AdditionalDomainItemProps>;

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
}: DomainItemProps<TItem>) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const handleCheckboxPress = useCallback(() => {
        if (onCheckboxPress) {
            onCheckboxPress(item);
        } else {
            onSelectRow(item);
        }
    }, [item, onCheckboxPress, onSelectRow]);
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
                    <Checkbox
                        style={[styles.mr2]}
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        disabled={isDisabled || item.isDisabledCheckbox}
                        isChecked={item.isSelected ?? false}
                        accessibilityLabel={item.text ?? ''}
                        onPress={handleCheckboxPress}
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

TravelDomainListItem.displayName = 'TravelDomainListItem';

export default TravelDomainListItem;
