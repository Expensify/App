import React from 'react';
import _ from 'underscore';
import {View} from 'react-native';
import Navigation from '../../libs/Navigation/Navigation';
import useLocalize from '../../hooks/useLocalize';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import Text from '../../components/Text';
import {PaymentHands} from '../../components/Icon/Illustrations';
import CONST from '../../CONST';
import TextLink from '../../components/TextLink';
import styles from '../../styles/styles';
import Button from '../../components/Button';
import FixedFooter from '../../components/FixedFooter';
import Icon from '../../components/Icon';

function RefferalDetailsPage({route}) {
    const {translate} = useLocalize();
    const {data} = route.params;
    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={RefferalDetailsPage.displayName}
        >
            <HeaderWithBackButton
                title="Refferal"
                onBackButtonPress={() => Navigation.goBack()}
            />
            <View style={[styles.justifyContentCenter, styles.alignItemsCenter, styles.ph5, styles.flex1]}>
                <Icon
                    src={PaymentHands}
                    width={178}
                    height={232}
                />
                <Text style={[styles.textHeadline, styles.mb3, styles.mt8]}>{data.modalHeader}</Text>
                <Text style={[styles.textAlignCenter, styles.inlineSystemMessage, styles.mb5]}>
                    {data.modalBody.description}
                    {data.modalBody.options.map((option) => (
                        <Text>{option}</Text>
                    ))}
                    {data.modalBody.additionalInformation}
                </Text>
                <TextLink href={CONST.REFFERAL_PROGRAM}>{translate('requestorStep.learnMore')}</TextLink>
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

RefferalDetailsPage.displayName = 'RefferalDetailsPage';

export default RefferalDetailsPage;
