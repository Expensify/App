import React from 'react';
import Badge from '@components/Badge';
import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as SearchUtils from '@libs/SearchUtils';
import type {TranslationPaths} from '@src/languages/types';
import type {SearchTransactionAction} from '@src/types/onyx/SearchResults';

const actionTranslationsMap: Record<SearchTransactionAction, TranslationPaths> = {
    view: 'common.view',
    review: 'common.view', // Todo fix translation
    done: 'common.done',
    paid: 'iou.settledExpensify',
    hold: 'iou.hold',
    unhold: 'iou.unholdExpense',
};

type ActionCellProps = {
    action: SearchTransactionAction;
    transactionIDs: string[];
    searchHash: number;
    goToItem: () => void;
};

function ActionCell({action, transactionIDs, searchHash, goToItem}: ActionCellProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

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

    return (
        <Button
            text={text}
            onPress={() => {
                if (!command) {
                    return;
                }

                command(searchHash, transactionIDs, '');
            }}
            small
            pressOnEnter
            style={[styles.w100]}
        />
    );
}

export default ActionCell;
