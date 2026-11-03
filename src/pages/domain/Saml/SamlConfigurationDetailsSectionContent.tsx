import ActivityIndicator from '@components/ActivityIndicator';
import CopyableTextField from '@components/Domain/CopyableTextField';
import FormHelpMessageRowWithRetryButton from '@components/Domain/FormHelpMessageRowWithRetryButton';
import FormHelpMessage from '@components/FormHelpMessage';
import MenuItem from '@components/MenuItem';
import MenuItemSectionRoot from '@components/MenuItem/presets/MenuItemSectionRoot';
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

import React, {useEffect} from 'react';
import {View} from 'react-native';

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

    const [samlMetadata, samlMetadataResults] = useOnyx(`${ONYXKEYS.COLLECTION.SAML_METADATA}${accountID}`);

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
                description={translate('domain.samlConfigurationDetails.identityProviderMetadata')}
                label={translate('domain.samlConfigurationDetails.identityProviderMetadata')}
                wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mb3]}
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
                allowHTML
            />

            <MenuItemSectionRoot>
                <MenuItem.Row>
                    <MenuItem.Content>
                        <MenuItem.Label>{translate('domain.samlConfigurationDetails.entityID')}</MenuItem.Label>
                        <CopyableTextField
                            value={samlMetadata.entityID}
                            textStyle={styles.fontSizeLabel}
                            style={styles.mt1}
                        />
                    </MenuItem.Content>
                </MenuItem.Row>
            </MenuItemSectionRoot>

            <MenuItemSectionRoot>
                <MenuItem.Row>
                    <MenuItem.Content>
                        <MenuItem.Label>{translate('domain.samlConfigurationDetails.nameIDFormat')}</MenuItem.Label>
                        <CopyableTextField
                            value={samlMetadata.nameFormat}
                            textStyle={styles.fontSizeLabel}
                            style={styles.mt1}
                        />
                    </MenuItem.Content>
                </MenuItem.Row>
            </MenuItemSectionRoot>

            <MenuItemSectionRoot>
                <MenuItem.Row>
                    <MenuItem.Content>
                        <MenuItem.Label>{translate('domain.samlConfigurationDetails.loginUrl')}</MenuItem.Label>
                        <CopyableTextField
                            value={samlMetadata.urlLogin}
                            textStyle={styles.fontSizeLabel}
                            style={styles.mt1}
                        />
                    </MenuItem.Content>
                </MenuItem.Row>
                <FormHelpMessage
                    isError={false}
                    message={translate('domain.samlConfigurationDetails.acsUrl')}
                    style={[styles.mt3, styles.mb0]}
                />
            </MenuItemSectionRoot>

            <MenuItemSectionRoot>
                <MenuItem.Row>
                    <MenuItem.Content>
                        <MenuItem.Label>{translate('domain.samlConfigurationDetails.logoutUrl')}</MenuItem.Label>
                        <CopyableTextField
                            value={samlMetadata.urlLogout}
                            textStyle={styles.fontSizeLabel}
                            style={styles.mt1}
                        />
                    </MenuItem.Content>
                </MenuItem.Row>
                <FormHelpMessage
                    isError={false}
                    message={translate('domain.samlConfigurationDetails.sloUrl')}
                    style={[styles.mt3, styles.mb0]}
                />
            </MenuItemSectionRoot>

            <MenuItemSectionRoot>
                <MenuItem.Row>
                    <MenuItem.Content>
                        <MenuItem.Label>{translate('domain.samlConfigurationDetails.serviceProviderMetaData')}</MenuItem.Label>
                        <CopyableTextField
                            value={samlMetadata.metaService}
                            shouldDisplayShowMoreButton
                            textStyle={styles.fontSizeLabel}
                            style={styles.mt1}
                        />
                    </MenuItem.Content>
                </MenuItem.Row>
            </MenuItemSectionRoot>

            {shouldShowScimToken && (
                <MenuItemSectionRoot>
                    <MenuItem.Row>
                        <MenuItem.Content>
                            <MenuItem.Label>{translate('domain.samlConfigurationDetails.oktaScimToken')}</MenuItem.Label>
                            <View style={styles.mt1}>
                                <ScimTokenContent domainName={domainName} />
                            </View>
                        </MenuItem.Content>
                    </MenuItem.Row>
                </MenuItemSectionRoot>
            )}
        </>
    );
}

export default SamlConfigurationDetailsSectionContent;
