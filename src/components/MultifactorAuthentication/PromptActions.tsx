import React, {memo} from 'react';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

type MultifactorAuthenticationPromptActionsProps = {
    onGoBackPress: () => void;
    onConfirm: () => void;
};

function MultifactorAuthenticationPromptActions({onGoBackPress, onConfirm}: MultifactorAuthenticationPromptActionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <FixedFooter style={[styles.flexColumn, styles.gap3]}>
            {/* TODO: MFA/Dev Remove not now button */}
            <Button
                onPress={onGoBackPress}
                text={translate('common.notNow')}
            />
            <Button
                success
                onPress={onConfirm}
                text={translate('common.buttonConfirm')}
            />
        </FixedFooter>
    );
}

MultifactorAuthenticationPromptActions.displayName = 'MultifactorAuthenticationPromptActions';

export default memo(MultifactorAuthenticationPromptActions);
