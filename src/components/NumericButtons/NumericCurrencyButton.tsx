import Button from '@components/Button';
import type {ButtonProps} from '@components/Button';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

type NumericCurrencyButtonProps = Pick<ButtonProps, 'isDisabled' | 'onPress' | 'style' | 'testID'> & {
    /** Currency code displayed by the button. */
    currency: string;
};

/** Presentational currency selector button shared by NumericInput and NumericField. */
function NumericCurrencyButton({currency, isDisabled = false, onPress, style, testID}: NumericCurrencyButtonProps) {
    const icons = useMemoizedLazyExpensifyIcons(['CoinsButton']);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const accessibilityLabel = `${translate('common.selectCurrency')}, ${currency}`;

    return (
        <Button
            accessibilityLabel={accessibilityLabel}
            contentContainerStyle={styles.justifyContentCenter}
            isDisabled={isDisabled}
            onPress={onPress}
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
