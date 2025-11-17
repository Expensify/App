import React from 'react';
import CopyableTextField from '@components/Domain/CopyableTextField';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Section from '@components/Section';
import TextPicker from '@components/TextPicker';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setSamlMetadata} from '@libs/actions/Domain';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ScimTokenField from './ScimTokenField';

function SamlConfigurationDetailsSection({accountID, domainName, shouldShowOktaScim}: {accountID: number; domainName: string; shouldShowOktaScim: boolean}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [domain] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`, {canBeMissing: true});
    const [samlMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_SAML_METADATA}${accountID}`, {canBeMissing: false});

    return (
        <Section
            title={translate('domain.samlConfigurationDetails.title')}
            subtitle={translate('domain.samlConfigurationDetails.subtitle')}
            subtitleMuted
            isCentralPane
            titleStyles={styles.accountSettingsSectionTitle}
            childrenStyles={[styles.gap6, styles.pt6]}
        >
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
                errorText={getLatestErrorMessage({errors: domain?.samlMetadataError})}
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

            {shouldShowOktaScim && (
                <MenuItemWithTopDescription
                    titleComponent={<ScimTokenField domainName={domainName} />}
                    description={translate('domain.samlConfigurationDetails.oktaScimToken')}
                    descriptionTextStyle={[styles.fontSizeLabel, styles.pb2]}
                    interactive={false}
                    wrapperStyle={[styles.sectionMenuItemTopDescription, styles.pv0]}
                />
            )}
        </Section>
    );
}

SamlConfigurationDetailsSection.displayName = 'SamlConfigurationDetailsSection';

export default SamlConfigurationDetailsSection;
