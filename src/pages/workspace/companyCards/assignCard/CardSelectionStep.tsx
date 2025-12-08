import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import Icon from '@components/Icon';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import PlaidCardFeedIcon from '@components/PlaidCardFeedIcon';
import RenderHTML from '@components/RenderHTML';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import Text from '@components/Text';
import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useCardFeeds from '@hooks/useCardFeeds';
import useCardsList from '@hooks/useCardsList';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import {setAssignCardStepAndData} from '@libs/actions/CompanyCards';
import {getCardFeedIcon, getCompanyCardFeed, getFilteredCardList, getPlaidInstitutionIconUrl, lastFourNumbersFromCardName, maskCardNumber} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CompanyCardFeedWithDomainID} from '@src/types/onyx';

type CardSelectionStepProps = {
    /** Selected feed */
    feed: CompanyCardFeedWithDomainID;

    /** Current policy id */
    policyID: string | undefined;
};

function CardSelectionStep({feed, policyID}: CardSelectionStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useThemeIllustrations();
    const lazyIllustrations = useMemoizedLazyIllustrations(['BrokenMagnifyingGlass'] as const);
    const [searchText, setSearchText] = useState('');
    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD, {canBeMissing: false});
    const [list] = useCardsList(feed);
    const [workspaceCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {canBeMissing: false});
    const [cardFeeds] = useCardFeeds(policyID);
    const plaidUrl = getPlaidInstitutionIconUrl(feed);

    const isEditing = assignCard?.isEditing;
    const assigneeDisplayName = getPersonalDetailByEmail(assignCard?.data?.email ?? '')?.displayName ?? '';
    const filteredCardList = getFilteredCardList(list, cardFeeds?.[feed]?.accountList, workspaceCardFeeds);

    const [cardSelected, setCardSelected] = useState(assignCard?.data?.encryptedCardNumber ?? '');
    const [shouldShowError, setShouldShowError] = useState(false);

    const cardListOptions = Object.entries(filteredCardList).map(([cardNumber, encryptedCardNumber]) => ({
        keyForList: encryptedCardNumber,
        value: encryptedCardNumber,
        text: maskCardNumber(cardNumber, feed),
        alternateText: lastFourNumbersFromCardName(cardNumber),
        isSelected: cardSelected === encryptedCardNumber,
        leftElement: plaidUrl ? (
            <PlaidCardFeedIcon
                plaidUrl={plaidUrl}
                style={styles.mr3}
            />
        ) : (
            <Icon
                src={getCardFeedIcon(getCompanyCardFeed(feed), illustrations)}
                height={variables.cardIconHeight}
                width={variables.iconSizeExtraLarge}
                additionalStyles={[styles.mr3, styles.cardIcon]}
            />
        ),
    }));

    const handleBackButtonPress = () => {
        if (isEditing) {
            setAssignCardStepAndData({
                currentStep: CONST.COMPANY_CARD.STEP.CONFIRMATION,
                isEditing: false,
            });
            return;
        }
        if (!cardListOptions.length) {
            Navigation.goBack();
            return;
        }
        setAssignCardStepAndData({currentStep: CONST.COMPANY_CARD.STEP.ASSIGNEE});
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

        const cardNumber =
            Object.entries(filteredCardList)
                .find(([, encryptedCardNumber]) => encryptedCardNumber === cardSelected)
                ?.at(0) ?? '';

        setAssignCardStepAndData({
            currentStep: isEditing ? CONST.COMPANY_CARD.STEP.CONFIRMATION : CONST.COMPANY_CARD.STEP.TRANSACTION_START_DATE,
            data: {encryptedCardNumber: cardSelected, cardNumber},
            isEditing: false,
        });
    };

    const searchedListOptions = useMemo(() => {
        return tokenizedSearch(cardListOptions, searchText, (option) => [option.text]);
    }, [searchText, cardListOptions]);

    const safeAreaPaddingBottomStyle = useBottomSafeSafeAreaPaddingStyle();

    const textInputOptions = useMemo(
        () => ({
            headerMessage: searchedListOptions.length ? undefined : translate('common.noResultsFound'),
            label: cardListOptions.length > CONST.COMPANY_CARDS.CARD_LIST_THRESHOLD ? translate('common.search') : undefined,
            value: searchText,
            onChangeText: setSearchText,
            shouldBeInsideList: true,
        }),
        [cardListOptions.length, searchText, searchedListOptions.length, translate],
    );

    const customListHeader = (
        <View>
            <View style={[styles.ph5, styles.mb5, styles.mt3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    startStepIndex={1}
                    stepNames={CONST.COMPANY_CARD.STEP_NAMES}
                />
            </View>
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mt3]}>{translate('workspace.companyCards.chooseCard')}</Text>
            <View style={[styles.renderHTML, styles.ph5, styles.mv3, styles.textSupporting]}>
                <RenderHTML
                    html={translate('workspace.companyCards.chooseCardFor', {
                        assignee: assigneeDisplayName,
                    })}
                />
            </View>
        </View>
    );

    return (
        <InteractiveStepWrapper
            wrapperID={CardSelectionStep.displayName}
            handleBackButtonPress={handleBackButtonPress}
            headerTitle={translate('workspace.companyCards.assignCard')}
            headerSubtitle={assigneeDisplayName}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            {!cardListOptions.length ? (
                <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter, styles.ph5, styles.mb9, safeAreaPaddingBottomStyle]}>
                    <Icon
                        src={lazyIllustrations.BrokenMagnifyingGlass}
                        width={116}
                        height={168}
                    />
                    <Text style={[styles.textHeadlineLineHeightXXL, styles.mt3]}>{translate('workspace.companyCards.noActiveCards')}</Text>
                    <View style={[styles.renderHTML, styles.flexRow, styles.ph5, styles.mv3]}>
                        <RenderHTML html={translate('workspace.companyCards.somethingMightBeBroken')} />
                    </View>
                </View>
            ) : (
                <SelectionList
                    data={searchedListOptions}
                    ListItem={RadioListItem}
                    onSelectRow={({value}) => handleSelectCard(value)}
                    initiallyFocusedItemKey={cardSelected}
                    textInputOptions={textInputOptions}
                    customListHeaderContent={customListHeader}
                    shouldScrollToFocusedIndex={false}
                    showListEmptyContent={false}
                    addBottomSafeAreaPadding
                    shouldUpdateFocusedIndex
                    footerContent={
                        <FormAlertWithSubmitButton
                            buttonText={translate(isEditing ? 'common.confirm' : 'common.next')}
                            onSubmit={submit}
                            isAlertVisible={shouldShowError}
                            containerStyles={[!shouldShowError && styles.mt5]}
                            message={translate('common.error.pleaseSelectOne')}
                        />
                    }
                />
            )}
        </InteractiveStepWrapper>
    );
}

CardSelectionStep.displayName = 'CardSelectionStep';

export default CardSelectionStep;
