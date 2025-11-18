import React, {useState} from 'react';
import Button from '@components/Button';
import CopyableTextField from '@components/Domain/CopyableTextField';
import FormHelpMessageRowWithRetryButton from '@components/Domain/FormHelpMessageRowWithRetryButton';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getScimToken} from '@libs/actions/Domain';

const ScimTokenState = {
    VALUE: 'value',
    LOADING: 'loading',
    ERROR: 'error',
} as const;

function ScimTokenField({domainName}: {domainName: string}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [oktaScimToken, setOktaScimToken] = useState<
        {state: typeof ScimTokenState.VALUE; value: string} | {state: typeof ScimTokenState.ERROR; error: string} | {state: typeof ScimTokenState.LOADING} | undefined
    >(undefined);

    const fetchOktaScimToken = () => {
        setOktaScimToken({state: ScimTokenState.LOADING});
        getScimToken(domainName ?? '')
            .then((value) => setOktaScimToken({state: ScimTokenState.VALUE, value}))
            .catch((error: string) => setOktaScimToken({state: ScimTokenState.ERROR, error}));
    };

    // token not fetched yet
    if (!oktaScimToken || oktaScimToken.state === ScimTokenState.LOADING) {
        return (
            <Button
                text={translate('domain.samlConfigurationDetails.revealToken')}
                style={styles.wFitContent}
                onPress={fetchOktaScimToken}
                isLoading={oktaScimToken?.state === ScimTokenState.LOADING}
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

    // token succesfully fetched
    return (
        <CopyableTextField
            value={oktaScimToken.value}
            textStyle={styles.fontSizeLabel}
        />
    );
}

ScimTokenField.displayName = 'ScimTokenField';

export default ScimTokenField;
