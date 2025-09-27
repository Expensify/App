import React from 'react';
import {View} from 'react-native';
import type {LayoutChangeEvent} from 'react-native';
import useEnvironment from '@hooks/useEnvironment';
import useHasLoggedIntoMobileApp from '@hooks/useHasLoggedIntoMobileApp';
import useHasPhoneNumberLogin from '@hooks/useHasPhoneNumberLogin';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import {addLeadingForwardSlash} from '@src/libs/Url';
import ROUTES from '@src/ROUTES';
import Icon from './Icon';
import {ChatBubble, Download, Mail} from './Icon/Expensicons';
import RenderHTML from './RenderHTML';
import Text from './Text';
import TextLink from './TextLink';

type ReceiptAlternativeMethodsProps = {
    onLayout?: (event: LayoutChangeEvent) => void;
};

function ReceiptAlternativeMethods({onLayout}: ReceiptAlternativeMethodsProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {environmentURL} = useEnvironment();
    const {translate} = useLocalize();
    const {hasLoggedIntoMobileApp, isLastMobileAppLoginLoaded} = useHasLoggedIntoMobileApp();
    const {hasPhoneNumberLogin, isLoaded: isPhoneNumberLoaded} = useHasPhoneNumberLogin();

    const downloadAppHref = `${environmentURL}${addLeadingForwardSlash(ROUTES.SETTINGS_APP_DOWNLOAD_LINKS)}`;
    const contactMethodsHref = `${environmentURL}${addLeadingForwardSlash(ROUTES.SETTINGS_CONTACT_METHODS.route)}`;
    const receiptsMailto = `mailto:${CONST.EMAIL.RECEIPTS}`;

    if (!isLastMobileAppLoginLoaded || !isPhoneNumberLoaded) {
        return null;
    }

    return (
        <View
            style={[styles.mt4, styles.ph4]}
            onLayout={onLayout}
        >
            <Text style={[styles.textLabelSupporting, styles.mb3]}>{translate('receipt.alternativeMethodsTitle')}</Text>

            {!hasLoggedIntoMobileApp && (
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mb3]}>
                    <View style={[styles.mr3]}>
                        <Icon
                            src={Download}
                            width={20}
                            height={20}
                            fill={theme.textSupporting}
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
                        width={20}
                        height={20}
                        fill={theme.textSupporting}
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
                            src={ChatBubble}
                            width={20}
                            height={20}
                            fill={theme.textSupporting}
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
                            src={ChatBubble}
                            width={20}
                            height={20}
                            fill={theme.textSupporting}
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

export default ReceiptAlternativeMethods;
