import Icon from '@components/Icon';
import {loadIllustration} from '@components/Icon/IllustrationLoader';
import type {IllustrationName} from '@components/Icon/IllustrationLoader';
import MenuItem from '@components/MenuItem';
import MenuItemAction from '@components/MenuItem/presets/MenuItemAction';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';

import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyAsset, useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import {callIfAuthenticated} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import {createHasAdminPolicyWithXeroConnectionSelector} from '@selectors/Policy';
import {authTokenTypeSelector} from '@selectors/Session';
import React from 'react';
import {View} from 'react-native';

import TwoFactorAuthWrapper from './TwoFactorAuthWrapper';

function EnabledPage() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['Close', 'Sync']);

    const {asset: ShieldYellow} = useMemoizedLazyAsset(() => loadIllustration('ShieldYellow' as IllustrationName));
    const {login} = useCurrentUserPersonalDetails();
    const [hasAdminPolicyWithXeroConnection] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: createHasAdminPolicyWithXeroConnectionSelector(login)});
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const showTwoFactorAuthRequireModal = () => {
        return showConfirmModal({
            title: translate('twoFactorAuth.twoFactorAuthCannotDisable'),
            prompt: translate('twoFactorAuth.twoFactorAuthRequired'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    };

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
                <MenuItemAction
                    sentryLabel={CONST.SENTRY_LABEL.TWO_FACTOR_AUTH.REPLACE_DEVICE}
                    title={translate('twoFactorAuth.replaceDevice')}
                    onPress={() => Navigation.navigate(ROUTES.SETTINGS_2FA_REPLACE_VERIFY_OLD)}
                    icon={icons.Sync}
                />
                <MenuItem.Root
                    sentryLabel={CONST.SENTRY_LABEL.TWO_FACTOR_AUTH.DISABLE}
                    onPress={callIfAuthenticated(() => {
                        if (hasAdminPolicyWithXeroConnection) {
                            showTwoFactorAuthRequireModal();
                            return;
                        }
                        Navigation.navigate(ROUTES.SETTINGS_2FA_DISABLE);
                    }, session)}
                >
                    <MenuItem.Row>
                        <MenuItem.Leading>
                            <Icon
                                src={icons.Close}
                                fill={theme.danger}
                                additionalStyles={styles.popoverMenuIcon}
                            />
                        </MenuItem.Leading>
                        <MenuItem.Content>
                            <MenuItem.Title>{translate('twoFactorAuth.disableTwoFactorAuth')}</MenuItem.Title>
                        </MenuItem.Content>
                    </MenuItem.Row>
                </MenuItem.Root>
            </ScrollView>
        </TwoFactorAuthWrapper>
    );
}

export default EnabledPage;
