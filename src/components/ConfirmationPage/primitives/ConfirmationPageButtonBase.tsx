import Button from '@components/Button';
import type {ButtonProps} from '@components/Button';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';

type ConfirmationPageButtonProps = Pick<ButtonProps, 'isDisabled' | 'isLoading' | 'sentryLabel'> & {
    text: string;
    onPress?: () => void;

    /** Spacing for the button, which replaces the default top margin */
    style?: StyleProp<ViewStyle>;
};

type ConfirmationPageButtonBaseProps = ConfirmationPageButtonProps &
    Pick<ButtonProps, 'testID' | 'variant'> & {
        children?: React.ReactNode;
    };

function ConfirmationPageButtonBase({text, onPress = () => {}, isDisabled, isLoading, sentryLabel, testID, variant, style, children}: ConfirmationPageButtonBaseProps) {
    const styles = useThemeStyles();

    return (
        <Button
            size={CONST.BUTTON_SIZE.LARGE}
            testID={testID}
            style={style ?? styles.mt3}
            isDisabled={isDisabled}
            isLoading={isLoading}
            variant={variant}
            onPress={onPress}
            sentryLabel={sentryLabel}
        >
            {children}
            <Button.Text>{text}</Button.Text>
        </Button>
    );
}

export default ConfirmationPageButtonBase;
export type {ConfirmationPageButtonProps};
