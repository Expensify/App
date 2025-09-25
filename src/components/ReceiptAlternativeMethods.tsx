import React from 'react';
import {View} from 'react-native';
import type {LayoutChangeEvent} from 'react-native';
import Icon from '@components/Icon';
import {ChatBubble, Download, Mail} from '@components/Icon/Expensicons';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useEnvironment from '@hooks/useEnvironment';
import useHasLoggedIntoMobileApp from '@hooks/useHasLoggedIntoMobileApp';
import useHasPhoneNumber from '@hooks/useHasPhoneNumber';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import {addLeadingForwardSlash} from '@src/libs/Url';

type ReceiptAlternativeMethodsProps = {
    onLayout?: (event: LayoutChangeEvent) => void;
};

function ReceiptAlternativeMethods({onLayout}: ReceiptAlternativeMethodsProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {environmentURL} = useEnvironment();
    const {translate} = useLocalize();
    const {hasLoggedIntoMobileApp, isLastMobileAppLoginLoaded} = useHasLoggedIntoMobileApp();
    const {hasPhoneNumber, isLoaded: isPhoneNumberLoaded} = useHasPhoneNumber();

    const downloadAppHref = `${environmentURL}${addLeadingForwardSlash(ROUTES.SETTINGS_APP_DOWNLOAD_LINKS)}`;
    const contactMethodsHref = `${environmentURL}${addLeadingForwardSlash(ROUTES.SETTINGS_CONTACT_METHODS.route)}`;
    const receiptsMailto = `mailto:${CONST.EMAIL.RECEIPTS}`;

    if (!isLastMobileAppLoginLoaded || !isPhoneNumberLoaded) {
        return null;
    }

    const shouldShowDownloadApp = !hasLoggedIntoMobileApp;
    const shouldShowAddPhoneNumber = !hasPhoneNumber;
    const shouldShowTextReceipts = hasPhoneNumber;

    return (
        <View
            style={[styles.mt4, styles.ph4]}
            onLayout={onLayout}
        >
            <Text style={[styles.textLabelSupporting, styles.mb3]}>
                {translate('receipt.alternativeMethodsTitle')}
            </Text>

            {shouldShowDownloadApp && (
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mb3]}>
                    <View style={[styles.mr3]}>
                        <Icon
                            src={Download}
                            width={20}
                            height={20}
                            fill={theme.textSupporting}
                        />
                    </View>
                    <TextLink
                        href={downloadAppHref}
                        style={[styles.textLabelSupporting, styles.textBlue, styles.flex1]}
                    >
                        {translate('receipt.alternativeMethodsDownloadApp')}
                    </TextLink>
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
                    <Text style={[styles.textLabelSupporting]}>
                        {translate('receipt.alternativeMethodsForwardReceipts')}
                        {' '}
                        <TextLink
                            href={receiptsMailto}
                            style={[styles.textLabelSupporting, styles.textBlue]}
                        >
                            {CONST.EMAIL.RECEIPTS}
                        </TextLink>
                    </Text>
                </View>
            </View>

            {shouldShowAddPhoneNumber && (
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mb0]}>
                    <View style={[styles.mr3]}>
                        <Icon
                            src={ChatBubble}
                            width={20}
                            height={20}
                            fill={theme.textSupporting}
                        />
                    </View>
                    <Text style={[styles.textLabelSupporting, styles.flex1]}>
                        <TextLink
                            href={contactMethodsHref}
                            style={[styles.textLabelSupporting, styles.textBlue]}
                        >
                            {translate('receipt.alternativeMethodsAddPhoneNumberLink')}
                        </TextLink>
                        {translate('receipt.alternativeMethodsAddPhoneNumberSuffix', {phoneNumber: CONST.SMS.RECEIPTS_PHONE_NUMBER})}
                    </Text>
                </View>
            )}

            {shouldShowTextReceipts && (
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mb0]}>
                    <View style={[styles.mr3]}>
                        <Icon
                            src={ChatBubble}
                            width={20}
                            height={20}
                            fill={theme.textSupporting}
                        />
                    </View>
                    <Text style={[styles.textLabelSupporting, styles.flex1]}>
                        {translate('receipt.alternativeMethodsTextReceipts', {phoneNumber: CONST.SMS.RECEIPTS_PHONE_NUMBER})}
                    </Text>
                </View>
            )}
        </View>
    );
}

export default ReceiptAlternativeMethods;
