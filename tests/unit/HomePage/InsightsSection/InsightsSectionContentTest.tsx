import {render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {openPolicyTagsPage} from '@libs/actions/Policy/Tag';
import {INSIGHTS_CHART_STATE} from '@libs/resolveInsightsChartData';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import InsightsSectionContent from '@pages/home/InsightsSection/InsightsSectionContent';
import useInsightData from '@pages/home/InsightsSection/useInsightData';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {View} from 'react-native';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../../utils/collections/policies';
import waitForBatchedUpdatesWithAct from '../../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/actions/Policy/Tag', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/actions/Policy/Tag'),
    openPolicyTagsPage: jest.fn(),
}));
jest.mock('@libs/DeviceCapabilities', () => ({canUseTouchScreen: jest.fn(() => false)}));
jest.mock('@components/Search/SearchChartView', () => jest.fn(() => null));
jest.mock('@components/WidgetHeaderMenu', () => jest.fn(() => null));
jest.mock('@components/WidgetContainer', () => {
    const {View: MockView} = jest.requireActual<{View: typeof View}>('react-native');
    return ({children}: React.PropsWithChildren) => <MockView testID="insightsWidget">{children}</MockView>;
});
jest.mock('@pages/home/InsightsSection/InsightTitleDropdown', () => jest.fn(() => null));
jest.mock('@pages/home/InsightsSection/useInsightData', () => ({__esModule: true, default: jest.fn()}));

const mockUseInsightData = jest.mocked(useInsightData);

describe('InsightsSectionContent', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseInsightData.mockReturnValue({
            queryJSON: buildSearchQueryJSON('type:expense group-by:tag'),
            groupBy: CONST.SEARCH.GROUP_BY.TAG,
            view: CONST.SEARCH.VIEW.PIE,
            data: [],
            state: INSIGHTS_CHART_STATE.READY,
            retry: jest.fn(),
        });
    });

    afterEach(() => Onyx.clear());

    it('does not request tag lists for the workspaces in scope', async () => {
        // Given an admin of several tags-enabled workspaces, which is when the Spend insights can group by tag
        await Onyx.set(ONYXKEYS.SESSION, {email: 'admin@example.com', accountID: 1});
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}A1`, {...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM), id: 'A1', role: CONST.POLICY.ROLE.ADMIN, areTagsEnabled: true});
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}B2`, {...createRandomPolicy(2, CONST.POLICY.TYPE.TEAM), id: 'B2', role: CONST.POLICY.ROLE.ADMIN, areTagsEnabled: true});

        // When Home renders its insight widget
        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <InsightsSectionContent />
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the widget shows without a tag list read per workspace, since Home has no tag level picker to fill and
        // one read per workspace on every Home load is too costly for accounts with thousands of workspaces
        expect(screen.getByTestId('insightsWidget')).toBeTruthy();
        expect(openPolicyTagsPage).not.toHaveBeenCalled();
    });
});
