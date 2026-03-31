import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {ButtonProps} from './Button';
import Button from './Button';

function ButtonOnlyIcon(props: ButtonProps) {
    const styles = useThemeStyles();

    const buttonSizeStyles = {
        [CONST.DROPDOWN_BUTTON_SIZE.EXTRA_SMALL]: styles.buttonExtraSmall,
        [CONST.DROPDOWN_BUTTON_SIZE.SMALL]: styles.buttonSmall,
        [CONST.DROPDOWN_BUTTON_SIZE.MEDIUM]: styles.buttonMedium,
        [CONST.DROPDOWN_BUTTON_SIZE.LARGE]: styles.buttonLarge,
    };
    return (
        <Button
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            buttonContainerPaddingStyles={buttonSizeStyles[props.size ?? CONST.DROPDOWN_BUTTON_SIZE.MEDIUM]}
        />
    );
}

export default ButtonOnlyIcon;
