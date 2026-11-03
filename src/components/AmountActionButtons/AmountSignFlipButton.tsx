import Button from '@components/Button';
import type {ButtonProps} from '@components/Button';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

type AmountSignFlipButtonProps = Pick<ButtonProps, 'isDisabled' | 'onPress' | 'style' | 'testID'> & {
    /** Whether to display the text label alongside the icon. Defaults to true. */
    shouldShowLabel?: boolean;
};

/** Presentational sign toggle button shared by KeypadAmountEditor and AmountFormField. */
function AmountSignFlipButton({isDisabled = false, onPress, style, testID, shouldShowLabel = true}: AmountSignFlipButtonProps) {
    const icons = useMemoizedLazyExpensifyIcons(['PlusMinus']);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const label = translate('iou.flip');

    return (
        <Button
            accessibilityLabel={label}
            contentContainerStyle={styles.justifyContentCenter}
            isDisabled={isDisabled}
            onPress={onPress}
            // Keeps the input focused and its caret in place when the button is pressed on web.
            onMouseDown={(event) => event.preventDefault()}
            size={CONST.BUTTON_SIZE.SMALL}
            style={style}
            testID={testID}
        >
            <Button.Icon src={icons.PlusMinus} />
            {shouldShowLabel && <Button.Text>{label}</Button.Text>}
        </Button>
    );
}

export default AmountSignFlipButton;
export type {AmountSignFlipButtonProps};
