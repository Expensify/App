import React, {useCallback} from 'react';
import {View} from 'react-native';
import Badge from '@components/Badge';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import SelectCircle from '@components/SelectCircle';
import TextWithTooltip from '@components/TextWithTooltip';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import BaseListItem from './BaseListItem';
import type {ListItem, TravelDomainListItemProps} from './types';

function TravelDomainListItem<TItem extends ListItem>({item, isFocused, showTooltip, isDisabled, onSelectRow, onCheckboxPress, onFocus, shouldSyncFocus}: TravelDomainListItemProps<TItem>) {
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
        >
            <>
                <View style={[styles.flexRow, styles.alignItemsCenter]}>
                    <PressableWithFeedback
                        onPress={handleCheckboxPress}
                        disabled={isDisabled}
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={item.text ?? ''}
                        style={[styles.mr2, styles.optionSelectCircle]}
                    >
                        <SelectCircle
                            isChecked={item.isSelected ?? false}
                            selectCircleStyles={styles.ml0}
                        />
                    </PressableWithFeedback>
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
