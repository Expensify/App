import React from 'react';
import Button from '@components/Button';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getQuickBooksOnlineSetupLink} from '@libs/actions/connections/QuickBooksOnline';
import * as Link from '@userActions/Link';
import type {ConnectToQuickbooksOnlineButtonProps} from './types';

function ConnectToQuickbooksOnlineButton({policyID}: ConnectToQuickbooksOnlineButtonProps) {
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const styles = useThemeStyles();
    return (
        <Button
            onPress={() => Link.openLink(getQuickBooksOnlineSetupLink(policyID), environmentURL, false)}
            text={translate('workspace.accounting.setup')}
            style={styles.justifyContentCenter}
        />
    );
}

ConnectToQuickbooksOnlineButton.displayName = 'ConnectToQuickbooksOnlineButton';

export default ConnectToQuickbooksOnlineButton;
