import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import CaretWrapper from '@components/CaretWrapper';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getBankName, getCardFeedIcon, getCompanyFeeds, getCustomOrFormattedFeedName, isCustomFeed} from '@libs/CardUtils';
import {getWorkspaceAccountID} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import variables from '@styles/variables';
import {checkIfFeedConnectionIsBroken, flatAllCardsList} from '@userActions/CompanyCards';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {CompanyCardFeed} from '@src/types/onyx';

type WorkspaceCompanyCardsListHeaderButtonsProps = {
    /** Current policy id */
    policyID: string;

    /** Currently selected feed */
    selectedFeed: CompanyCardFeed;

    /** Whether to show assign card button */
    shouldShowAssignCardButton?: boolean;

    /** Handle assign card action */
    handleAssignCard: () => void;
};

function WorkspaceCompanyCardsListHeaderButtons({policyID, selectedFeed, shouldShowAssignCardButton, handleAssignCard}: WorkspaceCompanyCardsListHeaderButtonsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const workspaceAccountID = getWorkspaceAccountID(policyID);
    const [cardFeeds] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`);
    const [allFeedsCards] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}`);
    const shouldChangeLayout = isMediumScreenWidth || shouldUseNarrowLayout;
    const formattedFeedName = getCustomOrFormattedFeedName(selectedFeed, cardFeeds?.settings?.companyCardNicknames);
    const isSelectedFeedCustom = isCustomFeed(selectedFeed);
    const companyFeeds = getCompanyFeeds(cardFeeds);
    const currentFeedData = companyFeeds?.[selectedFeed];
    const bankName = getBankName(selectedFeed);
    const isSelectedFeedConnectionBroken = checkIfFeedConnectionIsBroken(allFeedsCards?.[`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${selectedFeed}`]);

    return (
        <View>
            <View style={[styles.w100, styles.ph5, !shouldChangeLayout ? [styles.pv2, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween] : styles.pb2]}>
                <PressableWithFeedback
                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_SELECT_FEED.getRoute(policyID))}
                    style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, shouldChangeLayout && styles.mb3]}
                    accessibilityLabel={formattedFeedName ?? ''}
                >
                    <Icon
                        src={getCardFeedIcon(selectedFeed)}
                        height={variables.cardIconHeight}
                        width={variables.cardIconWidth}
                        additionalStyles={styles.cardIcon}
                    />
                    <View>
                        <View style={[styles.flexRow, styles.gap1]}>
                            <CaretWrapper>
                                <Text style={styles.textStrong}>{formattedFeedName}</Text>
                            </CaretWrapper>
                            {checkIfFeedConnectionIsBroken(flatAllCardsList(allFeedsCards, workspaceAccountID), selectedFeed) && (
                                <Icon
                                    src={Expensicons.DotIndicator}
                                    fill={theme.danger}
                                />
                            )}
                        </View>
                        <Text style={styles.textLabelSupporting}>{translate(isSelectedFeedCustom ? 'workspace.companyCards.customFeed' : 'workspace.companyCards.directFeed')}</Text>
                    </View>
                </PressableWithFeedback>

                <View style={[styles.flexRow, styles.gap2]}>
                    {!!shouldShowAssignCardButton && (
                        <Button
                            success
                            isDisabled={!currentFeedData || !!currentFeedData?.pending || isSelectedFeedConnectionBroken}
                            onPress={handleAssignCard}
                            icon={Expensicons.Plus}
                            text={translate('workspace.companyCards.assignCard')}
                            style={shouldChangeLayout && styles.flex1}
                        />
                    )}
                    <Button
                        onPress={() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_SETTINGS.getRoute(policyID))}
                        icon={Expensicons.Gear}
                        text={translate('common.settings')}
                        style={shouldChangeLayout && styles.flex1}
                    />
                </View>
            </View>
            {isSelectedFeedConnectionBroken && !!bankName && (
                <View style={[styles.flexRow, styles.ph5]}>
                    <Icon
                        src={Expensicons.DotIndicator}
                        fill={theme.danger}
                        additionalStyles={styles.mr1}
                    />
                    <Text style={styles.offlineFeedback.text}>
                        <Text style={[StyleUtils.getDotIndicatorTextStyles(true)]}>{translate('workspace.companyCards.brokenConnectionErrorFirstPart')}</Text>
                        <TextLink
                            style={[StyleUtils.getDotIndicatorTextStyles(), styles.link]}
                            onPress={() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_BANK_CONNECTION.getRoute(policyID, bankName, Navigation.getActiveRoute()))}
                        >
                            {translate('workspace.companyCards.brokenConnectionErrorLink')}
                        </TextLink>
                        <Text style={[StyleUtils.getDotIndicatorTextStyles(true)]}>{translate('workspace.companyCards.brokenConnectionErrorSecondPart')}</Text>
                    </Text>
                </View>
            )}
        </View>
    );
}

WorkspaceCompanyCardsListHeaderButtons.displayName = 'WorkspaceCompanyCardsListHeaderButtons';

export default WorkspaceCompanyCardsListHeaderButtons;
