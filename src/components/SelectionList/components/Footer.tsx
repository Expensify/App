import React from 'react';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import type {ConfirmButtonOptions, ListItem} from '@components/SelectionList/types';
import useThemeStyles from '@hooks/useThemeStyles';

type FooterProps<TItem extends ListItem> = {
    footerContent?: React.ReactNode;
    confirmButtonOptions?: ConfirmButtonOptions<TItem>;
    addBottomSafeAreaPadding?: boolean;
};

function Footer<TItem extends ListItem>({footerContent, confirmButtonOptions, addBottomSafeAreaPadding = false}: FooterProps<TItem>) {
    const styles = useThemeStyles();
    const {showButton, text, onConfirm, isDisabled, style} = confirmButtonOptions ?? {};
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

    if (showButton) {
        return (
            <FixedFooter
                style={styles.mtAuto}
                addBottomSafeAreaPadding={addBottomSafeAreaPadding}
            >
                <Button
                    success
                    large
                    style={[styles.w100, style]}
                    text={text}
                    onPress={onConfirm}
                    pressOnEnter
                    enterKeyEventListenerPriority={1}
                    isDisabled={isDisabled}
                />
            </FixedFooter>
        );
    }

    return null;
}

Footer.displayName = 'Footer';
export default React.memo(Footer) as typeof Footer;
