import React from 'react';
import Badge from '@components/Badge';
import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import type {TransactionListItemType} from '@components/SelectionList/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as SearchUtils from '@libs/SearchUtils';
import type {TranslationPaths} from '@src/languages/types';
import type {SearchTransactionAction} from '@src/types/onyx/SearchResults';

const actionTranslationsMap: Record<SearchTransactionAction, TranslationPaths> = {
    view: 'common.view',
    // Todo add translation for Review
    review: 'common.view',
    done: 'common.done',
    paid: 'iou.settledExpensify',
    approve: 'iou.approve',
    pay: 'iou.pay',
    submit: 'common.submit',
    hold: 'iou.hold',
};

type ActionCellProps = {
    transactionItem: TransactionListItemType;
    goToItem: () => void;
};

function ActionCell({transactionItem, goToItem}: ActionCellProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const {action, amount} = transactionItem;

    const text = translate(actionTranslationsMap[action]);

    if (['done', 'paid'].includes(action)) {
        return (
            <Badge
                success
                text={text}
                icon={Expensicons.Checkmark}
                badgeStyles={[styles.badgeBordered]}
                textStyles={[{fontWeight: '700'}]}
            />
        );
    }

    if (['view', 'review'].includes(action)) {
        return (
            <Button
                text={text}
                onPress={goToItem}
                small
                pressOnEnter
                style={[styles.w100]}
            />
        );
    }

    const command = SearchUtils.getTransactionActionCommand(action);
    const reportsAndAmounts = {[transactionItem.reportID ?? -1]: amount};

    return (
        <Button
            text={text}
            onPress={() => {
                command('', reportsAndAmounts);
            }}
            small
            pressOnEnter
            style={[styles.w100]}
        />
    );
}

export default ActionCell;
