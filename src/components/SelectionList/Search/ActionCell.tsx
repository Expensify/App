import React from 'react';
import {View} from 'react-native';
import Badge from '@components/Badge';
import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';

type ActionCellProps = {
    onButtonPress: () => void;
    action?: string;
    isLargeScreenWidth?: boolean;
    isSelected?: boolean;
};

function ActionCell({onButtonPress, action = CONST.SEARCH.ACTION_TYPES.VIEW, isLargeScreenWidth = true, isSelected = false}: ActionCellProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();

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

    return (
        <Button
            text={translate('common.view')}
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
