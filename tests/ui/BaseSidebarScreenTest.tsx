import {render, screen} from '@testing-library/react-native';

import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import BaseSidebarScreen from '@pages/inbox/sidebar/BaseSidebarScreen';
import SidebarLinksData from '@pages/inbox/sidebar/SidebarLinksData';

import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@hooks/useResponsiveLayout', () => jest.fn());

// The ScreenWrapper uses a render-prop that receives insets; render its children with stub insets so the
// branch we care about (skeleton vs. SidebarLinksData) is exercised without the full wrapper machinery.
jest.mock('@components/ScreenWrapper', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    function MockScreenWrapper({children}: {children: (args: {insets: {top: number; bottom: number; left: number; right: number}}) => React.ReactNode}) {
        return ReactModule.createElement(ReactModule.Fragment, null, children({insets: {top: 0, bottom: 0, left: 0, right: 0}}));
    }
    return MockScreenWrapper;
});
jest.mock('@components/Navigation/TopBarWithLoadingBar', () => jest.fn(() => null));
jest.mock('@components/Navigation/TabBarBottomContent', () => jest.fn(() => null));
jest.mock('@pages/inbox/sidebar/InboxTabSelector', () => jest.fn(() => null));
// The children are mocked so the test asserts only the outer skeleton branching, not the list internals.
// The skeleton view is stubbed with a testID so it can be observed without rendering the SVG skeleton.
jest.mock('@components/OptionsListSkeletonView', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    const {View} = jest.requireActual<typeof import('react-native')>('react-native');
    return jest.fn(() => ReactModule.createElement(View, {testID: 'OptionsListSkeletonView'}));
});
jest.mock('@pages/inbox/sidebar/SidebarLinksData', () => jest.fn(() => null));

const mockUseOnyx: jest.Mock = jest.mocked(useOnyx);
const mockUseResponsiveLayout = useResponsiveLayout as jest.MockedFunction<typeof useResponsiveLayout>;
const mockSidebarLinksData = SidebarLinksData as jest.MockedFunction<typeof SidebarLinksData>;

/** Builds the keyed useOnyx mock BaseSidebarScreen reads: IS_LOADING_APP and the REPORT collection (via selector). */
const setupUseOnyx = (options: {isLoadingApp?: boolean; hasReportData?: boolean} = {}) => {
    const isLoadingApp = options.isLoadingApp ?? false;
    const hasReportData = options.hasReportData ?? false;
    mockUseOnyx.mockImplementation((key: string, onyxOptions?: {selector?: (value: unknown) => unknown}) => {
        if (key === ONYXKEYS.IS_LOADING_APP) {
            return [isLoadingApp, {status: 'loaded'}];
        }
        if (key === ONYXKEYS.COLLECTION.REPORT) {
            // BaseSidebarScreen passes a selector that reduces the collection to a boolean. Feed it a
            // representative collection so the real selector produces the value under test.
            const reports = hasReportData ? {[`${ONYXKEYS.COLLECTION.REPORT}1`]: {reportID: '1'} as OnyxTypes.Report} : {};
            const value = onyxOptions?.selector ? onyxOptions.selector(reports) : reports;
            return [value, {status: 'loaded'}];
        }
        return [undefined, {status: 'loaded'}];
    });
};

describe('BaseSidebarScreen (outer skeleton gate)', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseResponsiveLayout.mockReturnValue({shouldUseNarrowLayout: false} as ReturnType<typeof useResponsiveLayout>);
        setupUseOnyx();
    });

    afterEach(async () => {
        await waitForBatchedUpdatesWithAct();
        await Onyx.clear();
    });

    it('shows the full-page skeleton on a cold load with no cached reports', () => {
        setupUseOnyx({isLoadingApp: true, hasReportData: false});

        render(<BaseSidebarScreen />);

        expect(screen.getByTestId('OptionsListSkeletonView')).toBeTruthy();
        expect(mockSidebarLinksData).not.toHaveBeenCalled();
    });

    it('does not show the full-page skeleton when reports are already cached, even while the app is loading', () => {
        setupUseOnyx({isLoadingApp: true, hasReportData: true});

        render(<BaseSidebarScreen />);

        expect(screen.queryByTestId('OptionsListSkeletonView')).toBeNull();
        expect(mockSidebarLinksData).toHaveBeenCalled();
    });

    it('mounts SidebarLinksData once the app has finished loading', () => {
        setupUseOnyx({isLoadingApp: false, hasReportData: true});

        render(<BaseSidebarScreen />);

        expect(screen.queryByTestId('OptionsListSkeletonView')).toBeNull();
        expect(mockSidebarLinksData).toHaveBeenCalled();
    });
});
