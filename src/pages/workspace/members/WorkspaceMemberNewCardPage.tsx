import type {StackScreenProps} from '@react-navigation/stack';
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
import useThemeStyles from '@hooks/useThemeStyles';
import * as CardUtils from '@libs/CardUtils';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as PolicyUtils from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import variables from '@styles/variables';
import * as Card from '@userActions/Card';
import * as CompanyCards from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {CompanyCardFeed} from '@src/types/onyx';

type CardFeedListItem = ListItem & {
    /** Card feed value */
    value: string;
};

type WorkspaceMemberNewCardPageProps = WithPolicyAndFullscreenLoadingProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBER_NEW_CARD>;

function WorkspaceMemberNewCardPage({route, personalDetails}: WorkspaceMemberNewCardPageProps) {
    const {policyID} = route.params;
    const workspaceAccountID = PolicyUtils.getWorkspaceAccountID(policyID);

    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [cardFeeds] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`);
    const [selectedFeed, setSelectedFeed] = useState('');
    const [shouldShowError, setShouldShowError] = useState(false);

    const accountID = Number(route.params.accountID);
    const memberLogin = personalDetails?.[accountID]?.login ?? '';

    const handleSubmit = () => {
        if (!selectedFeed) {
            setShouldShowError(true);
            return;
        }
        if (selectedFeed === CONST.EXPENSIFY_CARD.NAME) {
            const activeRoute = Navigation.getActiveRoute();

            Card.setIssueNewCardStepAndData({
                step: CONST.EXPENSIFY_CARD.STEP.CARD_TYPE,
                data: {
                    assigneeEmail: memberLogin,
                },
                isEditing: false,
            });
            Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW.getRoute(policyID, activeRoute));
        } else {
            CompanyCards.setAssignCardStepAndData({
                currentStep: CONST.COMPANY_CARD.STEP.CARD,
                data: {
                    email: memberLogin,
                },
                isEditing: false,
            });
            Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD.getRoute(policyID, selectedFeed));
        }
    };

    const handleSelectFeed = (feed: CardFeedListItem) => {
        setSelectedFeed(feed.value);
        setShouldShowError(false);
    };

    const companyCardFeeds: CardFeedListItem[] = Object.keys(cardFeeds?.settings?.companyCards ?? {}).map((key) => ({
        value: key,
        text: cardFeeds?.settings?.companyCardNicknames?.[key] ?? translate(`workspace.companyCards.addNewCard.cardProviders.${key as CompanyCardFeed}`),
        keyForList: key,
        isSelected: selectedFeed === key,
        leftElement: (
            <Icon
                src={CardUtils.getCardFeedIcon(key)}
                height={variables.iconSizeExtraLarge}
                width={variables.iconSizeExtraLarge}
                additionalStyles={styles.mr3}
            />
        ),
    }));

    const feeds = workspaceAccountID
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
                    title={translate('workspace.companyCards.selectCardFeed')}
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
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceMemberNewCardPage.displayName = 'WorkspaceMemberNewCardPage';

export default withPolicyAndFullscreenLoading(WorkspaceMemberNewCardPage);
