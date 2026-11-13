import BlockingView from '@components/BlockingViews/BlockingView';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import Icon from '@components/Icon';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import PlaidCardFeedIcon from '@components/PlaidCardFeedIcon';
import RenderHTML from '@components/RenderHTML';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import Text from '@components/Text';

import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useCardFeeds from '@hooks/useCardFeeds';
import useCardsList from '@hooks/useCardsList';
import {useCompanyCardFeedIcons} from '@hooks/useCompanyCardIcons';
import useCompanyCardNumberSearch, {normalizeCardNumber} from '@hooks/useCompanyCardNumberSearch';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalDetailByLogin from '@hooks/usePersonalDetailByLogin';
import usePressLoading from '@hooks/usePressLoading';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';

import {setAssignCardStepAndData} from '@libs/actions/CompanyCards';
import {getCardFeedIcon, getCompanyCardFeed, getFilteredCardList, getPlaidInstitutionIconUrl, lastFourNumbersFromCardName, maskCardNumber, splitCardFeedWithDomainID} from '@libs/CardUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import tokenizedSearch from '@libs/tokenizedSearch';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {UnassignedCard} from '@src/types/onyx/Card';
import type {CardFeedWithNumber, CompanyCardFeedWithNumber} from '@src/types/onyx/CardFeeds';

import {Str} from 'expensify-common';
import {useState} from 'react';
import {View} from 'react-native';

type CardSelectionStepProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD_CARD_SELECTION>;

