import React, {useState} from 'react';
import Button from '@components/Button';
import CopyableTextField from '@components/Domain/CopyableTextField';
import FormHelpMessageRowWithRetryButton from '@components/Domain/FormHelpMessageRowWithRetryButton';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import {getScimToken} from '@libs/actions/Domain';
import type {ScimTokenWithState} from '@libs/actions/ScimToken/ScimTokenUtils';
import {ScimTokenState} from '@libs/actions/ScimToken/ScimTokenUtils';

type ScimTokenContentProps = {
    /** The domain name associated with the SCIM token. */
    domainName: string;
};

function ScimTokenContent({domainName}: ScimTokenContentProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    const [oktaScimToken, setOktaScimToken] = useState<ScimTokenWithState>(undefined);

    const fetchOktaScimToken = async () => {
        setOktaScimToken({state: ScimTokenState.LOADING});
        setOktaScimToken(await getScimToken(domainName ?? ''));
    };

    // token not fetched yet
    if (!oktaScimToken || oktaScimToken.state === ScimTokenState.LOADING) {
        return (
            <Button
                text={translate('domain.samlConfigurationDetails.revealToken')}
                style={styles.alignSelfStart}
                onPress={fetchOktaScimToken}
                isLoading={oktaScimToken?.state === ScimTokenState.LOADING}
                isDisabled={isOffline}
            />
        );
    }

    // token fetching failed
    if (oktaScimToken.state === ScimTokenState.ERROR) {
        return (
            <FormHelpMessageRowWithRetryButton
                message={oktaScimToken.error}
                onRetry={fetchOktaScimToken}
                isButtonSmall
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

ScimTokenContent.displayName = 'ScimTokenContent';

export default ScimTokenContent;
