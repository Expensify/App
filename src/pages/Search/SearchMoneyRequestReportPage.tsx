import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import EmptyStateComponent from '@components/EmptyStateComponent';
import HeaderGap from '@components/HeaderGap';
import LottieAnimations from '@components/LottieAnimations';
import MoneyReportHeader from '@components/MoneyReportHeader';
import BottomTabBar from '@components/Navigation/BottomTabBar';
import BOTTOM_TABS from '@components/Navigation/BottomTabBar/BOTTOM_TABS';
import TopBar from '@components/Navigation/TopBar';
import OfflineIndicator from '@components/OfflineIndicator';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import type {SearchQueryJSON} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import SearchTypeMenu from './SearchTypeMenu';

type SearchPageProps = PlatformStackScreenProps<SearchFullscreenNavigatorParamList, typeof SCREENS.SEARCH.MONEY_REQUEST_REPORT>;

// We will figure out later, when this view is actually being finalized, how to pass down an actual query
const tempJSONQuery = buildSearchQueryJSON('') as unknown as SearchQueryJSON;

type TemporaryMoneyRequestReportViewProps = {
    /** The report */
    report: OnyxEntry<OnyxTypes.Report>;

    /** The policy tied to the expense report */
    policy: OnyxEntry<OnyxTypes.Policy>;
};

// NOTE FOR KUBA:
// When https://github.com/Expensify/App/pull/58360 is merged we should use the empty state component in MoneyRequestReportTableHeader,
// for now it will be used in TemporaryMoneyRequestReportView.
function SearchMoneyRequestReportEmptyState() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <View style={styles.flex1}>
            <EmptyStateComponent
                cardStyles={[styles.appBG]}
                cardContentStyles={[styles.pt5, styles.pb0]}
                headerMediaType={CONST.EMPTY_STATE_MEDIA.ANIMATION}
                headerMedia={LottieAnimations.GenericEmptyState}
                title={translate('search.moneyRequestReport.emptyStateTitle')}
                subtitle={translate('search.moneyRequestReport.emptyStateSubtitle')}
                headerStyles={[styles.emptyStateCardIllustrationContainer, {maxHeight: 85, minHeight: 85}]}
                lottieWebViewStyles={styles.emptyStateFolderWebStyles}
                headerContentStyles={styles.emptyStateFolderWebStyles}
            />
        </View>
    );
}

// NOTE FOR KUBA:
// When the correct header is ready we will need to disable the buttons in case of offline/failure state
// and we will need to render Composer component and comment components conditionally in case of failure state
/**
 * TODO
 * This is a completely temporary component, displayed to:
 *  - show other devs that SearchMoneyRequestReportPage works
 *  - unblock work for other devs for Report Creation (https://github.com/Expensify/App/issues/57654)
 *
 *  This component is not displayed to any users.
 *  It will be removed once we fully implement SearchMoneyRequestReportPage (https://github.com/Expensify/App/issues/57508)
 */
function TemporaryMoneyRequestReportView({report, policy}: TemporaryMoneyRequestReportViewProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.flex1]}>
            <OfflineWithFeedback
                style={[styles.flex1]}
                contentContainerStyle={[styles.flex1]}
                pendingAction={report?.pendingAction}
                errors={report?.errorFields?.create}
                errorRowStyles={[styles.ph5, styles.pv3]}
                shouldShowErrorMessages
            >
                <HeaderGap />
                <MoneyReportHeader
                    report={report}
                    policy={policy}
                    reportActions={[]}
                    transactionThreadReportID={undefined}
                    onBackButtonPress={() => {
                        Navigation.goBack();
                    }}
                />
                {!report?.total && <SearchMoneyRequestReportEmptyState />}
            </OfflineWithFeedback>
            <OfflineIndicator containerStyles={[styles.m1]} />
        </View>
    );
}

function SearchMoneyRequestReportPage({route}: SearchPageProps) {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();

    const {reportID} = route.params;
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {allowStaleData: true});
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {allowStaleData: true, initialValue: {}});
    const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`];

    if (shouldUseNarrowLayout) {
        return (
            <ScreenWrapper
                testID={SearchMoneyRequestReportPage.displayName}
                shouldEnableMaxHeight
                shouldShowOfflineIndicator={false}
                offlineIndicatorStyle={styles.mtAuto}
                headerGapStyles={styles.searchHeaderGap}
            >
                <TemporaryMoneyRequestReportView
                    report={report}
                    policy={policy}
                />
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper
            testID={SearchMoneyRequestReportPage.displayName}
            shouldEnableMaxHeight
            offlineIndicatorStyle={styles.mtAuto}
            headerGapStyles={styles.searchHeaderGap}
        >
            <View style={styles.searchSplitContainer}>
                <View style={styles.searchSidebar}>
                    <View style={styles.flex1}>
                        <HeaderGap />
                        <TopBar
                            breadcrumbLabel={translate('common.reports')}
                            shouldDisplaySearch={false}
                        />
                        <SearchTypeMenu queryJSON={tempJSONQuery} />
                    </View>
                    <BottomTabBar selectedTab={BOTTOM_TABS.SEARCH} />
                </View>
                <TemporaryMoneyRequestReportView
                    report={report}
                    policy={policy}
                />
            </View>
        </ScreenWrapper>
    );
}

SearchMoneyRequestReportPage.displayName = 'SearchMoneyRequestReportPage';

export default SearchMoneyRequestReportPage;
