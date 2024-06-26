import React from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import * as Card from '@userActions/Card';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function CardTypeStep() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const submit = () => {
        // TODO: the logic will be created in https://github.com/Expensify/App/issues/44309
        Card.setIssueNewCardStep(CONST.EXPENSIFY_CARD.STEP.LIMIT_TYPE);
    };

    const handleBackButtonPress = () => {
        Card.setIssueNewCardStep(CONST.EXPENSIFY_CARD.STEP.ASSIGNEE);
    };
    const isSelected = false;

    return (
        <ScreenWrapper
            testID={CardTypeStep.displayName}
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
                    startStepIndex={1}
                    stepNames={CONST.EXPENSIFY_CARD.STEP_NAMES}
                />
            </View>
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.card.issueNewCard.chooseCardType')}</Text>
            <View style={styles.mh5}>
                <MenuItem
                    icon={Illustrations.HandCard}
                    title={translate('workspace.card.issueNewCard.physicalCard')}
                    description={translate('workspace.card.issueNewCard.physicalCardDescription')}
                    shouldShowRightIcon
                    iconWidth={variables.menuIconSize}
                    iconHeight={variables.menuIconSize}
                    wrapperStyle={[styles.purposeMenuItem, isSelected && styles.purposeMenuItemSelected]}
                />
                <MenuItem
                    icon={Illustrations.VirtualCard}
                    title={translate('workspace.card.issueNewCard.virtualCard')}
                    description={translate('workspace.card.issueNewCard.virtualCardDescription')}
                    shouldShowRightIcon
                    iconWidth={variables.menuIconSize}
                    iconHeight={variables.menuIconSize}
                    wrapperStyle={[styles.purposeMenuItem, isSelected && styles.purposeMenuItemSelected]}
                />
            </View>
        </ScreenWrapper>
    );
}

CardTypeStep.displayName = 'CardTypeStep';

export default CardTypeStep;
