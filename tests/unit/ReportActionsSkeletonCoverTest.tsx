import {render, screen} from '@testing-library/react-native';

import ReportActionsSkeletonCover from '@components/ReportActionsSkeletonCover';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';

import React from 'react';

jest.mock('@components/ReportActionsSkeletonView', () => jest.fn(() => null));

const mockReportActionsSkeletonView = jest.mocked(ReportActionsSkeletonView);

describe('ReportActionsSkeletonCover', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('fills, clips, and bottom-aligns the default report-actions skeleton', () => {
        render(<ReportActionsSkeletonCover />);

        expect(screen.getByTestId('ReportActionsSkeletonCover')).toHaveStyle({
            flex: 1,
            overflow: 'hidden',
            justifyContent: 'flex-end',
            paddingBottom: 16,
        });
        expect(mockReportActionsSkeletonView).toHaveBeenCalledTimes(1);
    });

    it('accepts a static report-actions skeleton as its content', () => {
        render(
            <ReportActionsSkeletonCover>
                <ReportActionsSkeletonView shouldAnimate={false} />
            </ReportActionsSkeletonCover>,
        );

        expect(mockReportActionsSkeletonView.mock.calls.at(-1)?.at(0)).toEqual(expect.objectContaining({shouldAnimate: false}));
    });
});
