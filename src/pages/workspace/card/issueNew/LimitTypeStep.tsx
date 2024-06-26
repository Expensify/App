import React, {useMemo} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Card from '@userActions/Card';
import CONST from '@src/CONST';

function LimitTypeStep() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const submit = () => {
        // TODO: the logic will be created in https://github.com/Expensify/App/issues/44309
        Card.setIssueNewCardStep(CONST.EXPENSIFY_CARD.STEP.LIMIT);
    };

    const handleBackButtonPress = () => {
        Card.setIssueNewCardStep(CONST.EXPENSIFY_CARD.STEP.CARD_TYPE);
    };

    const data = useMemo(
        () => [
            {
                value: CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART,
                text: translate('workspace.card.issueNewCard.smartLimit'),
                alternateText: translate('workspace.card.issueNewCard.smartLimitDescription'),
                keyForList: CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART,
            },
            {
                value: CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED,
                text: translate('workspace.card.issueNewCard.fixedAmount'),
                alternateText: translate('workspace.card.issueNewCard.fixedAmountDescription'),
                keyForList: CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED,
            },
            {
                value: CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY,
                text: translate('workspace.card.issueNewCard.monthly'),
                alternateText: translate('workspace.card.issueNewCard.monthlyDescription'),
                keyForList: CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED,
            },
        ],
        [translate],
    );

    return (
        <ScreenWrapper
            testID={LimitTypeStep.displayName}
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
                    startStepIndex={2}
                    stepNames={CONST.EXPENSIFY_CARD.STEP_NAMES}
                />
            </View>
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.card.issueNewCard.chooseLimitType')}</Text>

            <SelectionList
                ListItem={RadioListItem}
                onSelectRow={() => {}}
                sections={[{data}]}
            />
            <Button
                success
                large
                pressOnEnter
                text={translate('common.next')}
                onPress={submit}
                style={styles.m5}
            />
        </ScreenWrapper>
    );
}

LimitTypeStep.displayName = 'LimitTypeStep';

export default LimitTypeStep;
