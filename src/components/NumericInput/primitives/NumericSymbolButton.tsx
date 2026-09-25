import Icon from '@components/Icon';
import type {NumericSymbolButtonProps} from '@components/NumericInput/types';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Tooltip from '@components/Tooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import NumericSymbol from './NumericSymbol';

/** Renders a pressable symbol control with the shared NumericInput symbol styling. */
function NumericSymbolButton({children, onPress, textStyle}: NumericSymbolButtonProps) {
    const icons = useMemoizedLazyExpensifyIcons(['DownArrow']);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();

    return (
        <Tooltip text={translate('common.selectSymbolOrCurrency')}>
            <PressableWithoutFeedback
                onPress={onPress}
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
                <NumericSymbol textStyle={textStyle}>{children}</NumericSymbol>
            </PressableWithoutFeedback>
        </Tooltip>
    );
}

export default NumericSymbolButton;
