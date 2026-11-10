import {render, screen} from '@testing-library/react-native';

import ReportActionsSkeletonCover, {ReportActionsAnimatedSkeletonCover} from '@components/ReportActionsSkeletonCover';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';

import React from 'react';

jest.mock('@components/ReportActionsSkeletonView', () => jest.fn(() => null));

const mockReportActionsSkeletonView = jest.mocked(ReportActionsSkeletonView);

describe('ReportActionsSkeletonCover', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('fills, clips, and bottom-aligns the static report-actions skeleton', () => {
        render(<ReportActionsSkeletonCover />);

        expect(screen.getByTestId('ReportActionsSkeletonCover')).toHaveStyle({
            flex: 1,
            overflow: 'hidden',
            justifyContent: 'flex-end',
            paddingBottom: 16,
        });
        expect(mockReportActionsSkeletonView).toHaveBeenCalledTimes(1);
        expect(mockReportActionsSkeletonView.mock.calls.at(-1)?.at(0)).toEqual(expect.objectContaining({shouldAnimate: false}));
    });

    it('fills the report-actions viewport with an animated skeleton', () => {
        render(<ReportActionsAnimatedSkeletonCover />);

        expect(screen.getByTestId('ReportActionsSkeletonCover')).toBeTruthy();
        expect(mockReportActionsSkeletonView).toHaveBeenCalledTimes(1);
        expect(mockReportActionsSkeletonView.mock.calls.at(-1)?.at(0)).toEqual(expect.objectContaining({shouldAnimate: true}));
    });
});
