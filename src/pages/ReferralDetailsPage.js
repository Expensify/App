import React from 'react';
import _ from 'underscore';
import {View} from 'react-native';
import Navigation from '../libs/Navigation/Navigation';
import useLocalize from '../hooks/useLocalize';
import ScreenWrapper from '../components/ScreenWrapper';
import HeaderWithBackButton from '../components/HeaderWithBackButton';
import Text from '../components/Text';
import {PaymentHands} from '../components/Icon/Illustrations';
import CONST from '../CONST';
import TextLink from '../components/TextLink';
import styles from '../styles/styles';
import Button from '../components/Button';
import FixedFooter from '../components/FixedFooter';
import Icon from '../components/Icon';

function ReferralDetailsPage({route}) {
    // if (!CONST.REFERRAL_PROGRAM.CONTENT_TYPES.includes(contentType)) {
    //     return <Text>FUCK YOU</Text>;
    // }
    const {translate} = useLocalize();
    const {contentType} = route.params;
    const content = translate(`referralProgram.${contentType}`);

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
                <Text style={[styles.textHeadline, styles.mb3, styles.mt8]}>{content.header}</Text>
                <Text style={[styles.textAlignCenter, styles.inlineSystemMessage, styles.mb5]}>{content.body}</Text>
                <TextLink href={CONST.REFERRAL_PROGRAM}>{translate('requestorStep.learnMore')}</TextLink>
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

export default ReferralDetailsPage;
