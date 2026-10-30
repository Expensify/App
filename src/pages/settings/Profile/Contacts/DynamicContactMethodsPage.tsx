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
import {expensifyLoginsSelector, getContactMethodsOptions, getLoginKey, integrationServerLoginsSelector} from '@libs/UserUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import {isUserValidatedSelector} from '@selectors/Account';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';

function DynamicContactMethodsPage() {
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const [loginList] = useOnyx(ONYXKEYS.LOGINS, {selector: expensifyLoginsSelector});
    const [integrationServerLogins] = useOnyx(ONYXKEYS.LOGINS, {selector: integrationServerLoginsSelector});
    const [session] = useOnyx(ONYXKEYS.SESSION);

    const {isActingAsDelegate} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector});
    const {isAccountLocked} = useLockedAccountState();
    const {showLockedAccountModal} = useLockedAccountActions();

    const options = useMemo(() => getContactMethodsOptions(translate, formatPhoneNumber, loginList, session?.email), [translate, formatPhoneNumber, loginList, session?.email]);

    const addNewContactMethod = useCallback(() => {
        if (isActingAsDelegate) {
            showDelegateNoAccessModal();
            return;
        }
        if (isAccountLocked) {
            showLockedAccountModal();
            return;
        }

        if (!isUserValidated) {
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.VERIFY_ACCOUNT.path));
            return;
        }
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.NEW_CONTACT_METHOD_CONFIRM_VALIDATE_CODE.path));
    }, [isActingAsDelegate, showDelegateNoAccessModal, isAccountLocked, isUserValidated, showLockedAccountModal]);

    return (
        <ScreenWrapper
            shouldEnableKeyboardAvoidingView={false}
            testID="DynamicContactMethodsPage"
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
                                    onPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.CONTACT_METHOD_DETAILS.getRoute(option.partnerUserID)))}
                                    brickRoadIndicator={option.indicator}
                                    shouldShowBasicTitle
                                    shouldShowRightIcon
                                    disabled={!!option.pendingAction}
                                />
                            </OfflineWithFeedback>
                        ),
                )}
                {!!integrationServerLogins && integrationServerLogins.length > 0 && <View style={styles.dividerLine} />}
                {integrationServerLogins?.map((login) => (
                    <OfflineWithFeedback
                        pendingAction={login.pendingAction}
                        key={getLoginKey(login)}
                    >
                        <MenuItem.Root
                            onPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.CONTACT_METHOD_DETAILS.getRoute(login.partnerUserID)))}
                            isDisabled={!!login.pendingAction}
                            accessibilityLabel={[translate('contacts.integrationServerLogin.title'), login.partnerUserID, translate('contacts.integrationServerLogin.description')].join(
                                ', ',
                            )}
                        >
                            <MenuItem.Row>
                                <MenuItem.Content>
                                    <MenuItem.Label>{translate('contacts.integrationServerLogin.title')}</MenuItem.Label>
                                    <MenuItem.FieldValue>{login.partnerUserID}</MenuItem.FieldValue>
                                    <MenuItem.Description>{translate('contacts.integrationServerLogin.description')}</MenuItem.Description>
                                </MenuItem.Content>
                                <MenuItem.Trailing>
                                    {!!login.errorFields?.revoke && <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />}
                                    <MenuItem.Chevron />
                                </MenuItem.Trailing>
                            </MenuItem.Row>
                        </MenuItem.Root>
                    </OfflineWithFeedback>
                ))}
                <FixedFooter style={[styles.mtAuto, styles.pt5]}>
                    <Button
                        size={CONST.BUTTON_SIZE.LARGE}
                        variant={CONST.BUTTON_VARIANT.SUCCESS}
                        onPress={addNewContactMethod}
                    >
                        <Button.KeyboardShortcut />
                        <Button.Text>{translate('contacts.newContactMethod')}</Button.Text>
                    </Button>
                </FixedFooter>
            </ScrollView>
        </ScreenWrapper>
    );
}

export default DynamicContactMethodsPage;
