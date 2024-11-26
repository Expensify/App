import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import CaretWrapper from '@components/CaretWrapper';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CardUtils from '@libs/CardUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import variables from '@styles/variables';
import * as CompanyCards from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {CompanyCardFeed} from '@src/types/onyx';
import type {AssignCardData, AssignCardStep} from '@src/types/onyx/AssignCard';

type WorkspaceCompanyCardsListHeaderButtonsProps = {
    /** Current policy id */
    policyID: string;

    /** Currently selected feed */
    selectedFeed: CompanyCardFeed;
};

function WorkspaceCompanyCardsListHeaderButtons({policyID, selectedFeed}: WorkspaceCompanyCardsListHeaderButtonsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const theme = useTheme();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const workspaceAccountID = PolicyUtils.getWorkspaceAccountID(policyID);
    const [cardFeeds] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`);
    const shouldChangeLayout = isMediumScreenWidth || shouldUseNarrowLayout;
    const feedName = CardUtils.getCardFeedName(selectedFeed);
    const formattedFeedName = translate('workspace.companyCards.feedName', {feedName});
    const isCustomFeed = CardUtils.isCustomFeed(selectedFeed);
    const companyFeeds = CardUtils.getCompanyFeeds(cardFeeds);
    const currentFeedData = companyFeeds?.[selectedFeed];
    const policy = PolicyUtils.getPolicy(policyID);

    const [list] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${selectedFeed}`);
    const filteredCardList = CardUtils.getFilteredCardList(list);

    const handleAssignCard = () => {
        const data: Partial<AssignCardData> = {
            bankName: selectedFeed,
        };

        let currentStep: AssignCardStep = CONST.COMPANY_CARD.STEP.ASSIGNEE;

        if (Object.keys(policy?.employeeList ?? {}).length === 1) {
            const userEmail = Object.keys(policy?.employeeList ?? {}).at(0) ?? '';
            data.email = userEmail;
            const personalDetails = PersonalDetailsUtils.getPersonalDetailByEmail(userEmail);
            const memberName = personalDetails?.firstName ? personalDetails.firstName : personalDetails?.login;
            data.cardName = `${memberName}'s card`;
            currentStep = CONST.COMPANY_CARD.STEP.CARD;

            if (CardUtils.hasOnlyOneCardToAssign(filteredCardList)) {
                currentStep = CONST.COMPANY_CARD.STEP.TRANSACTION_START_DATE;
                data.cardNumber = Object.keys(filteredCardList).at(0);
                data.encryptedCardNumber = Object.values(filteredCardList).at(0);
            }
        }

        CompanyCards.setAssignCardStepAndData({data, currentStep});
        Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD.getRoute(policyID, selectedFeed)));
    };

    return (
        <OfflineWithFeedback
            errors={currentFeedData?.errors}
            canDismissError={false}
            errorRowStyles={styles.ph5}
        >
            <View style={[styles.w100, styles.ph5, !shouldChangeLayout ? [styles.pv2, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween] : styles.pb2]}>
                <PressableWithFeedback
                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_SELECT_FEED.getRoute(policyID))}
                    style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, shouldChangeLayout && styles.mb3]}
                    accessibilityLabel={formattedFeedName}
                >
                    <Icon
                        src={CardUtils.getCardFeedIcon(selectedFeed)}
                        height={variables.cardIconHeight}
                        width={variables.cardIconWidth}
                        additionalStyles={styles.cardIcon}
                    />
                    <View>
                        <View style={[styles.flexRow, styles.gap1]}>
                            <CaretWrapper>
                                <Text style={styles.textStrong}>{formattedFeedName}</Text>
                            </CaretWrapper>
                            {PolicyUtils.hasPolicyFeedsError(companyFeeds, selectedFeed) && (
                                <Icon
                                    src={Expensicons.DotIndicator}
                                    fill={theme.danger}
                                />
                            )}
                        </View>
                        <Text style={styles.textLabelSupporting}>{translate(isCustomFeed ? 'workspace.companyCards.customFeed' : 'workspace.companyCards.directFeed')}</Text>
                    </View>
                </PressableWithFeedback>

                <View style={[styles.flexRow, styles.gap2]}>
                    <Button
                        success
                        isDisabled={!currentFeedData || !!currentFeedData?.pending || !!currentFeedData?.errors}
                        onPress={handleAssignCard}
                        icon={Expensicons.Plus}
                        text={translate('workspace.companyCards.assignCard')}
                        style={shouldChangeLayout && styles.flex1}
                    />
                    <Button
                        onPress={() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_SETTINGS.getRoute(policyID))}
                        icon={Expensicons.Gear}
                        text={translate('common.settings')}
                        style={shouldChangeLayout && styles.flex1}
                    />
                </View>
            </View>
        </OfflineWithFeedback>
    );
}

WorkspaceCompanyCardsListHeaderButtons.displayName = 'WorkspaceCompanyCardsListHeaderButtons';

export default WorkspaceCompanyCardsListHeaderButtons;
