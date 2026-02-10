import {isUserValidatedSelector} from '@selectors/Account';
import React, {useCallback, useContext, useMemo} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import {DelegateNoAccessContext} from '@components/DelegateNoAccessModalProvider';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {LockedAccountContext} from '@components/LockedAccountModalProvider';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getContactMethodsOptions} from '@libs/UserUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ContactMethodsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.PROFILE.CONTACT_METHODS>;

function ContactMethodsPage({route}: ContactMethodsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST, {canBeMissing: false});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const navigateBackTo = route?.params?.backTo;

    const {isActingAsDelegate, showDelegateNoAccessModal} = useContext(DelegateNoAccessContext);
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector, canBeMissing: false});
    const {isAccountLocked, showLockedAccountModal} = useContext(LockedAccountContext);

    const options = useMemo(() => getContactMethodsOptions(translate, loginList, session?.email), [translate, loginList, session?.email]);

    const onNewContactMethodButtonPress = useCallback(() => {
        if (isActingAsDelegate) {
            showDelegateNoAccessModal();
            return;
        }
        if (isAccountLocked) {
            showLockedAccountModal();
            return;
        }

        if (!isUserValidated) {
            Navigation.navigate(
                ROUTES.SETTINGS_CONTACT_METHOD_VERIFY_ACCOUNT.getRoute(Navigation.getActiveRoute(), ROUTES.SETTINGS_NEW_CONTACT_METHOD_CONFIRM_MAGIC_CODE.getRoute(navigateBackTo)),
            );
            return;
        }
        Navigation.navigate(ROUTES.SETTINGS_NEW_CONTACT_METHOD_CONFIRM_MAGIC_CODE.getRoute(navigateBackTo));
    }, [navigateBackTo, isActingAsDelegate, showDelegateNoAccessModal, isAccountLocked, isUserValidated, showLockedAccountModal]);

    return (
        <ScreenWrapper
            shouldEnableKeyboardAvoidingView={false}
            testID="ContactMethodsPage"
        >
            <HeaderWithBackButton
                title={translate('contacts.contactMethods')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <ScrollView contentContainerStyle={styles.flexGrow1}>
                <View style={[styles.ph5, styles.mv3, styles.flexRow, styles.flexWrap]}>
                    <RenderHTML html={translate('contacts.helpText', {email: CONST.EMAIL.RECEIPTS})} />
                </View>
                {options.map(
                    (option) =>
                        !!option && (
                            <OfflineWithFeedback
                                pendingAction={option.pendingAction}
                                key={option.partnerUserID}
                            >
                                <MenuItem
                                    title={option.menuItemTitle}
                                    description={option.description}
                                    onPress={() => Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHOD_DETAILS.getRoute(option.partnerUserID, navigateBackTo))}
                                    brickRoadIndicator={option.indicator}
                                    shouldShowBasicTitle
                                    shouldShowRightIcon
                                    disabled={!!option.pendingAction}
                                />
                            </OfflineWithFeedback>
                        ),
                )}
                <FixedFooter style={[styles.mtAuto, styles.pt5]}>
                    <Button
                        large
                        success
                        text={translate('contacts.newContactMethod')}
                        onPress={onNewContactMethodButtonPress}
                        pressOnEnter
                    />
                </FixedFooter>
            </ScrollView>
        </ScreenWrapper>
    );
}

export default ContactMethodsPage;
