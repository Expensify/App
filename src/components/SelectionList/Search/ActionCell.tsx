import React, {useCallback} from 'react';
import {View} from 'react-native';
import Badge from '@components/Badge';
import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {SearchTransactionAction} from '@src/types/onyx/SearchResults';

const actionTranslationsMap: Record<SearchTransactionAction, TranslationPaths> = {
    view: 'common.view',
    review: 'common.review',
    submit: 'common.submit',
    approve: 'iou.approve',
    pay: 'iou.pay',
    done: 'common.done',
    paid: 'iou.settledExpensify',
};

type ActionCellProps = {
    action?: SearchTransactionAction;
    shouldUseSuccessStyle?: boolean;
    isLargeScreenWidth?: boolean;
    isSelected?: boolean;
    goToItem: () => void;
    isChildListItem?: boolean;
    parentAction?: string;
    isLoading?: boolean;
};

function ActionCell({
    action = CONST.SEARCH.ACTION_TYPES.VIEW,
    shouldUseSuccessStyle: shouldUseSuccessStyleProp = true,
    isLargeScreenWidth = true,
    isSelected = false,
    goToItem,
    isChildListItem = false,
    parentAction = '',
    isLoading = false,
}: ActionCellProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isOffline} = useNetwork();

    const text = isChildListItem ? translate(actionTranslationsMap[CONST.SEARCH.ACTION_TYPES.VIEW]) : translate(actionTranslationsMap[action]);

    const getButtonInnerStyles = useCallback(
        (shouldUseSuccessStyle: boolean) => {
            if (!isSelected) {
                return {};
            }
            return shouldUseSuccessStyle ? styles.buttonSuccessHovered : styles.buttonDefaultHovered;
        },
        [isSelected, styles],
    );

    const shouldUseViewAction = action === CONST.SEARCH.ACTION_TYPES.VIEW || (parentAction === CONST.SEARCH.ACTION_TYPES.PAID && action === CONST.SEARCH.ACTION_TYPES.PAID);

    if ((parentAction !== CONST.SEARCH.ACTION_TYPES.PAID && action === CONST.SEARCH.ACTION_TYPES.PAID) || action === CONST.SEARCH.ACTION_TYPES.DONE) {
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

    if (action === CONST.SEARCH.ACTION_TYPES.VIEW || action === CONST.SEARCH.ACTION_TYPES.REVIEW || shouldUseViewAction) {
        return isLargeScreenWidth ? (
            <Button
                text={text}
                onPress={goToItem}
                small
                style={[styles.w100]}
                innerStyles={getButtonInnerStyles(false)}
                link={isChildListItem}
                shouldUseDefaultHover={!isChildListItem}
                icon={!isChildListItem && action === CONST.SEARCH.ACTION_TYPES.REVIEW ? Expensicons.DotIndicator : undefined}
                iconFill={theme.danger}
                iconHoverFill={theme.dangerHover}
            />
        ) : null;
    }

    return (
        <Button
            text={text}
            onPress={goToItem}
            small
            style={[styles.w100]}
            innerStyles={getButtonInnerStyles(shouldUseSuccessStyleProp)}
            isLoading={isLoading}
            success={shouldUseSuccessStyleProp}
            isDisabled={isOffline}
        />
    );
}

ActionCell.displayName = 'ActionCell';

export default ActionCell;
