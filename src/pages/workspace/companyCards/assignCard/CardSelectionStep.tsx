import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import Icon from '@components/Icon';
import {BrokenMagnifyingGlass} from '@components/Icon/Illustrations';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import PlaidCardFeedIcon from '@components/PlaidCardFeedIcon';
import RenderHTML from '@components/RenderHTML';
import SelectionList from '@components/SelectionListWithSections';
import RadioListItem from '@components/SelectionListWithSections/RadioListItem';
import Text from '@components/Text';
import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useCardFeeds from '@hooks/useCardFeeds';
import useCardsList from '@hooks/useCardsList';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import {setAssignCardStepAndData} from '@libs/actions/CompanyCards';
import {getCardFeedIcon, getFilteredCardList, getPlaidInstitutionIconUrl, lastFourNumbersFromCardName, maskCardNumber} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import {useAssignCardStepNavigation} from '@pages/workspace/companyCards/utils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {CompanyCardFeed} from '@src/types/onyx/CardFeeds';

type CardSelectionStepProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD_SELECT>;

function CardSelectionStep({route}: CardSelectionStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useThemeIllustrations();
    const [searchText, setSearchText] = useState('');
    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD, {canBeMissing: false});
    const feed = decodeURIComponent(route.params?.feed) as CompanyCardFeed;
    const policyID = route.params?.policyID;
    const [list] = useCardsList(policyID, feed);
    const [workspaceCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {canBeMissing: false});
    const [cardFeeds] = useCardFeeds(policyID);
    const plaidUrl = getPlaidInstitutionIconUrl(feed);

    const isEditing = assignCard?.isEditing;
    const assigneeDisplayName = getPersonalDetailByEmail(assignCard?.data?.email ?? '')?.displayName ?? '';
    const filteredCardList = getFilteredCardList(list, cardFeeds?.settings?.oAuthAccountDetails?.[feed], workspaceCardFeeds);

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
                src={getCardFeedIcon(feed, illustrations)}
                height={variables.cardIconHeight}
                width={variables.iconSizeExtraLarge}
                additionalStyles={[styles.mr3, styles.cardIcon]}
            />
        ),
    }));

    useAssignCardStepNavigation(policyID, feed, route.params?.backTo);

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
                        src={BrokenMagnifyingGlass}
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
                    sections={[{data: searchedListOptions}]}
                    headerMessage={searchedListOptions.length ? undefined : translate('common.noResultsFound')}
                    shouldShowTextInput={cardListOptions.length > CONST.COMPANY_CARDS.CARD_LIST_THRESHOLD}
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
                            <View style={[styles.ph5, styles.mv3, styles.textSupporting]}>
                                <RenderHTML
                                    html={translate('workspace.companyCards.chooseCardFor', {
                                        assignee: assigneeDisplayName,
                                    })}
                                />
                            </View>
                        </View>
                    }
                    shouldShowTextInputAfterHeader
                    shouldShowHeaderMessageAfterHeader
                    addBottomSafeAreaPadding
                    shouldShowListEmptyContent={false}
                    shouldScrollToFocusedIndex={false}
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
