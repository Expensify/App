import type {StackScreenProps} from '@react-navigation/stack';
import {Str} from 'expensify-common';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import CopyTextToClipboard from '@components/CopyTextToClipboard';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as User from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {LoginList, Session} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type ContactMethodsPageOnyxProps = {
    /** Login list for the user that is signed in */
    loginList: OnyxEntry<LoginList>;

    /** Current user session */
    session: OnyxEntry<Session>;
};

type ContactMethodsPageProps = ContactMethodsPageOnyxProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.PROFILE.CONTACT_METHODS>;

function ContactMethodsPage({route}: ContactMethodsPageProps) {
    const styles = useThemeStyles();
    const {formatPhoneNumber, translate} = useLocalize();
    const [loginList] = useOnyx(`${ONYXKEYS.LOGIN_LIST}`);
    const [session] = useOnyx(`${ONYXKEYS.SESSION}`);

    const loginNames = Object.keys(loginList ?? {});
    const navigateBackTo = route?.params?.backTo;

    // Sort the login names by placing the one corresponding to the default contact method as the first item before displaying the contact methods.
    // The default contact method is determined by checking against the session email (the current login).
    const sortedLoginNames = loginNames.sort((loginName) => (loginList?.[loginName].partnerUserID === session?.email ? -1 : 1));

    const loginMenuItems = sortedLoginNames.map((loginName) => {
        const login = loginList?.[loginName];
        const pendingAction = login?.pendingFields?.deletedLogin ?? login?.pendingFields?.addedLogin ?? undefined;
        if (!login?.partnerUserID && !pendingAction) {
            return null;
        }

        let description = '';
        if (session?.email === login?.partnerUserID) {
            description = translate('contacts.getInTouch');
        } else if (login?.errorFields?.addedLogin) {
            description = translate('contacts.failedNewContact');
        } else if (!login?.validatedDate) {
            description = translate('contacts.pleaseVerify');
        }
        let indicator;
        if (Object.values(login?.errorFields ?? {}).some((errorField) => !isEmptyObject(errorField))) {
            indicator = CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
        } else if (!login?.validatedDate) {
            indicator = CONST.BRICK_ROAD_INDICATOR_STATUS.INFO;
        }

        // Default to using login key if we deleted login.partnerUserID optimistically
        // but still need to show the pending login being deleted while offline.
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const partnerUserID = login?.partnerUserID || loginName;
        const menuItemTitle = Str.isSMSLogin(partnerUserID) ? formatPhoneNumber(partnerUserID) : partnerUserID;

        const NavigateToContactMethodDetails = () => {
            if (!login?.validatedDate && !login?.validateCodeSent) {
                User.requestContactMethodValidateCode(loginName);
            }
            Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHOD_DETAILS.getRoute(partnerUserID, navigateBackTo));
        };

        return (
            <OfflineWithFeedback
                pendingAction={pendingAction}
                key={partnerUserID}
            >
                <MenuItem
                    title={menuItemTitle}
                    description={description}
                    onPress={NavigateToContactMethodDetails}
                    brickRoadIndicator={indicator}
                    shouldShowBasicTitle
                    shouldShowRightIcon
                    disabled={!!pendingAction}
                />
            </OfflineWithFeedback>
        );
    });

    const onNewContactMethodButtonPress = useCallback(() => {
        Navigation.navigate(ROUTES.SETTINGS_NEW_CONTACT_METHOD.getRoute(navigateBackTo));
    }, [navigateBackTo]);

    return (
        <ScreenWrapper
            shouldEnableKeyboardAvoidingView={false}
            testID={ContactMethodsPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('contacts.contactMethods')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <ScrollView contentContainerStyle={styles.flexGrow1}>
                <View style={[styles.ph5, styles.mv3, styles.flexRow, styles.flexWrap]}>
                    <Text>
                        {translate('contacts.helpTextBeforeEmail')}
                        <CopyTextToClipboard
                            text={CONST.EMAIL.RECEIPTS}
                            textStyles={[styles.textBlue]}
                        />
                        <Text>{translate('contacts.helpTextAfterEmail')}</Text>
                    </Text>
                </View>
                {loginMenuItems}
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

ContactMethodsPage.displayName = 'ContactMethodsPage';

export default ContactMethodsPage;
