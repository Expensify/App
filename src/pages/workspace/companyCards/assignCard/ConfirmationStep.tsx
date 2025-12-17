import React, {useEffect} from 'react';
import {InteractionManager, View} from 'react-native';
import Button from '@components/Button';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useCardFeeds from '@hooks/useCardFeeds';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useRootNavigationState from '@hooks/useRootNavigationState';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCompanyCardFeed, getPlaidCountry, getPlaidInstitutionId, isSelectedFeedExpired, maskCardNumber} from '@libs/CardUtils';
import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {getDefaultAvatarURL} from '@libs/UserAvatarUtils';
import Navigation from '@navigation/Navigation';
import {assignWorkspaceCompanyCard, clearAssignCardStepAndData, setAddNewCompanyCardStepAndData, setAssignCardStepAndData} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {CompanyCardFeedWithDomainID, CurrencyList} from '@src/types/onyx';
import type {AssignCardStep} from '@src/types/onyx/AssignCard';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

type ConfirmationStepProps = {
    /** Current policy id */
    policyID: string | undefined;

    /** Route to go back to */
    backTo?: Route;

    /** Selected feed */
    feed: CompanyCardFeedWithDomainID;
};

function ConfirmationStep({policyID, feed, backTo}: ConfirmationStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD, {canBeMissing: false});
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: false});
    const [countryByIp] = useOnyx(ONYXKEYS.COUNTRY, {canBeMissing: false});
    const [currencyList = getEmptyObject<CurrencyList>()] = useOnyx(ONYXKEYS.CURRENCY_LIST, {canBeMissing: true});
    const bankName = assignCard?.data?.bankName ?? getCompanyCardFeed(feed);
    const [cardFeeds] = useCardFeeds(policyID);

    const data = assignCard?.data;
    const cardholderDetails = getPersonalDetailByEmail(data?.email ?? '');
    const cardholderName = cardholderDetails?.displayName ?? '';
    const cardholderEmail = data?.email ?? '';
    const cardholderAccountID = cardholderDetails?.accountID;

    const currentFullScreenRoute = useRootNavigationState((state) => state?.routes?.findLast((route) => isFullScreenName(route.name)));

    useEffect(() => {
        if (!assignCard?.isAssigned) {
            return;
        }

        const lastRoute = currentFullScreenRoute?.state?.routes.at(-1);
        if (backTo ?? lastRoute?.name === SCREENS.WORKSPACE.COMPANY_CARDS) {
            Navigation.goBack(backTo);
        } else {
            Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID), {forceReplace: true});
        }
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => clearAssignCardStepAndData());
    }, [assignCard?.isAssigned, backTo, policyID, currentFullScreenRoute?.state?.routes]);

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
            setAssignCardStepAndData({currentStep: institutionId ? CONST.COMPANY_CARD.STEP.PLAID_CONNECTION : CONST.COMPANY_CARD.STEP.BANK_CONNECTION});
            return;
        }
        assignWorkspaceCompanyCard(policy, {...data, bankName});
    };

    const editStep = (step: AssignCardStep) => {
        setAssignCardStepAndData({currentStep: step, isEditing: true});
    };

    const handleBackButtonPress = () => {
        setAssignCardStepAndData({currentStep: CONST.COMPANY_CARD.STEP.ASSIGNEE});
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
                    title={data?.encryptedCardNumber ?? maskCardNumber(data?.cardNumber ?? '', data?.bankName)}
                    interactive={false}
                />
                <MenuItem
                    label={translate('workspace.companyCards.cardholder')}
                    labelStyle={styles.mb3}
                    title={cardholderName && cardholderName !== cardholderEmail ? cardholderName : cardholderEmail}
                    description={cardholderName && cardholderName !== cardholderEmail ? cardholderEmail : undefined}
                    icon={cardholderDetails?.avatar ?? getDefaultAvatarURL({accountID: cardholderAccountID ?? CONST.DEFAULT_NUMBER_ID})}
                    iconType={CONST.ICON_TYPE_AVATAR}
                    shouldShowRightIcon
                    onPress={() => editStep(CONST.COMPANY_CARD.STEP.ASSIGNEE)}
                />
                <MenuItemWithTopDescription
                    description={translate('workspace.moreFeatures.companyCards.transactionStartDate')}
                    title={data?.dateOption === CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.FROM_BEGINNING ? translate('workspace.companyCards.fromTheBeginning') : data?.startDate}
                    shouldShowRightIcon
                    onPress={() => editStep(CONST.COMPANY_CARD.STEP.TRANSACTION_START_DATE)}
                />
                <MenuItemWithTopDescription
                    description={translate('workspace.companyCards.cardName')}
                    title={data?.cardName}
                    shouldShowRightIcon
                    onPress={() => editStep(CONST.COMPANY_CARD.STEP.CARD_NAME)}
                />
                <View style={[styles.mh5, styles.pb5, styles.mt3, styles.flexGrow1, styles.justifyContentEnd]}>
                    <OfflineWithFeedback
                        shouldDisplayErrorAbove
                        errors={assignCard?.errors}
                        errorRowStyles={styles.mv2}
                        canDismissError={false}
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
