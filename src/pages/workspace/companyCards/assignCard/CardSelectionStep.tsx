import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

function CardSelectionStep() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const handleBackButtonPress = () => {};

    return (
        <InteractiveStepWrapper
            wrapperID={CardSelectionStep.displayName}
            handleBackButtonPress={handleBackButtonPress}
            startStepIndex={1}
            stepNames={CONST.COMPANY_CARD.STEP_NAMES}
            headerTitle={translate('workspace.companyCards.assignCard')}
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.companyCards.chooseCard')}</Text>
            <Text style={[styles.textSupporting, styles.ph5, styles.mv3]}>
                {translate('workspace.companyCards.chooseCardFor', {
                    assignee: '',
                    feed: '',
                })}
            </Text>
        </InteractiveStepWrapper>
    );
}

CardSelectionStep.displayName = 'CardSelectionStep';

export default CardSelectionStep;
