import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import ConfirmModal from '@components/ConfirmModal';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import RenderHTML from '@components/RenderHTML';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {resetSamlEnabledError, resetSamlRequiredError, setSamlEnabled, setSamlRequired} from '@libs/actions/Domain';
import {getLatestErrorMessageField} from '@libs/ErrorUtils';
import {addLeadingForwardSlash} from '@libs/Url';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {domainMemberSettingsSelector, domainSamlSettingsStateSelector, metaIdentitySelector} from '@src/selectors/Domain';

type SamlLoginSectionContentProps = {
    /** The unique identifier for the domain. */
    accountID: number;

    /** The domain name associated with the SAML configuration. */
    domainName: string;

    /** Whether SAML authentication is enabled. */
    isSamlEnabled: boolean;

    /** Whether SAML authentication is required for the domain. */
    isSamlRequired: boolean;

    /** Whether Okta SCIM is enabled for the domain. */
    isOktaScimEnabled: boolean;
};

function SamlLoginSectionContent({accountID, domainName, isSamlEnabled, isSamlRequired, isOktaScimEnabled}: SamlLoginSectionContentProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [domain] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`, {
        selector: domainSamlSettingsStateSelector,
    });
    const [metaIdentity] = useOnyx(`${ONYXKEYS.COLLECTION.SAML_METADATA}${accountID}`, {selector: metaIdentitySelector});
    const [domainSettings] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${accountID}`, {
        selector: domainMemberSettingsSelector,
    });
    const [isOktaScimConfirmModalVisible, setIsScimConfirmModalVisible] = useState(false);

    useEffect(() => {
        // Auto dismiss the saml enabled/required errors when first opening the page
        resetSamlEnabledError(accountID);
        resetSamlRequiredError(accountID);
    }, [accountID]);

    const {environmentURL} = useEnvironment();
    const domainMembersSettingsHref = `${environmentURL}${addLeadingForwardSlash(ROUTES.DOMAIN_MEMBERS_SETTINGS.getRoute(accountID))}`;

    return (
        <>
            <OfflineWithFeedback
                pendingAction={domain?.isSamlEnabledLoading ? CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : undefined}
                errors={getLatestErrorMessageField({errors: domain?.samlEnabledError})}
                onClose={() => resetSamlEnabledError(accountID)}
                dismissError={() => resetSamlEnabledError(accountID)}
            >
                <View style={styles.sectionMenuItemTopDescription}>
                    <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.gap3, styles.pv1]}>
                        <Text>{translate('domain.samlLogin.enableSamlLogin')}</Text>

                        <Switch
                            accessibilityLabel={translate('domain.samlLogin.enableSamlLogin')}
                            isOn={isSamlEnabled}
                            disabled={domainSettings?.twoFactorAuthRequired}
                            onToggle={() => setSamlEnabled({enabled: !isSamlEnabled, accountID, domainName})}
                        />
                    </View>

                    {domainSettings?.twoFactorAuthRequired ? (
                        <View>
                            <RenderHTML html={translate('domain.samlLogin.pleaseDisableTwoFactorAuth', domainMembersSettingsHref)} />
                        </View>
                    ) : (
                        <Text style={[styles.formHelp, styles.pr15]}>{translate('domain.samlLogin.allowMembers')}</Text>
                    )}
                </View>
            </OfflineWithFeedback>

            {isSamlEnabled && (
                <OfflineWithFeedback
                    pendingAction={domain?.isSamlRequiredLoading ? CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : undefined}
                    errors={getLatestErrorMessageField({errors: domain?.samlRequiredError})}
                    onClose={() => resetSamlRequiredError(accountID)}
                    dismissError={() => resetSamlRequiredError(accountID)}
                >
                    <View style={styles.sectionMenuItemTopDescription}>
                        <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.gap3, styles.pv1]}>
                            <Text>{translate('domain.samlLogin.requireSamlLogin')}</Text>
                            <Switch
                                accessibilityLabel={translate('domain.samlLogin.requireSamlLogin')}
                                isOn={isSamlRequired}
                                onToggle={() => {
                                    if (isSamlRequired && isOktaScimEnabled) {
                                        setIsScimConfirmModalVisible(true);
                                        return;
                                    }
                                    setSamlRequired({required: !isSamlRequired, accountID, domainName, metaIdentity});
                                }}
                            />
                        </View>

                        <Text style={[styles.formHelp, styles.pr15]}>{translate('domain.samlLogin.anyMemberWillBeRequired')}</Text>
                    </View>
                </OfflineWithFeedback>
            )}

            <ConfirmModal
                isVisible={isOktaScimConfirmModalVisible}
                onConfirm={() => {
                    setSamlRequired({required: false, accountID, domainName, metaIdentity});
                    setIsScimConfirmModalVisible(false);
                }}
                title={translate('domain.samlLogin.disableSamlRequired')}
                prompt={translate('domain.samlLogin.oktaWarningPrompt')}
                confirmText={translate('common.disable')}
                cancelText={translate('common.cancel')}
                onCancel={() => setIsScimConfirmModalVisible(false)}
                danger
                shouldHandleNavigationBack
            />
        </>
    );
}

export default SamlLoginSectionContent;
