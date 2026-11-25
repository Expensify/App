import Button from '@components/Button';
import type {ButtonProps} from '@components/Button';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

type AmountCurrencyPickerButtonProps = Pick<ButtonProps, 'accessibilityLabel' | 'isDisabled' | 'onPress' | 'style' | 'testID' | 'ref'> & {
    /** Currency code displayed by the button. */
    currency: string;

    /** Whether the button drops its fill, so it reads as part of the field it sits in rather than as a control on top of it. */
    shouldUseBorderlessStyle?: boolean;
};

/** Presentational currency selector button shared by KeypadAmountEditor and AmountFormField. */
function AmountCurrencyPickerButton({currency, accessibilityLabel, isDisabled = false, onPress, style, testID, ref, shouldUseBorderlessStyle = false}: AmountCurrencyPickerButtonProps) {
    const icons = useMemoizedLazyExpensifyIcons(['CoinsButton']);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const buttonAccessibilityLabel = accessibilityLabel ?? `${translate('common.selectCurrency')}, ${currency}`;

    return (
        <Button
            ref={ref}
            sentryLabel={CONST.SENTRY_LABEL.AMOUNT_ACTION_BUTTONS.CURRENCY_PICKER_BUTTON}
            accessibilityLabel={buttonAccessibilityLabel}
            contentContainerStyle={styles.justifyContentCenter}
            isDisabled={isDisabled}
            onPress={onPress}
            // Keeps the input focused and its caret in place when the button is pressed on web.
            onMouseDown={(event) => event.preventDefault()}
            size={CONST.BUTTON_SIZE.SMALL}
            style={style}
            innerStyles={shouldUseBorderlessStyle ? styles.bgTransparent : undefined}
            // `innerStyles` never reaches the hover style `Button` layers on top, so the fill would come back under the cursor without this.
            hoverStyles={shouldUseBorderlessStyle ? styles.bgTransparent : undefined}
            testID={testID}
        >
            <Button.Icon src={icons.CoinsButton} />
            {/* Without its fill the label takes the supporting text color, matching the icon beside it. */}
            <Button.Text style={shouldUseBorderlessStyle ? styles.textSupporting : undefined}>{currency}</Button.Text>
        </Button>
    );
}

export default AmountCurrencyPickerButton;
