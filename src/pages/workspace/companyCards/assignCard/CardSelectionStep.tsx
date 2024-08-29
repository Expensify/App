import React, {useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import Icon from '@components/Icon';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CardUtils from '@libs/CardUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import variables from '@styles/variables';
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

type CardSelectionStepProps = {
    feed: string;
};

function CardSelectionStep({feed}: CardSelectionStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD);
    const [cardSelected, setCardSelected] = useState('');

    const isEditing = assignCard?.isEditing;
    const assignee = assignCard?.data?.email ?? '';

    const handleBackButtonPress = () => {
        if (isEditing) {
            CompanyCards.setAssignCardStepAndData({currentStep: CONST.COMPANY_CARD.STEP.CONFIRMATION, isEditing: false});
            return;
        }
        CompanyCards.setAssignCardStepAndData({currentStep: CONST.COMPANY_CARD.STEP.ASSIGNEE});
    };

    const submit = () => {
        CompanyCards.setAssignCardStepAndData({
            currentStep: isEditing ? CONST.COMPANY_CARD.STEP.CONFIRMATION : CONST.COMPANY_CARD.STEP.TRANSACTION_START_DATE,
            data: {cardName: cardSelected},
            isEditing: false,
        });
    };

    const cardListOptions = mockedCardList.map((item) => ({
        keyForList: item.key,
        value: item.cardNumber,
        text: item.cardNumber,
        isSelected: cardSelected === item.cardNumber,
        leftElement: (
            <Icon
                src={CardUtils.getCardFeedIcon(feed)}
                height={variables.iconSizeExtraLarge}
                width={variables.iconSizeExtraLarge}
                additionalStyles={styles.mr3}
            />
        ),
    }));

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
                    feed: feed ?? 'visa',
                })}
            </Text>
            <SelectionList
                sections={[{data: cardListOptions}]}
                ListItem={RadioListItem}
                onSelectRow={({value}) => setCardSelected(value)}
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
