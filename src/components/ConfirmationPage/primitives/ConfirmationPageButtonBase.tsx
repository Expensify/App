import Button from '@components/Button';
import type {ButtonProps} from '@components/Button';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

type ConfirmationPageButtonProps = Pick<ButtonProps, 'isDisabled' | 'isLoading'> & {
    text: string;
    onPress?: () => void;
};

type ConfirmationPageButtonBaseProps = ConfirmationPageButtonProps &
    Pick<ButtonProps, 'testID' | 'variant'> & {
        children?: React.ReactNode;
    };

function ConfirmationPageButton({text, onPress = () => {}, isDisabled, isLoading, testID, variant, children}: ConfirmationPageButtonBaseProps) {
    const styles = useThemeStyles();

    return (
        <Button
            size={CONST.BUTTON_SIZE.LARGE}
            testID={testID}
            style={styles.mt3}
            isDisabled={isDisabled}
            isLoading={isLoading}
            variant={variant}
            onPress={onPress}
        >
            {children}
            <Button.Text>{text}</Button.Text>
        </Button>
    );
}

export default ConfirmationPageButton;
export type {ConfirmationPageButtonProps};
