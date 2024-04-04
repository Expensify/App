import React from 'react';
import Button from '@components/Button';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import getQuickBooksOnlineSetupLink from '@libs/actions/connections/QuickBooksOnline';
import * as Link from '@userActions/Link';
import type {ConnectToQuickbooksOnlineButtonProps} from './types';

function ConnectToQuickbooksOnlineButton({policyID, environmentURL}: ConnectToQuickbooksOnlineButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <Button
            onPress={() => {
                Link.openLink(getQuickBooksOnlineSetupLink(policyID), environmentURL, false);
            }}
            text={translate('workspace.accounting.setup')}
            style={styles.justifyContentCenter}
            small
        />
    );
}

export default ConnectToQuickbooksOnlineButton;
