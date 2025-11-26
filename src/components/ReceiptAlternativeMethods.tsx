import React from 'react';
import {View} from 'react-native';
import type {LayoutChangeEvent} from 'react-native';
import useEnvironment from '@hooks/useEnvironment';
import useHasLoggedIntoMobileApp from '@hooks/useHasLoggedIntoMobileApp';
import useHasPhoneNumberLogin from '@hooks/useHasPhoneNumberLogin';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import {addLeadingForwardSlash} from '@src/libs/Url';
import ROUTES from '@src/ROUTES';
import Icon from './Icon';
// eslint-disable-next-line no-restricted-imports
import {ChatBubbles, Mail} from './Icon/Expensicons';
import RenderHTML from './RenderHTML';
import Text from './Text';

type ReceiptAlternativeMethodsProps = {
    onLayout?: (event: LayoutChangeEvent) => void;
};

function ReceiptAlternativeMethods({onLayout}: ReceiptAlternativeMethodsProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Download'] as const);
    const styles = useThemeStyles();
    const theme = useTheme();
    const {environmentURL} = useEnvironment();
    const {translate} = useLocalize();
    const {hasLoggedIntoMobileApp, isLastMobileAppLoginLoaded} = useHasLoggedIntoMobileApp();
    const {hasPhoneNumberLogin, isPhoneNumberLoaded} = useHasPhoneNumberLogin();

    const downloadAppHref = `${environmentURL}${addLeadingForwardSlash(ROUTES.SETTINGS_APP_DOWNLOAD_LINKS)}`;
    const contactMethodsHref = `${environmentURL}${addLeadingForwardSlash(ROUTES.SETTINGS_CONTACT_METHODS.route)}`;

    if (!isLastMobileAppLoginLoaded || !isPhoneNumberLoaded) {
        return null;
    }

    return (
        <View
            style={[styles.mt6, styles.mh5, styles.alignSelfStart, styles.alignItemsBaseline]}
            onLayout={onLayout}
        >
            <Text style={[styles.textMicroSupporting, styles.mb3]}>{translate('receipt.alternativeMethodsTitle')}</Text>

            {!hasLoggedIntoMobileApp && (
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mb3]}>
                    <View style={[styles.mr3]}>
                        <Icon
                            src={icons.Download}
                            width={16}
                            height={16}
                            fill={theme.icon}
                        />
                    </View>
                    <View style={[styles.flex1]}>
                        <RenderHTML html={translate('receipt.alternativeMethodsDownloadApp', {downloadUrl: downloadAppHref})} />
                    </View>
                </View>
            )}

            <View style={[styles.flexRow, styles.alignItemsCenter, styles.mb3]}>
                <View style={[styles.mr3]}>
                    <Icon
                        src={Mail}
                        width={16}
                        height={16}
                        fill={theme.icon}
                    />
                </View>
                <View style={[styles.flex1]}>
                    <RenderHTML html={translate('receipt.alternativeMethodsForwardReceipts', {email: CONST.EMAIL.RECEIPTS})} />
                </View>
            </View>

            {!hasPhoneNumberLogin && (
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mb0]}>
                    <View style={[styles.mr3]}>
                        <Icon
                            src={ChatBubbles}
                            width={16}
                            height={16}
                            fill={theme.icon}
                        />
                    </View>
                    <View style={[styles.flex1]}>
                        <RenderHTML html={translate('receipt.alternativeMethodsAddPhoneNumber', {phoneNumber: CONST.SMS.RECEIPTS_PHONE_NUMBER, contactMethodsUrl: contactMethodsHref})} />
                    </View>
                </View>
            )}

            {hasPhoneNumberLogin && (
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mb0]}>
                    <View style={[styles.mr3]}>
                        <Icon
                            src={ChatBubbles}
                            width={16}
                            height={16}
                            fill={theme.icon}
                        />
                    </View>
                    <View style={[styles.flex1]}>
                        <RenderHTML html={translate('receipt.alternativeMethodsTextReceipts', {phoneNumber: CONST.SMS.RECEIPTS_PHONE_NUMBER})} />
                    </View>
                </View>
            )}
        </View>
    );
}

ReceiptAlternativeMethods.displayName = 'ReceiptAlternativeMethods';

export default ReceiptAlternativeMethods;
