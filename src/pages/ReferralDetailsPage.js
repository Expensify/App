import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import Button from '@components/Button';
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
import NotFoundPage from './ErrorPage/NotFoundPage';

const propTypes = {
    /** Navigation route context info provided by react navigation */
    route: PropTypes.shape({
        params: PropTypes.shape({
            /** The type of the content from where CTA was called */
            contentType: PropTypes.string,
        }),
    }).isRequired,
};

function ReferralDetailsPage({route}) {
    const {translate} = useLocalize();
    const {contentType} = route.params;

    if (!_.includes(_.values(CONST.REFERRAL_PROGRAM.CONTENT_TYPES), contentType)) {
        return <NotFoundPage />;
    }
    const contentHeader = translate(`referralProgram.${contentType}.header`);
    const contentBody = translate(`referralProgram.${contentType}.body`);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={ReferralDetailsPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('common.referral')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <View style={[styles.justifyContentCenter, styles.alignItemsCenter, styles.ph5, styles.flex1]}>
                <Icon
                    src={PaymentHands}
                    width={178}
                    height={232}
                />
                <Text style={[styles.textHeadline, styles.mb3, styles.mt8]}>{contentHeader}</Text>
                <Text style={[styles.textAlignCenter, styles.inlineSystemMessage, styles.mb5]}>{contentBody}</Text>
                <TextLink href={CONST.REFERRAL_PROGRAM.LINK}>{translate('requestorStep.learnMore')}</TextLink>
            </View>
            <FixedFooter>
                <Button
                    success
                    style={[styles.w100]}
                    text={translate('common.buttonConfirm')}
                    onPress={() => Navigation.goBack()}
                    pressOnEnter
                    enterKeyEventListenerPriority={1}
                />
            </FixedFooter>
        </ScreenWrapper>
    );
}

ReferralDetailsPage.displayName = 'ReferralDetailsPage';
ReferralDetailsPage.propTypes = propTypes;

export default ReferralDetailsPage;
