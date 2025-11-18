import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import ActivityIndicator from '@components/ActivityIndicator';
import CopyableTextField from '@components/Domain/CopyableTextField';
import FormHelpMessageRowWithRetryButton from '@components/Domain/FormHelpMessageRowWithRetryButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import TextPicker from '@components/TextPicker';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getSamlSettings, setSamlMetadata} from '@libs/actions/Domain';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Domain} from '@src/types/onyx';
import ScimTokenContent from './ScimTokenContent';

const domainSamlMetadataErrorSelector = (domain: OnyxEntry<Domain>) => domain?.samlMetadataError;

type SamlConfigurationDetailsSectionContentProps = {
    /** The unique identifier for the domain. */
    accountID: number;

    /** The domain name associated with the SAML configuration. */
    domainName: string;

    /** Whether to display the Okta SCIM token menu item. */
    shouldShowScimToken: boolean;
};

function SamlConfigurationDetailsSectionContent({accountID, domainName, shouldShowScimToken}: SamlConfigurationDetailsSectionContentProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [samlMetadataError] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`, {canBeMissing: false, selector: domainSamlMetadataErrorSelector});
    const [samlMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.NVP_PRIVATE_SAML_METADATA}${accountID}`, {canBeMissing: true});

    if (samlMetadata?.isLoading) {
        return <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />;
    }

    if (samlMetadata?.errors) {
        return (
            <FormHelpMessageRowWithRetryButton
                message={getLatestErrorMessage(samlMetadata)}
                onRetry={() => getSamlSettings(accountID, domainName)}
            />
        );
    }

    return (
        <>
            <TextPicker
                value={samlMetadata?.metaIdentity}
                inputID="identityProviderMetadata"
                description={translate('domain.samlConfigurationDetails.identityProviderMetaData')}
                wrapperStyle={styles.sectionMenuItemTopDescription}
                numberOfLinesTitle={2}
                titleStyle={[styles.fontSizeLabel, styles.textMono]}
                descriptionTextStyle={[styles.fontSizeLabel, styles.pb1]}
                numberOfLines={4}
                multiline
                onValueCommitted={(value) => {
                    setSamlMetadata(accountID, domainName ?? '', {metaIdentity: value});
                }}
                errorText={getLatestErrorMessage({errors: samlMetadataError})}
                maxLength={Infinity}
            />

            <MenuItemWithTopDescription
                titleComponent={
                    <CopyableTextField
                        value={samlMetadata?.entityID}
                        textStyle={styles.fontSizeLabel}
                    />
                }
                description={translate('domain.samlConfigurationDetails.entityID')}
                descriptionTextStyle={[styles.fontSizeLabel, styles.pb2]}
                interactive={false}
                wrapperStyle={[styles.sectionMenuItemTopDescription, styles.pv0]}
            />

            <MenuItemWithTopDescription
                titleComponent={
                    <CopyableTextField
                        value={samlMetadata?.nameFormat}
                        textStyle={styles.fontSizeLabel}
                    />
                }
                description={translate('domain.samlConfigurationDetails.nameIDFormat')}
                descriptionTextStyle={[styles.fontSizeLabel, styles.pb2]}
                interactive={false}
                wrapperStyle={[styles.sectionMenuItemTopDescription, styles.pv0]}
            />

            <MenuItemWithTopDescription
                titleComponent={
                    <CopyableTextField
                        value={samlMetadata?.urlLogin}
                        style={styles.mb2}
                        textStyle={styles.fontSizeLabel}
                    />
                }
                description={translate('domain.samlConfigurationDetails.loginUrl')}
                descriptionTextStyle={[styles.fontSizeLabel, styles.pb2]}
                interactive={false}
                wrapperStyle={[styles.sectionMenuItemTopDescription, styles.pv0]}
                hintText={translate('domain.samlConfigurationDetails.acsUrl')}
            />

            <MenuItemWithTopDescription
                titleComponent={
                    <CopyableTextField
                        value={samlMetadata?.urlLogout}
                        style={styles.mb2}
                        textStyle={styles.fontSizeLabel}
                    />
                }
                description={translate('domain.samlConfigurationDetails.logoutUrl')}
                descriptionTextStyle={[styles.fontSizeLabel, styles.pb2]}
                interactive={false}
                wrapperStyle={[styles.sectionMenuItemTopDescription, styles.pv0]}
                hintText={translate('domain.samlConfigurationDetails.sloUrl')}
            />

            <MenuItemWithTopDescription
                titleComponent={
                    <CopyableTextField
                        value={samlMetadata?.metaService}
                        shouldDisplayShowMoreButton
                        textStyle={styles.fontSizeLabel}
                    />
                }
                description={translate('domain.samlConfigurationDetails.serviceProviderMetaData')}
                descriptionTextStyle={[styles.fontSizeLabel, styles.pb2]}
                interactive={false}
                wrapperStyle={[styles.sectionMenuItemTopDescription, styles.pv0]}
            />

            {shouldShowScimToken && (
                <MenuItemWithTopDescription
                    titleComponent={<ScimTokenContent domainName={domainName} />}
                    description={translate('domain.samlConfigurationDetails.oktaScimToken')}
                    descriptionTextStyle={[styles.fontSizeLabel, styles.pb2]}
                    interactive={false}
                    wrapperStyle={[styles.sectionMenuItemTopDescription, styles.pv0]}
                />
            )}
        </>
    );
}

SamlConfigurationDetailsSectionContent.displayName = 'SamlConfigurationDetailsSectionContent';

export default SamlConfigurationDetailsSectionContent;
