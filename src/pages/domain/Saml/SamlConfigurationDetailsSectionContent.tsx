import React, {useEffect} from 'react';
import ActivityIndicator from '@components/ActivityIndicator';
import CopyableTextField from '@components/Domain/CopyableTextField';
import FormHelpMessageRowWithRetryButton from '@components/Domain/FormHelpMessageRowWithRetryButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import TextPicker from '@components/TextPicker';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getSamlSettings, setSamlIdentity} from '@libs/actions/Domain';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import StringUtils from '@libs/StringUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import ScimTokenContent from './ScimTokenContent';

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

    const [samlMetadata, samlMetadataResults] = useOnyx(`${ONYXKEYS.COLLECTION.SAML_METADATA}${accountID}`, {canBeMissing: true});

    useEffect(() => {
        if (!domainName) {
            return;
        }
        getSamlSettings(accountID, domainName);
    }, [accountID, domainName]);

    if (samlMetadata?.isLoading || isLoadingOnyxValue(samlMetadataResults)) {
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

    if (!samlMetadata) {
        return null;
    }

    return (
        <>
            <TextPicker
                value={samlMetadata.metaIdentity}
                inputID="identityProviderMetadata"
                description={translate('domain.samlConfigurationDetails.identityProviderMetaData')}
                label={translate('domain.samlConfigurationDetails.identityProviderMetaData')}
                wrapperStyle={styles.sectionMenuItemTopDescription}
                numberOfLinesTitle={2}
                titleStyle={[styles.fontSizeLabel, styles.textMono, styles.wordBreakAll]}
                descriptionTextStyle={[styles.fontSizeLabel, styles.pb1]}
                autoGrowHeight
                maxAutoGrowHeight={variables.textInputAutoGrowMaxHeight}
                onValueCommitted={(metaIdentity) => {
                    if (metaIdentity === StringUtils.normalizeCRLF(samlMetadata.metaIdentity)) {
                        return;
                    }
                    setSamlIdentity(accountID, domainName, metaIdentity);
                }}
                errorText={getLatestErrorMessage({errors: samlMetadata.samlMetadataError})}
                maxLength={Infinity}
                enabledWhenOffline={false}
                required
            />

            <MenuItemWithTopDescription
                titleComponent={
                    <CopyableTextField
                        value={samlMetadata.entityID}
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
                        value={samlMetadata.nameFormat}
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
                        value={samlMetadata.urlLogin}
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
                        value={samlMetadata.urlLogout}
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
                        value={samlMetadata.metaService}
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
