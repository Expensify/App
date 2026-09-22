import Button from '@components/Button';
import type {ButtonProps} from '@components/Button';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

type NumericCurrencyButtonProps = Pick<ButtonProps, 'accessibilityLabel' | 'isDisabled' | 'onPress' | 'style' | 'testID'> & {
    /** Currency code displayed by the button. */
    currency: string;
};

/** Presentational currency selector button shared by NumericInput and NumericField. */
function NumericCurrencyButton({currency, accessibilityLabel, isDisabled = false, onPress, style, testID}: NumericCurrencyButtonProps) {
    const icons = useMemoizedLazyExpensifyIcons(['CoinsButton']);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const buttonAccessibilityLabel = accessibilityLabel ?? `${translate('common.selectCurrency')}, ${currency}`;

    return (
        <Button
            accessibilityLabel={buttonAccessibilityLabel}
            contentContainerStyle={styles.justifyContentCenter}
            isDisabled={isDisabled}
            onPress={onPress}
            // Keeps the input focused and its caret in place when the button is pressed on web.
            onMouseDown={(event) => event.preventDefault()}
            size={CONST.BUTTON_SIZE.SMALL}
            style={style}
            testID={testID}
        >
            <Button.Icon src={icons.CoinsButton} />
            <Button.Text>{currency}</Button.Text>
        </Button>
    );
}

export default NumericCurrencyButton;
