import Button from '@components/Button';
import type {ButtonProps} from '@components/Button';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

type AmountSignFlipButtonProps = Pick<ButtonProps, 'isDisabled' | 'onPress' | 'style' | 'testID'> & {
    /** Whether to display the text label alongside the icon. Defaults to true. */
    shouldShowLabel?: boolean;
    /**
     * Renders the button as its icon plus label, without the pill background, so it reads as part of the field rather
     * than as a control stacked on top of it. The tap target is unchanged.
     */
    isBorderless?: boolean;
};

/** Presentational sign toggle button shared by KeypadAmountEditor and AmountFormField. */
function AmountSignFlipButton({isDisabled = false, isBorderless = false, onPress, style, testID, shouldShowLabel = true}: AmountSignFlipButtonProps) {
    const icons = useMemoizedLazyExpensifyIcons(['PlusMinus']);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const label = translate('iou.flip');

    return (
        <Button
            accessibilityLabel={label}
            contentContainerStyle={styles.justifyContentCenter}
            innerStyles={isBorderless ? styles.bgTransparent : undefined}
            // `innerStyles` never reaches the hover style `Button` layers on top, so the pill the borderless treatment
            // removes would come back under the cursor without this
            hoverStyles={isBorderless ? styles.bgTransparent : undefined}
            isDisabled={isDisabled}
            onPress={onPress}
            // Keeps the input focused and its caret in place when the button is pressed on web.
            onMouseDown={(event) => event.preventDefault()}
            size={CONST.BUTTON_SIZE.SMALL}
            style={style}
            testID={testID}
        >
            <Button.Icon src={icons.PlusMinus} />
            {/* A borderless label takes the supporting text color, matching the icon beside it */}
            {shouldShowLabel && <Button.Text style={isBorderless ? styles.textSupporting : undefined}>{label}</Button.Text>}
        </Button>
    );
}

export default AmountSignFlipButton;
export type {AmountSignFlipButtonProps};
