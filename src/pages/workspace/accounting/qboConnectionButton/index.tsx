import React from 'react';
import {withOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import getQuickBooksOnlineSetupLink from '@libs/actions/connections/getQuickBooksOnlineSetupLink';
import * as Link from '@userActions/Link';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ConnectToQuickbooksOnlineButtonOnyxProps, ConnectToQuickbooksOnlineButtonProps} from './types';

function ConnectToQuickbooksOnlineButton({policyID, environmentURL}: ConnectToQuickbooksOnlineButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <Button
            onPress={() => Link.openLink(getQuickBooksOnlineSetupLink(policyID), environmentURL)}
            text={translate('workspace.accounting.setup')}
            style={styles.justifyContentCenter}
            small
        />
    );
}

export default withOnyx<ConnectToQuickbooksOnlineButtonProps, ConnectToQuickbooksOnlineButtonOnyxProps>({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(ConnectToQuickbooksOnlineButton);
