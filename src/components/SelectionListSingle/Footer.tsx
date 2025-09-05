import React from 'react';
import type {GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import useThemeStyles from '@hooks/useThemeStyles';

type ConfirmButtonProps = {
    showButton?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onConfirm?: (e?: GestureResponderEvent | KeyboardEvent | undefined, option?: any) => void;
    style?: StyleProp<ViewStyle>;
    text?: string;
    isDisabled?: boolean;
};

type FooterProps = {
    footerContent?: React.ReactNode;
    confirmButtonConfig?: ConfirmButtonProps;
    addBottomSafeAreaPadding?: boolean;
};

function Footer({footerContent, confirmButtonConfig, addBottomSafeAreaPadding = false}: FooterProps) {
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

    if (confirmButtonConfig?.showButton) {
        return (
            <FixedFooter
                style={styles.mtAuto}
                addBottomSafeAreaPadding={addBottomSafeAreaPadding}
            >
                <Button
                    success
                    large
                    style={[styles.w100, confirmButtonConfig?.style]}
                    text={confirmButtonConfig?.text}
                    onPress={confirmButtonConfig?.onConfirm}
                    pressOnEnter
                    enterKeyEventListenerPriority={1}
                    isDisabled={confirmButtonConfig?.isDisabled}
                />
            </FixedFooter>
        );
    }

    return null;
}

Footer.displayName = 'Footer';
export default React.memo(Footer);
