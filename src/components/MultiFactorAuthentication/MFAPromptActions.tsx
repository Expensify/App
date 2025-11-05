import React, {memo} from 'react';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

type MFAPromptActionsProps = {
    onGoBackPress: () => void;
    onConfirm: () => void;
};

function MFAPromptActions({onGoBackPress, onConfirm}: MFAPromptActionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <FixedFooter style={[styles.flexColumn, styles.gap3]}>
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

MFAPromptActions.displayName = 'MFAPromptActions';

export default memo(MFAPromptActions);
