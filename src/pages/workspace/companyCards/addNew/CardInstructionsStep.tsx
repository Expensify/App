import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CompanyCards from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type CardInstructionsStepProps = {
    // ID of the policy that the card will be issued under
    policyID: string;
};

function CardInstructionsStep({policyID}: CardInstructionsStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    const [issueNewCard] = useOnyx(ONYXKEYS.ISSUE_NEW_EXPENSIFY_CARD);

    const data = issueNewCard?.data;

    const submit = () => {
        CompanyCards.setAddNewCompanyCardStepAndData({step: CONST.EXPENSIFY_CARD.STEP.CARD_NAME});
    };

    const handleBackButtonPress = () => {
        CompanyCards.setAddNewCompanyCardStepAndData({step: CONST.EXPENSIFY_CARD.STEP.CARD_TYPE});
    };

    return (
        <ScreenWrapper
            testID={CardInstructionsStep.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('workspace.companyCards.addCardFeed')}
                onBackButtonPress={handleBackButtonPress}
            />
            <ScrollView
                style={styles.pt0}
                contentContainerStyle={styles.flexGrow1}
            >
                <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.card.issueNewCard.letsDoubleCheck')}</Text>
                <Text style={[styles.textSupporting, styles.ph5, styles.mv3]}>{translate('workspace.card.issueNewCard.willBeReady')}</Text>

                <View style={[styles.mh5, styles.pb5, styles.mt3, styles.flexGrow1, styles.justifyContentEnd]}>
                    <Button
                        isDisabled={isOffline}
                        success
                        large
                        style={[styles.w100]}
                        onPress={submit}
                        text={translate('common.next')}
                    />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

CardInstructionsStep.displayName = 'CardInstructionsStep';

export default CardInstructionsStep;
