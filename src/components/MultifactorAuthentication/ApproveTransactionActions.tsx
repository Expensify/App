import React, {memo} from 'react';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

type MultifactorAuthenticationApproveTransactionActionsProps = {
    onApprove: () => void;
    onDeny: () => void;
};

function MultifactorAuthenticationApproveTransactionActions({onApprove, onDeny}: MultifactorAuthenticationApproveTransactionActionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <FixedFooter style={[styles.flexRow, styles.gap2]}>
            <Button
                danger
                large
                style={styles.flex1}
                onPress={onDeny}
                text={translate('multifactorAuthentication.approveTransaction.deny')}
            />
            <Button
                success
                large
                style={styles.flex1}
                onPress={onApprove}
                text={translate('multifactorAuthentication.approveTransaction.approve')}
            />
        </FixedFooter>
    );
}

MultifactorAuthenticationApproveTransactionActions.displayName = 'MultifactorAuthenticationApproveTransactionActions';

export default memo(MultifactorAuthenticationApproveTransactionActions);
