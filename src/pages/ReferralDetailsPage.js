import React from 'react';
import _ from 'underscore';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Navigation from '@libs/Navigation/Navigation';
import useLocalize from '@hooks/useLocalize';
import ScreenWrapper from '@components/ScreenWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Text from '@components/Text';
import {PaymentHands} from '@components/Icon/Illustrations';
import CONST from '@src/CONST';
import TextLink from '@components/TextLink';
import styles from '@styles/styles';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import Icon from '@components/Icon';
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
                title="Referral"
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
                    text="Got it"
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
