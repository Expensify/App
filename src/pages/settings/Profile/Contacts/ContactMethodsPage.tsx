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
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {getContactMethodsOptions} from '@libs/UserUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

function ContactMethodsPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const [session] = useOnyx(ONYXKEYS.SESSION);

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
            Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHOD_VERIFY_ACCOUNT.getRoute(Navigation.getActiveRoute(), createDynamicRoute(DYNAMIC_ROUTES.SETTINGS_NEW_CONTACT_METHOD_CONFIRM_MAGIC_CODE.path)));
            return;
        }
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.SETTINGS_NEW_CONTACT_METHOD_CONFIRM_MAGIC_CODE.path));
    }, [isActingAsDelegate, showDelegateNoAccessModal, isAccountLocked, isUserValidated, showLockedAccountModal]);

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
                                    onPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.SETTINGS_CONTACT_METHOD_DETAILS.getRoute(option.partnerUserID)))}
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