function CardSelectionStep({route}: CardSelectionStepProps) {
    const policyID = route.params.policyID;
    const feed = route.params.feed;
    const cardID = route.params.cardID;
    const {translate, formatPhoneNumber} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useThemeIllustrations();
    const companyCardFeedIcons = useCompanyCardFeedIcons();
    const lazyIllustrations = useMemoizedLazyIllustrations(['BrokenMagnifyingGlass']);
    const [searchText, setSearchText] = useState('');
    // Split the route's domain-suffixed feed id into (plain feed, domainID) for the server-side number search.
    const feedWithDomain = splitCardFeedWithDomainID(feed);
    // This step only runs in the company-card flow, so narrow off the Expensify Card bank before passing.
    const isCompanyCardFeed = (value: CardFeedWithNumber): value is CompanyCardFeedWithNumber => !value.startsWith(CONST.EXPENSIFY_CARD.BANK);
    const companyCardFeedName = feedWithDomain?.feedName && isCompanyCardFeed(feedWithDomain.feedName) ? feedWithDomain.feedName : undefined;
    const companyCardNumberSearch = useCompanyCardNumberSearch(policyID, companyCardFeedName, feedWithDomain?.domainID);
    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD);
    const [list] = useCardsList(feed);
    const [workspaceCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST);
    const [cardFeeds] = useCardFeeds(policyID);
    const plaidUrl = getPlaidInstitutionIconUrl(feed);

    const isEditing = assignCard?.isEditing;
    const assigneeDisplayName = usePersonalDetailByLogin(assignCard?.cardToAssign?.email ?? '', (personalDetails) => {
        const displayName = personalDetails?.displayName ?? '';
        return Str.isSMSLogin(displayName) ? formatPhoneNumber(displayName) : displayName;
    });
    const filteredCardList = getFilteredCardList(list, cardFeeds?.[feed]?.accountList, workspaceCardFeeds, feed);

    const [cardSelected, setCardSelected] = useState(assignCard?.cardToAssign?.encryptedCardNumber ?? '');
    const [shouldShowError, setShouldShowError] = useState(false);
    const {isLoading, startWithLoading} = usePressLoading();

    const cardListOptions = filteredCardList.map((card: UnassignedCard) => ({
        keyForList: card.cardID,
        value: card.cardID,
        text: maskCardNumber(card.cardName, feed),
        alternateText: lastFourNumbersFromCardName(card.cardName),
        isSelected: cardSelected === card.cardID,
        leftElement: plaidUrl ? (
            <PlaidCardFeedIcon
                plaidUrl={plaidUrl}
                style={styles.mr3}
            />
        ) : (
            <Icon
                src={getCardFeedIcon(getCompanyCardFeed(feed), illustrations, companyCardFeedIcons)}
                height={variables.cardIconHeight}
                width={variables.iconSizeExtraLarge}
                additionalStyles={[styles.mr3, styles.cardIcon]}
            />
        ),
    }));

    const handleBackButtonPress = () => {
        if (isEditing) {
            setAssignCardStepAndData({
                isEditing: false,
            });
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_CONFIRMATION.path));
            return;
        }
        Navigation.goBack();
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

        startWithLoading(() => {
            // Find the card by its ID to get the display name
            const selectedCard = filteredCardList.find((card) => card.cardID === cardSelected);
            const cardName = selectedCard?.cardName ?? '';

            const customCardName = assignCard?.cardToAssign?.customCardName ?? '';

            setAssignCardStepAndData({
                cardToAssign: {encryptedCardNumber: cardSelected, cardName, customCardName},
                isEditing: false,
            });

            if (isEditing) {
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_CONFIRMATION.path));
            } else {
                Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_TRANSACTION_START_DATE.getRoute({policyID, feed, cardID}));
            }
        });
    };

    // For a full-number query the server is authoritative: the masked card name shares digit suffixes with
    // unrelated cards, so a tokenized match would surface a card whose hidden digits differ from what the
    // admin typed. Partial (last-four) matches are flagged so the admin can tell they aren't verified.
    const {resultsQuery, matchedEncryptedNumbers, lastFourEncryptedNumbers, isFullNumberQuery} = companyCardNumberSearch;
    const hasCurrentResults = !!resultsQuery && normalizeCardNumber(searchText) === resultsQuery;
    const lastFourWarning = translate('workspace.moreFeatures.companyCards.matchesLastFourDigitsOnly');
    let searchedListOptions;
    if (isFullNumberQuery) {
        searchedListOptions = hasCurrentResults
            ? cardListOptions
                  .filter((option) => matchedEncryptedNumbers.has(option.value))
                  .map((option) => (lastFourEncryptedNumbers.has(option.value) ? {...option, alternateText: lastFourWarning} : option))
            : [];
    } else {
        searchedListOptions = tokenizedSearch(cardListOptions, searchText, (option) => [option.text]);
    }

    const safeAreaPaddingBottomStyle = useBottomSafeSafeAreaPaddingStyle();

    // Feed the typed text into the search hook from the input's own change handler rather than mirroring it
    // through an effect; the search state only ever transitions in response to this user event.
    const textInputOptions = {
        headerMessage: searchedListOptions.length || companyCardNumberSearch.isSearching || companyCardNumberSearch.hasError ? undefined : translate('common.noResultsFound'),
        label: translate('common.search'),
        value: searchText,
        onChangeText: (text: string) => {
            setSearchText(text);
            companyCardNumberSearch.setSearchValue(text);
        },
        shouldBeInsideList: true,
    };

    const customListHeader = (
        <View>
            <View style={[styles.ph5, styles.mb5, styles.mt3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    startStepIndex={1}
                    stepNames={CONST.COMPANY_CARD.STEP_NAMES}
                    currentStepAccessibilityDescription={translate('workspace.companyCards.chooseCard')}
                />
            </View>
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mt3]}>{translate('workspace.companyCards.chooseCard')}</Text>
            <View style={[styles.renderHTML, styles.ph5, styles.mv3, styles.textSupporting]}>
                <RenderHTML html={translate('workspace.companyCards.chooseCardFor', assigneeDisplayName)} />
            </View>
        </View>
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.COMPANY_CARDS}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
        >
            <InteractiveStepWrapper
                wrapperID="CardSelectionStep"
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
                        ListItem={SingleSelectListItem}
                        onSelectRow={({value}) => handleSelectCard(value)}
                        initiallyFocusedItemKey={cardSelected}
                        textInputOptions={textInputOptions}
                        customListHeaderContent={customListHeader}
                        shouldScrollToFocusedIndex={false}
                        shouldShowLoadingPlaceholder={companyCardNumberSearch.isSearching}
                        shouldShowListEmptyContent={companyCardNumberSearch.hasError}
                        listEmptyContent={
                            companyCardNumberSearch.hasError ? (
                                <BlockingView
                                    icon={lazyIllustrations.BrokenMagnifyingGlass}
                                    title={translate('common.genericErrorMessage')}
                                    buttonTranslationKey="common.tryAgain"
                                    onButtonPress={companyCardNumberSearch.retrySearch}
                                />
                            ) : undefined
                        }
                        addBottomSafeAreaPadding
                        shouldUpdateFocusedIndex
                        footerContent={
                            <FormAlertWithSubmitButton
                                sentryLabel={
                                    isEditing
                                        ? CONST.SENTRY_LABEL.WORKSPACE.COMPANY_CARDS.ASSIGN_CARD_SELECTION_SUBMIT.CONFIRM
                                        : CONST.SENTRY_LABEL.WORKSPACE.COMPANY_CARDS.ASSIGN_CARD_SELECTION_SUBMIT.NEXT
                                }
                                buttonText={translate(isEditing ? 'common.confirm' : 'common.next')}
                                onSubmit={submit}
                                isAlertVisible={shouldShowError}
                                containerStyles={[!shouldShowError && styles.mt5]}
                                message={translate('common.error.pleaseSelectOne')}
                                shouldShowLoadingImmediatelyOnPress={false}
                                isLoading={isLoading}
                            />
                        }
                    />
                )}
            </InteractiveStepWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default CardSelectionStep;
