import React from 'react';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as CompanyCards from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const mockedCardList = [
    {
        key: '1',
        cardNumber: '123412XXXXXX1234',
    },
    {
        key: '2',
        cardNumber: '123412XXXXXX1235',
    },
    {
        key: '3',
        cardNumber: '123412XXXXXX1236',
    },
];

function CardSelectionStep() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD);
    const [lastSelectedFeed] = useOnyx('lastSelectedFeed_1234');

    const isEditing = assignCard?.isEditing;
    const assignee = assignCard?.data?.email ?? '';

    const handleBackButtonPress = () => {
        CompanyCards.setAssignCardStepAndData({currentStep: CONST.COMPANY_CARD.STEP.ASSIGNEE});
    };

    const submit = () => {
        CompanyCards.setAssignCardStepAndData({currentStep: CONST.COMPANY_CARD.STEP.TRANSACTION_START_DATE});
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
                    assignee: PersonalDetailsUtils.getPersonalDetailByEmail(assignee ?? '')?.displayName ?? '',
                    feed: lastSelectedFeed ?? 'visa',
                })}
            </Text>
            <SelectionList
                sections={[{data: mockedCardList}]}
                ListItem={RadioListItem}
                onSelectRow={() => {}}
                shouldUpdateFocusedIndex
            />
            <Button
                success
                large
                pressOnEnter
                text={translate(isEditing ? 'common.confirm' : 'common.next')}
                onPress={submit}
                style={styles.m5}
            />
        </InteractiveStepWrapper>
    );
}

CardSelectionStep.displayName = 'CardSelectionStep';

export default CardSelectionStep;
