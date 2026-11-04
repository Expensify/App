import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';

type ShareButtonProps = {
    onPress: () => void;
    /** Disables the button and shows a loading indicator while sharing. Defaults to false. */
    isLoading?: boolean;
};

function ShareButton({onPress, isLoading = false}: ShareButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <FixedFooter style={[styles.pt4]}>
            <Button
                variant={CONST.BUTTON_VARIANT.SUCCESS}
                size={CONST.BUTTON_SIZE.LARGE}
                style={styles.w100}
                onPress={onPress}
                isLoading={isLoading}
                sentryLabel={CONST.SENTRY_LABEL.SHARE_DETAIL.SHARE_BUTTON}
            >
                <Button.Text>{translate('common.share')}</Button.Text>
            </Button>
        </FixedFooter>
    );
}

export default ShareButton;
