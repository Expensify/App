import Icon from '@components/Icon';
import type {NumericSymbolProps} from '@components/NumericInput/types';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import {View} from 'react-native';

/**
 * Renders the symbol (currency or unit) displayed beside the number. The composition decides what the symbol is, where
 * it sits, and whether it renders at all, so the primitive renders its children alone and leaves prefix/suffix
 * placement to its parent.
 */
function NumericSymbol({children, isSymbolPressable = false, onSymbolButtonPress, textStyle}: NumericSymbolProps) {
    const icons = useMemoizedLazyExpensifyIcons(['DownArrow']);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();

    const symbolText = <Text style={[styles.iouAmountText, styles.lineHeightUndefined, textStyle]}>{children}</Text>;

    if (!isSymbolPressable) {
        return <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}>{symbolText}</View>;
    }

    return (
        <Tooltip text={translate('common.selectSymbolOrCurrency')}>
            <PressableWithoutFeedback
                onPress={onSymbolButtonPress}
                accessibilityLabel={translate('common.selectSymbolOrCurrency')}
                role={CONST.ROLE.BUTTON}
                sentryLabel="NumericInput-Symbol"
                style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}
            >
                <Icon
                    size={CONST.ICON_SIZE.SMALL}
                    src={icons.DownArrow}
                    fill={theme.icon}
                />
                {symbolText}
            </PressableWithoutFeedback>
        </Tooltip>
    );
}

export default NumericSymbol;
