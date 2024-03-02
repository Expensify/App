import React from 'react';
import Text from '@components/Text';
import useEnvironment from '@hooks/useEnvironment';
import Button from '@components/Button';
import { getQuickBooksOnlineSetupLink } from '@libs/actions/Integrations/QuickBooksOnline';
import * as Link from '@userActions/Link';

function ConnectToQuickbooksOnlineButton({policyID}: {policyID: string}) {
    const {environmentURL} = useEnvironment();
    return (
        <Button
            onPress={() => {
                Link.openLink(getQuickBooksOnlineSetupLink(policyID), environmentURL, false);
            }}
        >
            <Text>Setup</Text>
        </Button>
    );
}

ConnectToQuickbooksOnlineButton.displayName = 'ConnectToQuickbooksOnlineButton';

export default ConnectToQuickbooksOnlineButton;