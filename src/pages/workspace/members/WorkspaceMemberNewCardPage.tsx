import React, {useState} from 'react';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import PlaidCardFeedIcon from '@components/PlaidCardFeedIcon';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import type {CombinedCardFeed} from '@hooks/useCardFeeds';
import useCardFeeds from '@hooks/useCardFeeds';
import useCardsList from '@hooks/useCardsList';
import {useCompanyCardFeedIcons} from '@hooks/useCompanyCardIcons';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import {
    getCardFeedIcon,
    getCompanyCardFeed,
    getCompanyFeeds,
    getCustomOrFormattedFeedName,
    getDomainOrWorkspaceAccountID,
    getFilteredCardList,
    getPlaidInstitutionIconUrl,
    hasOnlyOneCardToAssign,
    isCustomFeed,
    isExpensifyCardFullySetUp,
    isSelectedFeedExpired,
} from '@libs/CardUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import Navigation from '@navigation/Navigation';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import variables from '@styles/variables';
import {setIssueNewCardStepAndData} from '@userActions/Card';
import {openAssignFeedCardPage, setAssignCardStepAndData} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {CompanyCardFeed, CompanyCardFeedWithDomainID} from '@src/types/onyx';
import type {AssignCardData, AssignCardStep} from '@src/types/onyx/AssignCard';

type CardFeedListItem = ListItem & {
    /** Combined feed key */
    value: CompanyCardFeedWithDomainID;

    /** Card feed value */
    feed: CompanyCardFeed;
};

type WorkspaceMemberNewCardPageProps = WithPolicyAndFullscreenLoadingProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBER_NEW_CARD>;

