import {render} from '@testing-library/react-native';
import React from 'react';
import FollowupListSkeleton from '@components/ReportActionItem/FollowupListSkeleton';

// SkeletonViewContentLoader renders react-content-loader internally, which mounts
// SVG elements. Stub it to a plain View so this test stays focused on:
// (1) the component mounts without throwing
// (2) the telemetry span hook (useSkeletonSpan) executes its mount/unmount
//     side effects, which is what we care about for the "stuck skeleton" alert path.
jest.mock('@components/SkeletonViewContentLoader', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports
    const {View} = require('react-native');
    return ({children}: {children?: React.ReactNode}) => <View testID="MockedSkeletonViewContentLoader">{children}</View>;
});

jest.mock('@components/SkeletonRect', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports
    const {View} = require('react-native');
    return () => <View testID="MockedSkeletonRect" />;
});

// Capture the telemetry-span invocation so we can assert the namespacing contract
const mockUseSkeletonSpan = jest.fn();
jest.mock('@libs/telemetry/useSkeletonSpan', () => ({
    __esModule: true,
    default: (component: string, reasonAttributes: Record<string, unknown>) => mockUseSkeletonSpan(component, reasonAttributes),
}));

describe('FollowupListSkeleton', () => {
    beforeEach(() => {
        mockUseSkeletonSpan.mockReset();
    });

    it('renders one skeleton container per followup bar', () => {
        const {getAllByTestId} = render(<FollowupListSkeleton />);

        // 3 bars — matches BAR_COUNT and the server-returned followup count.
        // Each bar is its own SkeletonViewContentLoader wrapping a single SkeletonRect,
        // so the two counts move together.
        expect(getAllByTestId('MockedSkeletonViewContentLoader')).toHaveLength(3);
        expect(getAllByTestId('MockedSkeletonRect')).toHaveLength(3);
    });

    it('opens a telemetry span scoped to ChatActionableButtons so Sentry can alert on stuck skeletons', () => {
        render(<FollowupListSkeleton />);

        expect(mockUseSkeletonSpan).toHaveBeenCalledWith('FollowupListSkeleton', {context: 'ReportScreen.ChatActionableButtons'});
    });
});
