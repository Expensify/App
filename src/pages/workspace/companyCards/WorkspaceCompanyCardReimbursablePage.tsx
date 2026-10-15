import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import Text from '@components/Text';

import useCardFeeds from '@hooks/useCardFeeds';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';

import {clearErrorField, setFeedReimbursable} from '@libs/actions/CompanyCards';
import {getCompanyCardFeed, getCompanyFeeds, getDomainOrWorkspaceAccountID, getSelectedFeed} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {FeedReimbursable} from '@src/types/onyx/CardFeeds';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React, {useCallback, useMemo, useState} from 'react';

type WorkspaceCompanyCardReimbursablePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_SETTINGS_REIMBURSABLE>;

type SelectableFeedReimbursable = Exclude<FeedReimbursable, typeof CONST.COMPANY_CARDS.FEED_REIMBURSABLE_LEGACY_NONE>;

/** A missing value behaves as force_no and the legacy `none` value behaves as default_no */
function getEffectiveFeedReimbursable(value: FeedReimbursable | undefined): SelectableFeedReimbursable {
    if (!value) {
        return CONST.COMPANY_CARDS.FEED_REIMBURSABLE.FORCE_NO;
    }
    if (value === CONST.COMPANY_CARDS.FEED_REIMBURSABLE_LEGACY_NONE) {
        return CONST.COMPANY_CARDS.FEED_REIMBURSABLE.DEFAULT_NO;
    }
    return value;
}

function WorkspaceCompanyCardReimbursablePage({
    route: {
        params: {policyID},
    },
}: WorkspaceCompanyCardReimbursablePageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [lastSelectedFeed, lastSelectedFeedResult] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${policyID}`);
    const [cardFeeds, cardFeedsResult] = useCardFeeds(policyID);
    const selectedFeed = getSelectedFeed(lastSelectedFeed, cardFeeds);
    const feed = selectedFeed ? getCompanyCardFeed(selectedFeed) : undefined;
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const companyFeeds = getCompanyFeeds(cardFeeds);
    const selectedFeedData = selectedFeed ? companyFeeds[selectedFeed] : undefined;
    const domainOrWorkspaceAccountID = getDomainOrWorkspaceAccountID(workspaceAccountID, selectedFeedData);
    const storedValue = selectedFeedData?.forceReimbursable;
    const currentValue = getEffectiveFeedReimbursable(storedValue);

    const [draftValue, setDraftValue] = useState<SelectableFeedReimbursable>();
    const selectedValue = draftValue ?? currentValue;

    const options = Object.values(CONST.COMPANY_CARDS.FEED_REIMBURSABLE).map((value) => ({
        text: translate(`workspace.companyCards.reimbursable.${value}`),
        alternateText: translate(`workspace.companyCards.reimbursable.${value}Description`),
        value,
        isSelected: selectedValue === value,
        keyForList: value,
    }));

    const goBack = useCallback(() => {
        Navigation.goBack(ROUTES.WORKSPACE_COMPANY_CARDS_SETTINGS.getRoute(policyID));
    }, [policyID]);

    const saveAndGoBack = useCallback(() => {
        // Don't rewrite the stored value (including legacy `none`) unless the admin picked a different option
        if (feed && selectedValue !== currentValue) {
            setFeedReimbursable(policyID, feed, domainOrWorkspaceAccountID, selectedValue, storedValue);
        }
        goBack();
    }, [feed, selectedValue, currentValue, policyID, domainOrWorkspaceAccountID, storedValue, goBack]);

    const confirmButtonOptions = useMemo(
        () => ({
            showButton: true,
            text: translate('common.save'),
            onConfirm: saveAndGoBack,
        }),
        [saveAndGoBack, translate],
    );

    const clearError = () => {
        if (!feed) {
            return;
        }
        clearErrorField(feed, domainOrWorkspaceAccountID, 'forceReimbursable');
    };

    if (isLoadingOnyxValue(cardFeedsResult) || isLoadingOnyxValue(lastSelectedFeedResult)) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.COMPANY_CARDS}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                testID="WorkspaceCompanyCardReimbursablePage"
            >
                <HeaderWithBackButtonAndTitle
                    title={translate('workspace.companyCards.reimbursable.title')}
                    onBackButtonPress={goBack}
                />
                <Text style={[styles.flexRow, styles.alignItemsCenter, styles.mt3, styles.mh5, styles.mb5]}>
                    <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.companyCards.reimbursable.description')}</Text>
                </Text>
                <OfflineWithFeedback
                    pendingAction={selectedFeedData?.pendingFields?.forceReimbursable}
                    errors={selectedFeedData?.errorFields?.forceReimbursable}
                    onClose={clearError}
                    errorRowStyles={[styles.mh5, styles.mb3]}
                    style={styles.flex1}
                    contentContainerStyle={styles.flex1}
                >
                    <SelectionList
                        data={options}
                        ListItem={SingleSelectListItem}
                        onSelectRow={(item) => setDraftValue(item.value)}
                        confirmButtonOptions={confirmButtonOptions}
                        shouldSingleExecuteRowSelect
                        style={{containerStyle: styles.pt3}}
                        initiallyFocusedItemKey={currentValue}
                        addBottomSafeAreaPadding
                    />
                </OfflineWithFeedback>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceCompanyCardReimbursablePage;
