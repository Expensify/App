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
import * as PolicyUtils from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {CompanyCardFeed} from '@src/types/onyx';

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
    const isCustomFeed =
        CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD === selectedFeed || CONST.COMPANY_CARD.FEED_BANK_NAME.VISA === selectedFeed || CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX === selectedFeed;
    const currentFeedData = cardFeeds?.settings?.companyCards?.[selectedFeed] ?? cardFeeds?.settings?.oAuthAccountDetails?.[selectedFeed] ?? {pending: true, errors: {}};

    return (
        <OfflineWithFeedback
            errors={cardFeeds?.settings?.companyCards?.[selectedFeed]?.errors}
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
                        width={variables.iconSizeExtraLarge}
                        height={variables.iconSizeExtraLarge}
                    />
                    <View>
                        <View style={[styles.flexRow, styles.gap1]}>
                            <CaretWrapper>
                                <Text style={styles.textStrong}>{formattedFeedName}</Text>
                            </CaretWrapper>
                            {PolicyUtils.hasPolicyFeedsError(cardFeeds?.settings?.companyCards ?? {}, selectedFeed) && (
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
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        isDisabled={currentFeedData.pending || !!currentFeedData.errors}
                        onPress={() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD.getRoute(policyID, selectedFeed))}
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
