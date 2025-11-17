import React from 'react';
import {View} from 'react-native';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import RenderHTML from '@components/RenderHTML';
import Section from '@components/Section';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setSamlEnabled, setSamlRequired} from '@libs/actions/Domain';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function SamlLoginSectionSubtitle() {
    const {translate} = useLocalize();

    return <RenderHTML html={translate('domain.samlLogin.subtitle')} />;
}

function SamlLoginSection({accountID, domainName, isSamlEnabled, isSamlRequired}: {accountID: number; domainName: string; isSamlEnabled: boolean; isSamlRequired: boolean}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [domain] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`, {canBeMissing: true});

    return (
        <Section
            title={translate('domain.samlLogin.title')}
            renderSubtitle={SamlLoginSectionSubtitle}
            isCentralPane
            titleStyles={styles.accountSettingsSectionTitle}
            childrenStyles={[styles.gap6, styles.pt6]}
        >
            <OfflineWithFeedback
                pendingAction={domain?.settings.isSamlEnabledLoading ? CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : undefined}
                errors={domain?.settings.samlEnabledError}
                canDismissError={false}
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
                    pendingAction={domain?.settings.isSamlRequiredLoading ? CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : undefined}
                    errors={domain?.settings.samlRequiredError}
                    canDismissError={false}
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
        </Section>
    );
}

SamlLoginSection.displayName = 'SamlLoginSection';

export default SamlLoginSection;
