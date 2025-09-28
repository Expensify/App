import React from 'react';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import type {ConfirmButtonOptions, ListItem} from '@components/SelectionList/types';
import useThemeStyles from '@hooks/useThemeStyles';

type FooterProps<TItem extends ListItem> = {
    footerContent?: React.ReactNode;
    confirmButtonConfig?: ConfirmButtonOptions<TItem>;
    addBottomSafeAreaPadding?: boolean;
};

function Footer<TItem extends ListItem>({footerContent, confirmButtonConfig, addBottomSafeAreaPadding = false}: FooterProps<TItem>) {
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
export default React.memo(Footer) as typeof Footer;
