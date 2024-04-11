import React from 'react';
import {withOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import getXeroSetupLink from '@libs/actions/connections/ConnectToXero';
import * as Link from '@userActions/Link';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ConnectToXeroButtonOnyxProps, ConnectToXeroButtonProps} from './types';

function ConnectToXeroButton({policyID, environmentURL}: ConnectToXeroButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <Button
            onPress={() => Link.openLink(getXeroSetupLink(policyID), environmentURL)}
            text={translate('workspace.accounting.setup')}
            style={styles.justifyContentCenter}
            small
        />
    );
}

export default withOnyx<ConnectToXeroButtonProps, ConnectToXeroButtonOnyxProps>({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(ConnectToXeroButton);
