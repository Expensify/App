import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import Button from '@components/Button';
import CopyTextToClipboard from '@components/CopyTextToClipboard';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import {PaymentHands} from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import styles from '@styles/styles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const propTypes = {
    /** Navigation route context info provided by react navigation */
    route: PropTypes.shape({
        params: PropTypes.shape({
            /** The type of the content from where CTA was called */
            contentType: PropTypes.string,
        }),
    }).isRequired,

    /** The details about the account that the user is signing in with */
    account: PropTypes.shape({
        /** The primaryLogin associated with the account */
        primaryLogin: PropTypes.string,
    }),
};

const defaultProps = {
    account: null,
};

function ReferralDetailsPage({route, account}) {
    const {translate} = useLocalize();
    let {contentType} = route.params;

    if (!_.includes(_.values(CONST.REFERRAL_PROGRAM.CONTENT_TYPES), contentType)) {
        contentType = CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND;
    }

    const contentHeader = translate(`referralProgram.${contentType}.header`);
    const contentBody = translate(`referralProgram.${contentType}.body1`);
    const isShareCode = contentType === CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE;
    const shouldShowBody2 = isShareCode;
    const shouldShowClipboard = contentType === CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND || isShareCode;

    function generateReferralURL(email) {
        return `${CONST.REFERRAL_PROGRAM.LINK}/?thanks=${encodeURIComponent(email)}`;
    }

    function getFallbackRoute() {
        const fallbackRoutes = {
            [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.MONEY_REQUEST]: ROUTES.MONEY_REQUEST_PARTICIPANTS.getRoute(CONST.IOU.TYPE.REQUEST),
            [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SEND_MONEY]: ROUTES.MONEY_REQUEST_PARTICIPANTS.getRoute(CONST.IOU.TYPE.SEND),
            [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: ROUTES.NEW_CHAT,
            [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: ROUTES.SEARCH,
        };

        return fallbackRoutes[contentType];
    }

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={ReferralDetailsPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('common.referral')}
                onBackButtonPress={() => Navigation.goBack(getFallbackRoute())}
            />
            <View style={[styles.justifyContentCenter, styles.alignItemsCenter, styles.ph5, styles.flex1]}>
                <Icon
                    src={PaymentHands}
                    width={178}
                    height={232}
                />
                <Text style={[styles.textHeadline, styles.textAlignCenter, styles.mb3, styles.mt8]}>{contentHeader}</Text>
                <Text style={[styles.textAlignCenter, styles.inlineSystemMessage, styles.mb6]}>{contentBody}</Text>
                {shouldShowClipboard && (
                    <View style={[styles.border, styles.pv2, styles.ph3, styles.mb6]}>
                        <CopyTextToClipboard
                            text={translate('referralProgram.copyReferralLink')}
                            textStyles={[styles.colorMuted]}
                            urlToCopy={generateReferralURL(account.primaryLogin)}
                        />
                    </View>
                )}
                {shouldShowBody2 && (
                    <Text style={[styles.textAlignCenter, styles.inlineSystemMessage, styles.mb6]}>
                        {translate(`referralProgram.${CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE}.body2`)}
                    </Text>
                )}
                <TextLink href={CONST.REFERRAL_PROGRAM.LEARN_MORE_LINK}>{translate('requestorStep.learnMore')}</TextLink>
            </View>
            <FixedFooter>
                <Button
                    success
                    style={[styles.w100]}
                    text={translate('common.buttonConfirm')}
                    onPress={() => Navigation.goBack(getFallbackRoute())}
                    pressOnEnter
                    enterKeyEventListenerPriority={1}
                />
            </FixedFooter>
        </ScreenWrapper>
    );
}

ReferralDetailsPage.displayName = 'ReferralDetailsPage';
ReferralDetailsPage.propTypes = propTypes;
ReferralDetailsPage.defaultProps = defaultProps;

export default withOnyx({
    account: {key: ONYXKEYS.ACCOUNT},
})(ReferralDetailsPage);
