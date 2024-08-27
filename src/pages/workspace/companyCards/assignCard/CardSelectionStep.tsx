import React from 'react';
import {useOnyx} from 'react-native-onyx';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CompanyCards from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function CardSelectionStep() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD);
    const [lastSelectedFeed] = useOnyx('lastSelectedFeed_1234');

    const assignee = assignCard?.data?.assigneeEmail ?? '';

    const handleBackButtonPress = () => {
        CompanyCards.setAssignCardStepAndData({currentStep: CONST.COMPANY_CARD.STEP.ASSIGNEE});
    };

    return (
        <InteractiveStepWrapper
            wrapperID={CardSelectionStep.displayName}
            handleBackButtonPress={handleBackButtonPress}
            startStepIndex={1}
            stepNames={CONST.COMPANY_CARD.STEP_NAMES}
            headerTitle={translate('workspace.companyCards.assignCard')}
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mt3]}>{translate('workspace.companyCards.chooseCard')}</Text>
            <Text style={[styles.textSupporting, styles.ph5, styles.mv3]}>
                {translate('workspace.companyCards.chooseCardFor', {
                    assignee,
                    feed: lastSelectedFeed,
                })}
            </Text>
        </InteractiveStepWrapper>
    );
}

CardSelectionStep.displayName = 'CardSelectionStep';

export default CardSelectionStep;
