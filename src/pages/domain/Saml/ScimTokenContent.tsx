import Button from '@components/ButtonComposed';
import ButtonDisabledWhenOffline from '@components/ButtonComposed/composed/ButtonDisabledWhenOffline';
import CopyableTextField from '@components/Domain/CopyableTextField';
import FormHelpMessageRowWithRetryButton from '@components/Domain/FormHelpMessageRowWithRetryButton';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {getScimToken} from '@libs/actions/Domain';
import type {ScimTokenWithState} from '@libs/actions/ScimToken/ScimTokenUtils';
import {ScimTokenState} from '@libs/actions/ScimToken/ScimTokenUtils';

import CONST from '@src/CONST';

import React, {useState} from 'react';

type ScimTokenContentProps = {
    /** The domain name associated with the SCIM token. */
    domainName: string;
};

function ScimTokenContent({domainName}: ScimTokenContentProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [oktaScimToken, setOktaScimToken] = useState<ScimTokenWithState>(undefined);

    const fetchOktaScimToken = async () => {
        setOktaScimToken({state: ScimTokenState.LOADING});
        setOktaScimToken(await getScimToken(domainName ?? ''));
    };

    // token not fetched yet
    if (!oktaScimToken || oktaScimToken.state === ScimTokenState.LOADING) {
        return (
            <ButtonDisabledWhenOffline
                style={styles.alignSelfStart}
                onPress={fetchOktaScimToken}
                isLoading={oktaScimToken?.state === ScimTokenState.LOADING}
            >
                <Button.Text>{translate('domain.samlConfigurationDetails.revealToken')}</Button.Text>
            </ButtonDisabledWhenOffline>
        );
    }

    // token fetching failed
    if (oktaScimToken.state === ScimTokenState.ERROR) {
        return (
            <FormHelpMessageRowWithRetryButton
                message={oktaScimToken.error}
                onRetry={fetchOktaScimToken}
                size={CONST.BUTTON_SIZE.SMALL}
            />
        );
    }

    // token successfully fetched
    return (
        <CopyableTextField
            value={oktaScimToken.value}
            textStyle={styles.fontSizeLabel}
        />
    );
}

export default ScimTokenContent;
