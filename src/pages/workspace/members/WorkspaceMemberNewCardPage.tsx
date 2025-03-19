import React, {useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import ExpensifyCardImage from '@assets/images/expensify-card.svg';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import useLocalize from '@hooks/useLocalize';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import {
    filterInactiveCards,
    getCardFeedIcon,
    getCompanyFeeds,
    getCustomOrFormattedFeedName,
    getFilteredCardList,
    hasCardListObject,
    hasOnlyOneCardToAssign,
    isCustomFeed,
    isExpensifyCardFullySetUp,
    isSelectedFeedExpired,
} from '@libs/CardUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getPolicy} from '@libs/PolicyUtils';
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
import type {CompanyCardFeed} from '@src/types/onyx';
import type {AssignCardData, AssignCardStep} from '@src/types/onyx/AssignCard';

type CardFeedListItem = ListItem & {
    /** Card feed value */
    value: string;
};

type WorkspaceMemberNewCardPageProps = WithPolicyAndFullscreenLoadingProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBER_NEW_CARD>;

function WorkspaceMemberNewCardPage({route, personalDetails}: WorkspaceMemberNewCardPageProps) {
    const {policyID} = route.params;
    const policy = getPolicy(policyID);
    const workspaceAccountID = policy?.workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID;

    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useThemeIllustrations();
    const [cardFeeds] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`);
    const [selectedFeed, setSelectedFeed] = useState('');
    const [shouldShowError, setShouldShowError] = useState(false);
    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}`);

    const accountID = Number(route.params.accountID);
    const memberLogin = personalDetails?.[accountID]?.login ?? '';
    const memberName = personalDetails?.[accountID]?.firstName ? personalDetails?.[accountID]?.firstName : personalDetails?.[accountID]?.login;
    const companyFeeds = getCompanyFeeds(cardFeeds, false, true);
    const isFeedExpired = isSelectedFeedExpired((selectedFeed as CompanyCardFeed) ? cardFeeds?.settings?.oAuthAccountDetails?.[selectedFeed as CompanyCardFeed] : undefined);

    const [list] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${selectedFeed}`, {selector: filterInactiveCards});
    const filteredCardList = getFilteredCardList(list, cardFeeds?.settings?.oAuthAccountDetails?.[selectedFeed as CompanyCardFeed]);

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
                policyID,
            });
            Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW.getRoute(policyID, ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID)));
        } else {
            const data: Partial<AssignCardData> = {
                email: memberLogin,
                bankName: selectedFeed,
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
                Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD.getRoute(policyID, selectedFeed, ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID))),
            );
        }
    };

    const handleSelectFeed = (feed: CardFeedListItem) => {
        setSelectedFeed(feed.value);
        const hasAllCardsData = hasCardListObject(workspaceAccountID, feed.value as CompanyCardFeed);
        if (isCustomFeed(feed.value as CompanyCardFeed) && !hasAllCardsData) {
            openAssignFeedCardPage(policyID, feed.value as CompanyCardFeed, workspaceAccountID);
        }
        setShouldShowError(false);
    };

    const companyCardFeeds: CardFeedListItem[] = (Object.keys(companyFeeds) as CompanyCardFeed[]).map((key) => ({
        value: key,
        text: getCustomOrFormattedFeedName(key, cardFeeds?.settings?.companyCardNicknames),
        keyForList: key,
        isDisabled: companyFeeds[key]?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
        pendingAction: companyFeeds[key]?.pendingAction,
        isSelected: selectedFeed === key,
        leftElement: (
            <Icon
                src={getCardFeedIcon(key, illustrations)}
                height={variables.cardIconHeight}
                width={variables.cardIconWidth}
                additionalStyles={[styles.mr3, styles.cardIcon]}
            />
        ),
    }));

    const feeds = shouldShowExpensifyCard
        ? [
              ...companyCardFeeds,
              {
                  value: CONST.EXPENSIFY_CARD.NAME,
                  text: translate('workspace.common.expensifyCard'),
                  keyForList: CONST.EXPENSIFY_CARD.NAME,
                  isSelected: selectedFeed === CONST.EXPENSIFY_CARD.NAME,
                  leftElement: (
                      <Icon
                          src={ExpensifyCardImage}
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
                testID={WorkspaceMemberNewCardPage.displayName}
                shouldEnablePickerAvoiding={false}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.companyCards.selectCards')}
                    onBackButtonPress={goBack}
                />
                <SelectionList
                    ListItem={RadioListItem}
                    onSelectRow={handleSelectFeed}
                    sections={[{data: feeds}]}
                    shouldUpdateFocusedIndex
                    isAlternateTextMultilineSupported
                />
                <FormAlertWithSubmitButton
                    containerStyles={styles.p5}
                    isAlertVisible={shouldShowError}
                    onSubmit={handleSubmit}
                    message={translate('common.error.pleaseSelectOne')}
                    buttonText={translate('common.next')}
                    isLoading={!!cardFeeds?.isLoading}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceMemberNewCardPage.displayName = 'WorkspaceMemberNewCardPage';

export default withPolicyAndFullscreenLoading(WorkspaceMemberNewCardPage);
