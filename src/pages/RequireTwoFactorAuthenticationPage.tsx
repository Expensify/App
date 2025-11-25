import {isUserValidatedSelector} from '@selectors/Account';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import Button from '@components/Button';
import Icon from '@components/Icon';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {emailSelector} from '@src/selectors/Session';
import type {Policy} from '@src/types/onyx';

/**
 * Checks if the 2FA is required because of Xero.
 * - User is an admin of a workspace
 * - Xero connection is enabled in the workspace
 */
const is2FARequiredBecauseOfXeroSelector = (email?: string) => {
    return (workspaces: OnyxCollection<Policy>) => {
        return Object.values(workspaces ?? {})?.some((workspace) => {
            const isXeroConnectionEnabled = workspace?.connections?.xero;
            const isAdmin = email && workspace?.employeeList?.[email]?.role === CONST.POLICY.ROLE.ADMIN;
            return !!isXeroConnectionEnabled && !!isAdmin;
        });
    };
};

function RequireTwoFactorAuthenticationPage() {
    const illustrations = useMemoizedLazyIllustrations(['Encryption'] as const);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isUserValidated = false] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector, canBeMissing: true});
    const [email] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector, canBeMissing: true});
    const [is2FARequiredBecauseOfXero = false] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: is2FARequiredBecauseOfXeroSelector(email), canBeMissing: true});

    const handleOnPress = useCallback(() => {
        if (isUserValidated) {
            Navigation.navigate(ROUTES.SETTINGS_2FA_ROOT.getRoute(ROUTES.REQUIRE_TWO_FACTOR_AUTH));
            return;
        }
        Navigation.navigate(ROUTES.SETTINGS_2FA_VERIFY_ACCOUNT.getRoute({backTo: ROUTES.REQUIRE_TWO_FACTOR_AUTH, forwardTo: ROUTES.SETTINGS_2FA_ROOT.getRoute()}));
    }, [isUserValidated]);

    return (
        <ScreenWrapper testID={RequireTwoFactorAuthenticationPage.displayName}>
            <View style={styles.twoFARequiredContainer}>
                <View style={[styles.twoFAIllustration, styles.alignItemsCenter]}>
                    <Icon
                        src={illustrations.Encryption}
                        width={variables.twoFAIconHeight}
                        height={variables.twoFAIconHeight}
                    />
                </View>
                <View style={[styles.mt2, styles.mh5, styles.dFlex, styles.alignItemsCenter]}>
                    <View style={styles.mb5}>
                        <Text style={[styles.textHeadlineH1, styles.textAlignCenter, styles.mv2]}>{translate('twoFactorAuth.twoFactorAuthIsRequiredForAdminsHeader')}</Text>
                        <Text style={[styles.textSupporting, styles.textAlignCenter]}>
                            {translate(is2FARequiredBecauseOfXero ? 'twoFactorAuth.twoFactorAuthIsRequiredXero' : 'twoFactorAuth.twoFactorAuthIsRequiredCompany')}
                        </Text>
                    </View>
                    <Button
                        large
                        success
                        pressOnEnter
                        onPress={handleOnPress}
                        text={translate('twoFactorAuth.enableTwoFactorAuth')}
                    />
                </View>
            </View>
        </ScreenWrapper>
    );
}

RequireTwoFactorAuthenticationPage.displayName = 'RequireTwoFactorAuthenticationPage';

export default RequireTwoFactorAuthenticationPage;
