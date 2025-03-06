import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import HeaderGap from '@components/HeaderGap';
import MoneyReportHeader from '@components/MoneyReportHeader';
import BottomTabBar from '@components/Navigation/BottomTabBar';
import BOTTOM_TABS from '@components/Navigation/BottomTabBar/BOTTOM_TABS';
import TopBar from '@components/Navigation/TopBar';
import ScreenWrapper from '@components/ScreenWrapper';
import type {SearchQueryJSON} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
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
        <View style={styles.flex1}>
            <HeaderGap />
            <MoneyReportHeader
                report={report}
                policy={policy}
                reportActions={[]}
                transactionThreadReportID={undefined}
                onBackButtonPress={() => {}}
            />
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
