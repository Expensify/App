import Button from '@components/ButtonComposed';
import FixedFooter from '@components/FixedFooter';
import type {ConfirmButtonOptions, ListItem} from '@components/SelectionList/types';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';

type FooterProps<TItem extends ListItem> = {
    footerContent?: React.ReactNode;
    confirmButtonOptions?: ConfirmButtonOptions<TItem>;
    addBottomSafeAreaPadding?: boolean;
};

function Footer<TItem extends ListItem>({footerContent, confirmButtonOptions, addBottomSafeAreaPadding = false}: FooterProps<TItem>) {
    const styles = useThemeStyles();
    const {
        showButton: showConfirmButton,
        text: confirmButtonText,
        onConfirm,
        style: confirmButtonStyle,
        isDisabled: isConfirmButtonDisabled,
        confirmButtonSize = 'large',
    } = confirmButtonOptions ?? {};
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

    if (showConfirmButton) {
        return (
            <FixedFooter
                style={styles.mtAuto}
                addBottomSafeAreaPadding={addBottomSafeAreaPadding}
            >
                <Button
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    size={confirmButtonSize}
                    style={[styles.w100, confirmButtonStyle]}
                    onPress={onConfirm}
                    isDisabled={isConfirmButtonDisabled}
                >
                    <Button.KeyboardShortcut enterKeyEventListenerPriority={1} />
                    {!!confirmButtonText && <Button.Text>{confirmButtonText}</Button.Text>}
                </Button>
            </FixedFooter>
        );
    }

    return null;
}

Footer.displayName = 'Footer';

export default React.memo(Footer) as typeof Footer;
