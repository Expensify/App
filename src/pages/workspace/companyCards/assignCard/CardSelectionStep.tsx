import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import Icon from '@components/Icon';
import * as Illustrations from '@components/Icon/Illustrations';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
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
    const [searchText, setSearchText] = useState('');
    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD);
    const [list] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${feed}`);
    const [cardFeeds] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`);
    const accountCardList = cardFeeds?.settings?.oAuthAccountDetails?.[feed]?.accountList ?? [];

    const isEditing = assignCard?.isEditing;
    const assigneeDisplayName = PersonalDetailsUtils.getPersonalDetailByEmail(assignCard?.data?.email ?? '')?.displayName ?? '';
    const {cardList, ...cards} = list ?? {};
    // We need to filter out cards which already has been assigned
    const filteredCardList = Object.fromEntries(
        Object.entries(cardList ?? {}).filter(([cardNumber]) => !Object.values(cards).find((card) => card.lastFourPAN && cardNumber.endsWith(card.lastFourPAN))),
    );
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

    const accountCardListOptions = accountCardList.map((encryptedCardNumber) => ({
        keyForList: encryptedCardNumber,
        value: encryptedCardNumber,
        text: encryptedCardNumber,
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

    const submit = () => {
        if (!cardSelected) {
            setShouldShowError(true);
            return;
        }

        const cardNumber =
            Object.entries(filteredCardList)
                .find(([, encryptedCardNumber]) => encryptedCardNumber === cardSelected)
                ?.at(0) ?? '';

        CompanyCards.setAssignCardStepAndData({
            currentStep: isEditing ? CONST.COMPANY_CARD.STEP.CONFIRMATION : CONST.COMPANY_CARD.STEP.TRANSACTION_START_DATE,
            data: {encryptedCardNumber: cardSelected, cardNumber: accountCardList?.length > 0 ? cardSelected : cardNumber},
            isEditing: false,
        });
    };

    const cardListOptions = Object.entries(filteredCardList).map(([cardNumber, encryptedCardNumber]) => ({
        keyForList: encryptedCardNumber,
        value: encryptedCardNumber,
        text: CardUtils.maskCardNumber(cardNumber),
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

    const listOptions = accountCardList?.length > 0 ? accountCardListOptions : cardListOptions;

    const searchedListOptions = useMemo(() => {
        return listOptions.filter((option) => option.text.toLowerCase().includes(searchText));
    }, [searchText, listOptions]);

    return (
        <InteractiveStepWrapper
            wrapperID={CardSelectionStep.displayName}
            handleBackButtonPress={handleBackButtonPress}
            headerTitle={translate('workspace.companyCards.assignCard')}
            headerSubtitle={assigneeDisplayName}
        >
            {!listOptions.length ? (
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
                    <SelectionList
                        sections={[{data: searchedListOptions}]}
                        shouldShowTextInput={listOptions.length > CONST.COMPANY_CARDS.CARD_LIST_THRESHOLD}
                        textInputLabel={translate('common.search')}
                        textInputValue={searchText}
                        onChangeText={setSearchText}
                        ListItem={RadioListItem}
                        onSelectRow={({value}) => handleSelectCard(value)}
                        initiallyFocusedOptionKey={cardSelected}
                        listHeaderContent={
                            <View>
                                <View style={[styles.ph5, styles.mb5, styles.mt3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
                                    <InteractiveStepSubHeader
                                        startStepIndex={1}
                                        stepNames={CONST.COMPANY_CARD.STEP_NAMES}
                                    />
                                </View>
                                <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mt3]}>{translate('workspace.companyCards.chooseCard')}</Text>
                                <Text style={[styles.textSupporting, styles.ph5, styles.mv3]}>
                                    {translate('workspace.companyCards.chooseCardFor', {
                                        assignee: assigneeDisplayName,
                                        feed: CardUtils.getCustomOrFormattedFeedName(feed),
                                    })}
                                </Text>
                            </View>
                        }
                        shouldShowTextInputAfterHeader
                        includeSafeAreaPaddingBottom={false}
                        shouldShowListEmptyContent={false}
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