function WorkspaceMemberNewCardPage({route, personalDetails}: WorkspaceMemberNewCardPageProps) {
    const {policyID} = route.params;
    const policy = usePolicy(policyID);
    const workspaceAccountID = policy?.workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID;

    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const lazyIllustrations = useMemoizedLazyIllustrations(['ExpensifyCardImage']);
    const illustrations = useThemeIllustrations();
    const companyCardFeedIcons = useCompanyCardFeedIcons();
    const [cardFeeds, , defaultFeed] = useCardFeeds(policyID);
    const [selectedFeed, setSelectedFeed] = useState('');
    const [shouldShowError, setShouldShowError] = useState(false);
    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}`, {canBeMissing: true});
    const [workspaceCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {canBeMissing: true});

    const accountID = Number(route.params.accountID);
    const memberLogin = personalDetails?.[accountID]?.login ?? '';
    const memberName = personalDetails?.[accountID]?.firstName ? personalDetails?.[accountID]?.firstName : personalDetails?.[accountID]?.login;
    const companyFeeds = getCompanyFeeds(cardFeeds, false, true);
    const currentFeed = selectedFeed ? cardFeeds?.[selectedFeed as CompanyCardFeedWithDomainID] : undefined;
    const isFeedExpired = isSelectedFeedExpired(currentFeed);
    const domainOrWorkspaceAccountID = getDomainOrWorkspaceAccountID(workspaceAccountID, currentFeed);

    const [list] = useCardsList(selectedFeed as CompanyCardFeedWithDomainID);
    const filteredCardList = getFilteredCardList(list, currentFeed?.accountList, workspaceCardFeeds);

    const shouldShowExpensifyCard = isExpensifyCardFullySetUp(policy, cardSettings);

    const handleSubmit = () => {
        if (!selectedFeed) {
            setShouldShowError(true);
            return;
        }
        if (selectedFeed === CONST.EXPENSIFY_CARD.NAME) {
            setIssueNewCardStepAndData({
                step: CONST.EXPENSIFY_CARD.STEP.CARD_TYPE,
                data: {
                    assigneeEmail: memberLogin,
                },
                isEditing: false,
                isChangeAssigneeDisabled: true,
                policyID,
            });
            Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW.getRoute(policyID, ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID)));
        } else {
            const data: Partial<AssignCardData> = {
                email: memberLogin,
                bankName: getCompanyCardFeed(selectedFeed as CompanyCardFeedWithDomainID),
                cardName: `${memberName}'s card`,
            };
            let currentStep: AssignCardStep = CONST.COMPANY_CARD.STEP.CARD;

            if (hasOnlyOneCardToAssign(filteredCardList)) {
                currentStep = CONST.COMPANY_CARD.STEP.TRANSACTION_START_DATE;
                data.cardNumber = Object.keys(filteredCardList).at(0);
                data.encryptedCardNumber = Object.values(filteredCardList).at(0);
            }
            if (isFeedExpired) {
                currentStep = CONST.COMPANY_CARD.STEP.BANK_CONNECTION;
            }
            setAssignCardStepAndData({
                currentStep,
                data,
                isEditing: false,
            });
            Navigation.setNavigationActionToMicrotaskQueue(() =>
                Navigation.navigate(
                    ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD.getRoute({policyID, feed: selectedFeed, cardID: undefined}, ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID)),
                ),
            );
        }
    };

    const handleSelectFeed = ({value, feed}: CardFeedListItem) => {
        setSelectedFeed(value);
        const workspaceCards = workspaceCardFeeds?.[`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${feed}`] ?? {};
        const hasAllCardsData = !!workspaceCards.cardList;
        if (isCustomFeed(feed) && !hasAllCardsData) {
            openAssignFeedCardPage(policyID, feed, domainOrWorkspaceAccountID);
        }
        setShouldShowError(false);
    };

    const companyCardFeeds: CardFeedListItem[] = (Object.entries(companyFeeds) as Array<[CompanyCardFeedWithDomainID, CombinedCardFeed]>).map(([key, value]) => {
        const plaidUrl = getPlaidInstitutionIconUrl(value.feed);

        return {
            value: key,
            feed: value.feed,
            text: getCustomOrFormattedFeedName(value.feed, value.customFeedName),
            keyForList: key,
            isDisabled: value.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            pendingAction: value.pendingAction,
            isSelected: selectedFeed === key,

            leftElement: plaidUrl ? (
                <PlaidCardFeedIcon
                    plaidUrl={plaidUrl}
                    style={styles.mr3}
                />
            ) : (
                <Icon
                    src={getCardFeedIcon(value.feed, illustrations, companyCardFeedIcons)}
                    height={variables.cardIconHeight}
                    width={variables.cardIconWidth}
                    additionalStyles={[styles.mr3, styles.cardIcon]}
                />
            ),
        };
    });

    const feeds = shouldShowExpensifyCard
        ? [
              ...companyCardFeeds,
              {
                  value: CONST.EXPENSIFY_CARD.NAME as CompanyCardFeedWithDomainID,
                  feed: CONST.EXPENSIFY_CARD.NAME as CompanyCardFeed,
                  text: translate('workspace.common.expensifyCard'),
                  keyForList: CONST.EXPENSIFY_CARD.NAME,
                  isSelected: selectedFeed === CONST.EXPENSIFY_CARD.NAME,
                  leftElement: (
                      <Icon
                          src={lazyIllustrations.ExpensifyCardImage}
                          width={variables.cardIconWidth}
                          height={variables.cardIconHeight}
                          additionalStyles={[styles.cardIcon, styles.mr3]}
                      />
                  ),
              },
          ]
        : companyCardFeeds;

    const goBack = () => Navigation.goBack();

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}
        >
            <ScreenWrapper
                testID="WorkspaceMemberNewCardPage"
                shouldEnablePickerAvoiding={false}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.companyCards.selectCards')}
                    onBackButtonPress={goBack}
                />
                <SelectionList
                    data={feeds}
                    ListItem={RadioListItem}
                    onSelectRow={handleSelectFeed}
                    shouldUpdateFocusedIndex
                    alternateNumberOfSupportedLines={2}
                />
                <FormAlertWithSubmitButton
                    containerStyles={styles.p5}
                    isAlertVisible={shouldShowError}
                    onSubmit={handleSubmit}
                    message={translate('common.error.pleaseSelectOne')}
                    buttonText={translate('common.next')}
                    isLoading={!!defaultFeed?.isLoading}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(WorkspaceMemberNewCardPage);
