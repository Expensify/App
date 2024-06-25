import React from 'react';
import {View} from 'react-native';
import Badge from '@components/Badge';
import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as SearchUtils from '@libs/SearchUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
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
    transactionIDs?: string[];
    searchHash: number;
    isLargeScreenWidth?: boolean;
    goToItem: () => void;
};

function ActionCell({action, transactionIDs = [], searchHash, isLargeScreenWidth = true, goToItem}: ActionCellProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const text = translate(actionTranslationsMap[action]);

    if (['done', 'paid'].includes(action)) {
        if (action === CONST.SEARCH.ACTION_TYPES.PAID || action === CONST.SEARCH.ACTION_TYPES.DONE) {
            const buttonTextKey = action === CONST.SEARCH.ACTION_TYPES.PAID ? 'iou.settledExpensify' : 'common.done';
            return (
                <View style={[StyleUtils.getHeight(variables.h28), styles.justifyContentCenter]}>
                    <Badge
                        text={translate(buttonTextKey)}
                        icon={Expensicons.Checkmark}
                        badgeStyles={[
                            styles.ml0,
                            styles.ph2,
                            styles.gap1,
                            isLargeScreenWidth ? styles.alignSelfCenter : styles.alignSelfEnd,
                            StyleUtils.getBorderColorStyle(theme.border),
                            StyleUtils.getHeight(variables.h20),
                            StyleUtils.getMinimumHeight(variables.h20),
                        ]}
                        textStyles={StyleUtils.getFontSizeStyle(variables.fontSizeExtraSmall)}
                        iconStyles={styles.mr0}
                        success
                    />
                </View>
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

                    command(searchHash, transactionIDs);
                }}
                small
                pressOnEnter
                style={[styles.w100]}
            />
        );
    }
}

ActionCell.displayName = 'ActionCell';

export default ActionCell;
