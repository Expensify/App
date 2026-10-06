import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {PressableWithFeedback} from '@components/Pressable';
import type {TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import type {ListItem, ListItemProps} from '@components/SelectionList/ListItem/types';
import TransactionItemRow from '@components/TransactionItemRow';

import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useRowHighlightAnimation from '@hooks/useRowHighlightAnimation';
import useStyleUtils from '@hooks/useStyleUtils';
import useSyncFocus from '@hooks/useSyncFocus';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Transaction from '@src/types/onyx/Transaction';

import type {ComponentRef} from 'react';
import type {View} from 'react-native';

import React, {useRef} from 'react';

/** A transaction rendered as a selectable row in the merge-expenses list */
type MergeTransactionListItemType = Transaction & ListItem;

function MergeTransactionItem<TItem extends MergeTransactionListItemType>({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    onFocus,
    shouldSyncFocus,
    onSelectRow,
    isLastItem,
}: ListItemProps<TItem>) {
    const styles = useThemeStyles();
    const transactionItem = item as unknown as TransactionListItemType;
    const theme = useTheme();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionItem.reportID}`);
    const policy = usePolicy(report?.policyID);

    const animatedHighlightStyle = useRowHighlightAnimation({shouldHighlight: item?.shouldAnimateInHighlight ?? false, borderRadius: 0});
    const StyleUtils = useStyleUtils();
    const pressableRef = useRef<ComponentRef<typeof View>>(null);

    useSyncFocus(pressableRef, !!isFocused, shouldSyncFocus);

    return (
        <OfflineWithFeedback pendingAction={item.pendingAction}>
            <PressableWithFeedback
                ref={pressableRef}
                sentryLabel={CONST.SENTRY_LABEL.MERGE_EXPENSE.MERGE_TRANSACTION_ITEM}
                onPress={() => {
                    onSelectRow(item);
                }}
                disabled={isDisabled && !item.isSelected}
                accessibilityLabel={item.text ?? ''}
                role={CONST.ROLE.BUTTON}
                isNested
                onMouseDown={(e) => e.preventDefault()}
                hoverStyle={[!item.isDisabled && styles.hoveredComponentBG]}
                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true, [CONST.INNER_BOX_SHADOW_ELEMENT]: true}}
                id={item.keyForList ?? ''}
                style={[
                    styles.transactionListItemStyle,
                    styles.noBorderRadius,
                    isFocused && StyleUtils.getItemBackgroundColorStyle(false, !!isFocused, !!item.isDisabled, theme.activeComponentBG, theme.hoverComponentBG),
                ]}
                onFocus={onFocus}
                wrapperStyle={[styles.flex1, animatedHighlightStyle, styles.userSelectNone, !isLastItem && styles.borderBottom]}
            >
                <TransactionItemRow
                    transactionItem={transactionItem}
                    report={report}
                    policy={policy}
                    shouldUseNarrowLayout
                    isSelected={!!item.isSelected}
                    shouldShowTooltip={showTooltip}
                    dateColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                    amountColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                    taxAmountColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                    shouldHighlightItemWhenSelected={false}
                    shouldShowErrors={false}
                    style={[styles.p4, styles.noBorderRadius]}
                    shouldShowRadioButton
                    onRadioButtonPress={() => {
                        onSelectRow(item);
                    }}
                />
            </PressableWithFeedback>
        </OfflineWithFeedback>
    );
}

export default MergeTransactionItem;
export type {MergeTransactionListItemType};
