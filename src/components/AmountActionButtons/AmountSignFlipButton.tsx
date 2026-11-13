import Button from '@components/Button';
import type {ButtonProps} from '@components/Button';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

type AmountSignFlipButtonProps = Pick<ButtonProps, 'isDisabled' | 'onPress' | 'style' | 'testID'> & {
    /** Whether to display the text label alongside the icon. Defaults to true. */
    shouldShowLabel?: boolean;

    /** Whether the button drops its fill, so it reads as part of the field it sits in rather than as a control on top of it. */
    shouldUseBorderlessStyle?: boolean;
};

/** Presentational sign toggle button shared by KeypadAmountEditor and AmountFormField. */
function AmountSignFlipButton({isDisabled = false, onPress, style, testID, shouldShowLabel = true, shouldUseBorderlessStyle = false}: AmountSignFlipButtonProps) {
    const icons = useMemoizedLazyExpensifyIcons(['PlusMinus']);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const label = translate('iou.flip');

    return (
        <Button
            sentryLabel={CONST.SENTRY_LABEL.AMOUNT_ACTION_BUTTONS.SIGN_FLIP_BUTTON}
            accessibilityLabel={label}
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
            <Button.Icon src={icons.PlusMinus} />
            {/* Without its fill the label takes the supporting text color, matching the icon beside it. */}
            {shouldShowLabel && <Button.Text style={shouldUseBorderlessStyle ? styles.textSupporting : undefined}>{label}</Button.Text>}
        </Button>
    );
}

export default AmountSignFlipButton;
export type {AmountSignFlipButtonProps};
