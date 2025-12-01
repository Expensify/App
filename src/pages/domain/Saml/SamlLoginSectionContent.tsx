import React from 'react';
import {View} from 'react-native';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {resetSamlEnabledError, resetSamlRequiredError, setSamlEnabled, setSamlRequired} from '@libs/actions/Domain';
import {getLatestErrorMessageField} from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {domainSamlSettingsStateSelector} from '@src/selectors/Domain';

type SamlLoginSectionContentProps = {
    /** The unique identifier for the domain. */
    accountID: number;

    /** The domain name associated with the SAML configuration. */
    domainName: string;

    /** Whether SAML authentication is enabled. */
    isSamlEnabled: boolean;

    /** Whether SAML authentication is required for the domain. */
    isSamlRequired: boolean;
};

function SamlLoginSectionContent({accountID, domainName, isSamlEnabled, isSamlRequired}: SamlLoginSectionContentProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [domain] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`, {
        canBeMissing: false,
        selector: domainSamlSettingsStateSelector,
    });

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
                            onToggle={() => setSamlEnabled(!isSamlEnabled, accountID, domainName ?? '')}
                        />
                    </View>

                    <Text style={[styles.formHelp, styles.pr15]}>{translate('domain.samlLogin.allowMembers')}</Text>
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
                                onToggle={() => setSamlRequired(!isSamlRequired, accountID, domainName ?? '')}
                            />
                        </View>

                        <Text style={[styles.formHelp, styles.pr15]}>{translate('domain.samlLogin.anyMemberWillBeRequired')}</Text>
                    </View>
                </OfflineWithFeedback>
            )}
        </>
    );
}

SamlLoginSectionContent.displayName = 'SamlLoginSectionContent';

export default SamlLoginSectionContent;
