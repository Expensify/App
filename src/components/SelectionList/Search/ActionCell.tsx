import React, {useCallback} from 'react';
import {View} from 'react-native';
import Badge from '@components/Badge';
import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import {useSearchContext} from '@components/Search/SearchContext';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import variables from '@styles/variables';
import * as SearchActions from '@userActions/Search';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type {SearchTransactionAction} from '@src/types/onyx/SearchResults';

const actionTranslationsMap: Record<SearchTransactionAction, TranslationPaths> = {
    view: 'common.view',
    review: 'common.review',
    done: 'common.done',
    paid: 'iou.settledExpensify',
    hold: 'iou.hold',
    unhold: 'iou.unhold',
};

type ActionCellProps = {
    action?: SearchTransactionAction;
    transactionID?: string;
    isLargeScreenWidth?: boolean;
    isSelected?: boolean;
    goToItem: () => void;
};

function ActionCell({action = CONST.SEARCH.ACTION_TYPES.VIEW, transactionID, isLargeScreenWidth = true, isSelected = false, goToItem}: ActionCellProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const {currentSearchHash} = useSearchContext();

    const onButtonPress = useCallback(() => {
        if (!transactionID) {
            return;
        }

        if (action === CONST.SEARCH.ACTION_TYPES.HOLD) {
            Navigation.navigate(ROUTES.TRANSACTION_HOLD_REASON_RHP.getRoute(CONST.SEARCH.TAB.ALL, transactionID));
        } else if (action === CONST.SEARCH.ACTION_TYPES.UNHOLD) {
            SearchActions.unholdMoneyRequestOnSearch(currentSearchHash, [transactionID]);
        }
    }, [action, currentSearchHash, transactionID]);

    const text = translate(actionTranslationsMap[action]);

    if (action === CONST.SEARCH.ACTION_TYPES.PAID || action === CONST.SEARCH.ACTION_TYPES.DONE) {
        return (
            <View style={[StyleUtils.getHeight(variables.h28), styles.justifyContentCenter]}>
                <Badge
                    text={text}
                    icon={Expensicons.Checkmark}
                    badgeStyles={[
                        styles.ml0,
                        styles.ph2,
                        styles.gap1,
                        isLargeScreenWidth ? styles.alignSelfCenter : styles.alignSelfEnd,
                        StyleUtils.getHeight(variables.h20),
                        StyleUtils.getMinimumHeight(variables.h20),
                        isSelected ? StyleUtils.getBorderColorStyle(theme.buttonHoveredBG) : StyleUtils.getBorderColorStyle(theme.border),
                    ]}
                    textStyles={StyleUtils.getFontSizeStyle(variables.fontSizeExtraSmall)}
                    iconStyles={styles.mr0}
                    success
                />
            </View>
        );
    }

    if (action === CONST.SEARCH.ACTION_TYPES.VIEW || action === CONST.SEARCH.ACTION_TYPES.REVIEW) {
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

    return (
        <Button
            text={text}
            onPress={onButtonPress}
            small
            pressOnEnter
            style={[styles.w100]}
            innerStyles={isSelected ? styles.buttonDefaultHovered : {}}
        />
    );
}

ActionCell.displayName = 'ActionCell';

export default ActionCell;
