import React, {useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import CopyableTextField from '@components/Domain/CopyableTextField';
import FormHelpMessage from '@components/FormHelpMessage';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import {getScimToken} from '@libs/actions/Domain';

function ScimTokenField({domainName}: {domainName: string}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    const [oktaScimToken, setOktaScimToken] = useState<{value: string} | {error: string} | 'loading' | undefined>(undefined);

    const fetchOktaScimToken = () => {
        setOktaScimToken('loading');
        getScimToken(domainName ?? '')
            .then((value) => setOktaScimToken({value}))
            .catch((error: string) => setOktaScimToken({error}));
    };

    // token not fetched yet
    if (!oktaScimToken || oktaScimToken === 'loading') {
        return (
            <Button
                text={translate('domain.samlConfigurationDetails.revealToken')}
                style={styles.wFitContent}
                onPress={fetchOktaScimToken}
                isLoading={oktaScimToken === 'loading'}
            />
        );
    }

    // token fetching failed
    if ('error' in oktaScimToken) {
        return (
            <View style={[styles.flexRow, styles.justifyContentBetween, styles.gap3]}>
                <FormHelpMessage
                    message={oktaScimToken.error}
                    style={[styles.mt0, styles.mb0]}
                />
                <Button
                    small
                    text={translate('domain.retry')}
                    onPress={fetchOktaScimToken}
                    isDisabled={isOffline}
                />
            </View>
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
