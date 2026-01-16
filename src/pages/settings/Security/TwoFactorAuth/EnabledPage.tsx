import {activeAdminPoliciesSelector} from '@selectors/Policy';
import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import * as Expensicons from '@components/Icon/Expensicons';
import {loadIllustration} from '@components/Icon/IllustrationLoader';
import type {IllustrationName} from '@components/Icon/IllustrationLoader';
import MenuItem from '@components/MenuItem';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyAsset} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {hasPolicyWithXeroConnection} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';
import TwoFactorAuthWrapper from './TwoFactorAuthWrapper';

function EnabledPage() {
    const theme = useTheme();
    const styles = useThemeStyles();

    const [isVisible, setIsVisible] = useState(false);
    const {asset: ShieldYellow} = useMemoizedLazyAsset(() => loadIllustration('ShieldYellow' as IllustrationName));
    const {login} = useCurrentUserPersonalDetails();
    const selector = useCallback(
        (policies: OnyxCollection<Policy>) => {
            return activeAdminPoliciesSelector(policies, login ?? '');
        },
        [login],
    );
    const [adminPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true, selector});
    const {translate} = useLocalize();

    const closeModal = useCallback(() => {
        setIsVisible(false);
    }, []);

    return (
        <TwoFactorAuthWrapper
            stepName={CONST.TWO_FACTOR_AUTH_STEPS.ENABLED}
            title={translate('twoFactorAuth.headerTitle')}
            shouldEnableKeyboardAvoidingView={false}
        >
            <ScrollView>
                <Section
                    title={translate('twoFactorAuth.twoFactorAuthEnabled')}
                    icon={ShieldYellow}
                    containerStyles={[styles.twoFactorAuthSection, styles.mb0]}
                >
                    <View style={styles.mv3}>
                        <Text style={styles.textLabel}>{translate('twoFactorAuth.whatIsTwoFactorAuth')}</Text>
                    </View>
                </Section>
                <MenuItem
                    title={translate('twoFactorAuth.disableTwoFactorAuth')}
                    onPress={() => {
                        if (hasPolicyWithXeroConnection(adminPolicies)) {
                            setIsVisible(true);
                            return;
                        }
                        Navigation.navigate(ROUTES.SETTINGS_2FA_DISABLE);
                    }}
                    icon={Expensicons.Close}
                    iconFill={theme.danger}
                />
                <ConfirmModal
                    title={translate('twoFactorAuth.twoFactorAuthCannotDisable')}
                    prompt={translate('twoFactorAuth.twoFactorAuthRequired')}
                    confirmText={translate('common.buttonConfirm')}
                    onConfirm={closeModal}
                    shouldShowCancelButton={false}
                    onBackdropPress={closeModal}
                    onCancel={closeModal}
                    isVisible={isVisible}
                />
            </ScrollView>
        </TwoFactorAuthWrapper>
    );
}

export default EnabledPage;
