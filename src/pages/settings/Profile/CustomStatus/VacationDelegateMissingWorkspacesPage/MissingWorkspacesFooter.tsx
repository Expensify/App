import Button from '@components/ButtonComposed';
import FixedFooter from '@components/FixedFooter';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';

type MissingWorkspacesFooterProps = {
    /** The current user administers some of the missing workspaces, so they are offered the invite */
    canInvite: boolean;

    /** One of the workspaces to invite into has not loaded, so the invite cannot be built yet */
    isInviteDisabled: boolean;

    onInvite: () => void;

    /** Sets the delegate without sending any invite, backing both Skip and Confirm */
    onSkip: () => void;
};

function MissingWorkspacesFooter({canInvite, isInviteDisabled, onInvite, onSkip}: MissingWorkspacesFooterProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    if (!canInvite) {
        return (
            <FixedFooter addBottomSafeAreaPadding>
                <Button
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    size={CONST.BUTTON_SIZE.LARGE}
                    onPress={onSkip}
                >
                    <Button.Text>{translate('common.confirm')}</Button.Text>
                </Button>
            </FixedFooter>
        );
    }

    return (
        <FixedFooter addBottomSafeAreaPadding>
            <Button
                variant={CONST.BUTTON_VARIANT.SUCCESS}
                size={CONST.BUTTON_SIZE.LARGE}
                isDisabled={isInviteDisabled}
                onPress={onInvite}
            >
                <Button.Text>{translate('common.invite')}</Button.Text>
            </Button>
            <Button
                size={CONST.BUTTON_SIZE.LARGE}
                style={styles.mt3}
                onPress={onSkip}
            >
                <Button.Text>{translate('common.skip')}</Button.Text>
            </Button>
        </FixedFooter>
    );
}

MissingWorkspacesFooter.displayName = 'MissingWorkspacesFooter';

export default MissingWorkspacesFooter;
