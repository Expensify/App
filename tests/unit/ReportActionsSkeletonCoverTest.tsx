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

    it('fills, clips, and bottom-aligns the report-actions skeleton', () => {
        render(
            <ReportActionsSkeletonCover>
                <ReportActionsSkeletonView shouldAnimate={false} />
            </ReportActionsSkeletonCover>,
        );

        expect(screen.getByTestId('ReportActionsSkeletonCover')).toHaveStyle({
            flex: 1,
            overflow: 'hidden',
            justifyContent: 'flex-end',
            paddingBottom: 16,
        });
        expect(mockReportActionsSkeletonView.mock.calls.at(-1)?.at(0)).toEqual(expect.objectContaining({shouldAnimate: false}));
    });

    it('accepts additional presentation styles', () => {
        render(<ReportActionsSkeletonCover style={{position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 10}} />);

        expect(screen.getByTestId('ReportActionsSkeletonCover')).toHaveStyle({
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: 10,
        });
    });
});
