import React, {useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import Icon from '@components/Icon';
import * as Illustrations from '@components/Icon/Illustrations';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CardUtils from '@libs/CardUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import variables from '@styles/variables';
import * as CompanyCards from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {CompanyCardFeed} from '@src/types/onyx';

type CardSelectionStepProps = {
    /** Selected feed */
    feed: CompanyCardFeed;

    /** Current policy id */
    policyID: string;
};

function CardSelectionStep({feed, policyID}: CardSelectionStepProps) {
    const workspaceAccountID = PolicyUtils.getWorkspaceAccountID(policyID);

    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {environmentURL} = useEnvironment();
    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD);
    const [list] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${feed}`);

    const isEditing = assignCard?.isEditing;
    const assignee = assignCard?.data?.email ?? '';

    const [cardSelected, setCardSelected] = useState(assignCard?.data?.encryptedCardNumber ?? '');
    const [shouldShowError, setShouldShowError] = useState(false);

    const handleBackButtonPress = () => {
        if (isEditing) {
            CompanyCards.setAssignCardStepAndData({
                currentStep: CONST.COMPANY_CARD.STEP.CONFIRMATION,
                isEditing: false,
            });
            return;
        }
        CompanyCards.setAssignCardStepAndData({currentStep: CONST.COMPANY_CARD.STEP.ASSIGNEE});
    };

    const handleSelectCard = (cardNumber: string) => {
        setCardSelected(cardNumber);
        setShouldShowError(false);
    };

    const submit = () => {
        if (!cardSelected) {
            setShouldShowError(true);
            return;
        }

        const cardName =
            Object.entries(list?.cardList ?? {})
                .find(([cardNumber, encryptedCardNumber]) => encryptedCardNumber === cardSelected)
                ?.at(0) ?? '';

        CompanyCards.setAssignCardStepAndData({
            currentStep: isEditing ? CONST.COMPANY_CARD.STEP.CONFIRMATION : CONST.COMPANY_CARD.STEP.TRANSACTION_START_DATE,
            data: {encryptedCardNumber: cardSelected, cardName},
            isEditing: false,
        });
    };

    const cardListOptions = Object.entries(list?.cardList ?? {}).map(([cardNumber, encryptedCardNumber]) => ({
        keyForList: encryptedCardNumber,
        value: encryptedCardNumber,
        text: cardNumber,
        isSelected: cardSelected === encryptedCardNumber,
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
            startStepIndex={cardListOptions.length ? 1 : undefined}
            stepNames={cardListOptions.length ? CONST.COMPANY_CARD.STEP_NAMES : undefined}
            headerTitle={translate('workspace.companyCards.assignCard')}
        >
            {!cardListOptions.length ? (
                <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter, styles.ph5, styles.mb9]}>
                    <Icon
                        src={Illustrations.BrokenMagnifyingGlass}
                        width={116}
                        height={168}
                    />
                    <Text style={[styles.textHeadlineLineHeightXXL, styles.mt3]}>{translate('workspace.companyCards.noActiveCards')}</Text>
                    <Text style={[styles.textSupporting, styles.ph5, styles.mv3, styles.textAlignCenter]}>
                        {translate('workspace.companyCards.somethingMightBeBroken')}{' '}
                        <TextLink
                            href={`${environmentURL}/${ROUTES.CONCIERGE}`}
                            style={styles.link}
                        >
                            {translate('workspace.companyCards.contactConcierge')}
                        </TextLink>
                        .
                    </Text>
                </View>
            ) : (
                <>
                    <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mt3]}>{translate('workspace.companyCards.chooseCard')}</Text>
                    <Text style={[styles.textSupporting, styles.ph5, styles.mv3]}>
                        {translate('workspace.companyCards.chooseCardFor', {
                            assignee: PersonalDetailsUtils.getPersonalDetailByEmail(assignee ?? '')?.displayName ?? '',
                            feed: CardUtils.getCardFeedName(feed),
                        })}
                    </Text>
                    <SelectionList
                        sections={[{data: cardListOptions}]}
                        ListItem={RadioListItem}
                        onSelectRow={({value}) => handleSelectCard(value)}
                        initiallyFocusedOptionKey={cardSelected}
                        shouldUpdateFocusedIndex
                    />
                    <FormAlertWithSubmitButton
                        buttonText={translate(isEditing ? 'common.confirm' : 'common.next')}
                        onSubmit={submit}
                        isAlertVisible={shouldShowError}
                        containerStyles={styles.ph5}
                        message={translate('common.error.pleaseSelectOne')}
                        buttonStyles={styles.mb5}
                    />
                </>
            )}
        </InteractiveStepWrapper>
    );
}

CardSelectionStep.displayName = 'CardSelectionStep';

export default CardSelectionStep;
