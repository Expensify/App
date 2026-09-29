import Button from '@components/Button';
import type {ButtonProps} from '@components/Button';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

type NumericFlipButtonProps = Pick<ButtonProps, 'isDisabled' | 'onPress' | 'style' | 'testID'>;

/** Presentational sign toggle button shared by NumericInput and NumericField. */
function NumericFlipButton({isDisabled = false, onPress, style, testID}: NumericFlipButtonProps) {
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
            <Button.Text>{label}</Button.Text>
        </Button>
    );
}

export default NumericFlipButton;
export type {NumericFlipButtonProps};
