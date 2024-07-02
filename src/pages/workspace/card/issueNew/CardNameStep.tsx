import React from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Card from '@userActions/Card';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function CardNameStep() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const submit = () => {
        // TODO: the logic will be created in https://github.com/Expensify/App/issues/44309
        Card.setIssueNewCardStep(CONST.EXPENSIFY_CARD.STEP.CONFIRMATION);
    };

    const handleBackButtonPress = () => {
        Card.setIssueNewCardStep(CONST.EXPENSIFY_CARD.STEP.LIMIT);
    };

    return (
        <ScreenWrapper
            testID={CardNameStep.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('workspace.card.issueCard')}
                onBackButtonPress={handleBackButtonPress}
            />
            <View style={[styles.ph5, styles.mb5, styles.mt3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    startStepIndex={4}
                    stepNames={CONST.EXPENSIFY_CARD.STEP_NAMES}
                />
            </View>
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.card.issueNewCard.giveItName')}</Text>
            <FormProvider
                formID={ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM}
                submitButtonText={translate('common.next')}
                onSubmit={submit}
                style={[styles.mh5, styles.flexGrow1]}
            >
                {/* TODO: the content will be created in https://github.com/Expensify/App/issues/44309 */}
                <View />
            </FormProvider>
        </ScreenWrapper>
    );
}

CardNameStep.displayName = 'CardNameStep';

export default CardNameStep;
