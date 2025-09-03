import React from 'react';
import type {GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import useThemeStyles from '@hooks/useThemeStyles';

type ConfirmButtonProps = {
    showConfirmButton?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onConfirm?: (e?: GestureResponderEvent | KeyboardEvent | undefined, option?: any) => void;
    confirmButtonStyle?: StyleProp<ViewStyle>;
    confirmButtonText?: string;
    isConfirmButtonDisabled?: boolean;
};

type FooterProps = {
    footerContent?: React.ReactNode;
    confirmButton?: ConfirmButtonProps;
    addBottomSafeAreaPadding?: boolean;
};

function Footer({footerContent, confirmButton, addBottomSafeAreaPadding = false}: FooterProps) {
    const styles = useThemeStyles();
    if (footerContent) {
        return (
            <FixedFooter
                style={styles.mtAuto}
                addBottomSafeAreaPadding={addBottomSafeAreaPadding}
            >
                {footerContent}
            </FixedFooter>
        );
    }

    if (confirmButton?.showConfirmButton) {
        return (
            <FixedFooter
                style={styles.mtAuto}
                addBottomSafeAreaPadding={addBottomSafeAreaPadding}
            >
                <Button
                    success
                    large
                    style={[styles.w100, confirmButton?.confirmButtonStyle]}
                    text={confirmButton?.confirmButtonText}
                    onPress={confirmButton?.onConfirm}
                    pressOnEnter
                    enterKeyEventListenerPriority={1}
                    isDisabled={confirmButton?.isConfirmButtonDisabled}
                />
            </FixedFooter>
        );
    }

    return null;
}

Footer.displayName = 'Footer';
export default React.memo(Footer);
