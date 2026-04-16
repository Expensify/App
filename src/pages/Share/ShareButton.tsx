import React from 'react';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

type ShareButtonProps = {
    onPress: () => void;
};

function ShareButton({onPress}: ShareButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <FixedFooter style={[styles.pt4]}>
            <Button
                success
                large
                text={translate('common.share')}
                style={styles.w100}
                onPress={onPress}
            />
        </FixedFooter>
    );
}

export default ShareButton;
