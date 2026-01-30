import {Str} from 'expensify-common';
import React, {useEffect, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import Button from '@components/Button';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useCardFeeds from '@hooks/useCardFeeds';
import useCurrencyList from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';
import {getCompanyCardFeed, getDomainOrWorkspaceAccountID, getPlaidCountry, getPlaidInstitutionId, isCardAlreadyAssigned, isSelectedFeedExpired, maskCardNumber} from '@libs/CardUtils';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {getDefaultAvatarURL} from '@libs/UserAvatarUtils';
import Navigation from '@navigation/Navigation';
import {assignWorkspaceCompanyCard, clearAssignCardStepAndData, setAddNewCompanyCardStepAndData, setAssignCardStepAndData} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Errors} from '@src/types/onyx/OnyxCommon';

type ConfirmationStepProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD_CONFIRMATION>;

function ConfirmationStep({route}: ConfirmationStepProps) {
    const policyID = route.params.policyID;
    const feed = route.params.feed;
    const cardID = route.params.cardID;
    const backTo = route.params?.backTo;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD, {canBeMissing: false});
    const [workspaceCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {canBeMissing: true});
    const [cardError, setCardError] = useState<Errors>();
    const policy = usePolicy(policyID);
    const {currencyList} = useCurrencyList();
    const [countryByIp] = useOnyx(ONYXKEYS.COUNTRY, {canBeMissing: false});
    const bankName = assignCard?.cardToAssign?.bankName ?? getCompanyCardFeed(feed);
    const [cardFeeds] = useCardFeeds(policyID);

    const companyCardFeedData = cardFeeds?.[feed];

    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const domainOrWorkspaceAccountID = getDomainOrWorkspaceAccountID(workspaceAccountID, companyCardFeedData);

    const cardToAssign = assignCard?.cardToAssign;

    const cardholder = getPersonalDetailByEmail(cardToAssign?.email ?? '');
    const cardholderName = Str.removeSMSDomain(cardholder?.displayName ?? '');

    const cardholderEmail = Str.removeSMSDomain(cardToAssign?.email ?? '');
    const cardholderAccountID = cardholder?.accountID;

    useEffect(() => {
        if (!assignCard?.isAssignmentFinished) {
            return;
        }

        Navigation.dismissModal();
        if (backTo) {
            Navigation.navigate(backTo);
        }
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => clearAssignCardStepAndData());
    }, [assignCard?.isAssignmentFinished, backTo]);

    const submit = () => {
        if (!policyID) {
            return;
        }

        const isFeedExpired = isSelectedFeedExpired(cardFeeds?.[feed]);
        const institutionId = !!getPlaidInstitutionId(bankName);

        if (isFeedExpired) {
            if (institutionId) {
                const country = getPlaidCountry(policy?.outputCurrency, currencyList, countryByIp);
                setAddNewCompanyCardStepAndData({
                    data: {
                        selectedCountry: country,
                    },
                });
            }

            Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_BROKEN_CARD_FEED_CONNECTION.getRoute(policyID, feed));
            return;
        }

        // Check both encryptedCardNumber and cardName since isCardAlreadyAssigned matches on either
        // This handles cases where workspace card entries only have cardName (masked display name) stored
        const cardIdentifier = cardToAssign?.encryptedCardNumber ?? cardToAssign?.cardName;
        if (cardIdentifier && isCardAlreadyAssigned(cardIdentifier, workspaceCardFeeds)) {
            setCardError(getMicroSecondOnyxErrorWithTranslationKey('workspace.companyCards.cardAlreadyAssignedError'));
            return;
        }

        assignWorkspaceCompanyCard(policy, domainOrWorkspaceAccountID, translate, feed, {...cardToAssign, cardholder, bankName});
    };

    const editStep = (step: string) => {
        setAssignCardStepAndData({isEditing: true});

        const routeParams = {policyID, feed, cardID};

        switch (step) {
            case CONST.COMPANY_CARD.STEP.ASSIGNEE:
                Navigation.goBack(ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_ASSIGNEE.getRoute(routeParams), {compareParams: false});
                break;
            case CONST.COMPANY_CARD.STEP.TRANSACTION_START_DATE:
                Navigation.setNavigationActionToMicrotaskQueue(() => {
                    Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_TRANSACTION_START_DATE.getRoute(routeParams));
                });
                break;
            case CONST.COMPANY_CARD.STEP.CARD_NAME:
                Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_CARD_NAME.getRoute(routeParams));
                break;
            default:
                throw new Error(`Invalid step: ${step}`);
        }
    };

    const handleBackButtonPress = () => {
        setAssignCardStepAndData({isEditing: true});
        Navigation.goBack(ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_ASSIGNEE.getRoute({policyID, feed, cardID}), {compareParams: false});
    };

    return (
        <InteractiveStepWrapper
            wrapperID="ConfirmationStep"
            handleBackButtonPress={handleBackButtonPress}
            headerTitle={translate('workspace.companyCards.assignCard')}
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldShowOfflineIndicatorInWideScreen
        >
            <ScrollView
                style={styles.pt0}
                contentContainerStyle={styles.flexGrow1}
                addBottomSafeAreaPadding
            >
                <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mt3]}>{translate('workspace.companyCards.letsDoubleCheck')}</Text>
                <Text style={[styles.textSupporting, styles.ph5, styles.mv3]}>{translate('workspace.companyCards.confirmationDescription')}</Text>
                <MenuItemWithTopDescription
                    description={translate('workspace.companyCards.card')}
                    title={maskCardNumber(cardToAssign?.cardName ?? '', cardToAssign?.bankName)}
                    interactive={false}
                />
                <View style={[styles.optionsListSectionHeader, styles.justifyContentCenter]}>
                    <Text style={[styles.ph5, styles.textLabelSupporting]}>{translate('common.to')}</Text>
                </View>
                <MenuItem
                    title={cardholderName}
                    description={cardholderEmail}
                    icon={cardholder?.avatar ?? getDefaultAvatarURL({accountID: cardholderAccountID ?? CONST.DEFAULT_NUMBER_ID})}
                    iconType={CONST.ICON_TYPE_AVATAR}
                    shouldShowRightIcon
                    onPress={() => editStep(CONST.COMPANY_CARD.STEP.ASSIGNEE)}
                />
                <MenuItemWithTopDescription
                    description={translate('workspace.moreFeatures.companyCards.transactionStartDate')}
                    title={
                        cardToAssign?.dateOption === CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.FROM_BEGINNING
                            ? translate('workspace.companyCards.fromTheBeginning')
                            : cardToAssign?.startDate
                    }
                    shouldShowRightIcon
                    onPress={() => editStep(CONST.COMPANY_CARD.STEP.TRANSACTION_START_DATE)}
                />
                <MenuItemWithTopDescription
                    description={translate('workspace.companyCards.cardName')}
                    title={cardToAssign?.customCardName}
                    shouldShowRightIcon
                    onPress={() => editStep(CONST.COMPANY_CARD.STEP.CARD_NAME)}
                />
                <View style={[styles.mh5, styles.pb5, styles.mt3, styles.flexGrow1, styles.justifyContentEnd]}>
                    <OfflineWithFeedback
                        shouldDisplayErrorAbove
                        errors={assignCard?.errors ?? cardError}
                        onClose={() => setCardError(undefined)}
                        errorRowStyles={styles.mv2}
                    >
                        <Button
                            isDisabled={isOffline}
                            success
                            large
                            isLoading={assignCard?.isAssigning}
                            style={styles.w100}
                            onPress={submit}
                            testID={CONST.ASSIGN_CARD_BUTTON_TEST_ID}
                            text={translate('workspace.companyCards.assignCard')}
                        />
                    </OfflineWithFeedback>
                </View>
            </ScrollView>
        </InteractiveStepWrapper>
    );
}

export default ConfirmationStep;
