import {Str} from 'expensify-common';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import SelectCircle from '@components/SelectCircle';
import Text from '@components/Text';
import TextWithTooltip from '@components/TextWithTooltip';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import BaseListItem from './BaseListItem';
import type {ListItem, ListItemProps} from './types';

function TravelDomainListItem<TItem extends ListItem>({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    canSelectMultiple,
    onSelectRow,
    onCheckboxPress,
    onDismissError,
    rightHandSideComponent,
    onFocus,
    shouldSyncFocus,
    shouldHighlightSelectedItem,
}: ListItemProps<TItem>) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const shouldShowCheckBox = canSelectMultiple && !item.isDisabled;

    const handleCheckboxPress = useCallback(() => {
        if (onCheckboxPress) {
            onCheckboxPress(item);
        } else {
            onSelectRow(item);
        }
    }, [item, onCheckboxPress, onSelectRow]);

    return (
        <BaseListItem
            pressableStyle={[[shouldHighlightSelectedItem && item.isSelected && styles.activeComponentBG]]}
            item={item}
            wrapperStyle={[styles.flex1, styles.sidebarLinkInner, styles.userSelectNone, styles.optionRow]}
            isFocused={isFocused}
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
                    <Text style={[styles.ml9, styles.ph5, styles.pb3, styles.textLabelSupporting]}>
                        {translate('workspace.people.invitedBySecondaryLogin', {secondaryLogin: item.invitedSecondaryLogin})}
                    </Text>
                ) : undefined
            }
            keyForList={item.keyForList}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
            shouldDisplayRBR={!shouldShowCheckBox}
        >
            {(hovered?: boolean) => (
                <>
                    {!!shouldShowCheckBox && (
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
                    )}
                        <View style={[styles.flexRow, styles.alignItemsCenter]}>
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
                        </View>
                    {!!item.rightElement && item.rightElement}
                </>
            )}
        </BaseListItem>
    );
}

TravelDomainListItem.displayName = 'TravelDomainListItem';

export default TravelDomainListItem;
