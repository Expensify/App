import {isUserValidatedSelector} from '@selectors/Account';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useLockedAccountActions, useLockedAccountState} from '@components/LockedAccountModalProvider';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithDelayToggle from '@components/Pressable/PressableWithDelayToggle';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Clipboard from '@libs/Clipboard';
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
    const icons = useMemoizedLazyExpensifyIcons(['Copy'] as const);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const navigateBackTo = route?.params?.backTo;

    const {isActingAsDelegate} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector});
    const {isAccountLocked} = useLockedAccountState();
    const {showLockedAccountModal} = useLockedAccountActions();

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
                <View style={[styles.ph5, styles.mv3]}>
                    <Text style={styles.textLabelSupporting}>{translate('contacts.helpText')}</Text>
                    <View style={[styles.mt4, styles.flexRow, styles.flexWrap, styles.alignItemsCenter, styles.gap1]}>
                        <Text style={styles.textLabelSupporting}>{translate('contacts.helpTextBeforeEmail')}</Text>
                        <PressableWithDelayToggle
                            text={CONST.EMAIL.RECEIPTS}
                            tooltipText=""
                            tooltipTextChecked=""
                            accessibilityLabel={translate('contacts.copyEmailAddress', {email: CONST.EMAIL.RECEIPTS})}
                            icon={icons.Copy}
                            inline={false}
                            onPress={() => Clipboard.setString(CONST.EMAIL.RECEIPTS)}
                            styles={styles.flexShrink1}
                            textStyles={[styles.textLabelSupporting, styles.link, styles.flexShrink1]}
                            sentryLabel={CONST.SENTRY_LABEL.COPY_TEXT_TO_CLIPBOARD.COPY_BUTTON}
                        />
                        <Text style={styles.textLabelSupporting}>{translate('contacts.helpTextAfterEmail', {phoneNumber: CONST.SMS.RECEIPTS_PHONE_NUMBER})}</Text>
                    </View>
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
