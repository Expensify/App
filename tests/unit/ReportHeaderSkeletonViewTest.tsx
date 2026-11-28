import {render, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import ReportHeaderSkeletonView from '@components/ReportHeaderSkeletonView';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useVerticalBarBackButton from '@hooks/useVerticalBarBackButton';

import React from 'react';

import createMock from '../utils/createMock';
import {translateLocal} from '../utils/TestHelper';

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@hooks/useVerticalBarBackButton', () => jest.fn());

const mockUseResponsiveLayout = jest.mocked(useResponsiveLayout);
const mockUseVerticalBarBackButton = jest.mocked(useVerticalBarBackButton);

function renderSkeleton(goBack: () => void) {
    return render(
        <LocaleContextProvider>
            <ReportHeaderSkeletonView
                shouldAnimate={false}
                onBackButtonPress={goBack}
            />
        </LocaleContextProvider>,
    );
}

describe('ReportHeaderSkeletonView', () => {
    beforeEach(() => {
        mockUseResponsiveLayout.mockReturnValue(createMock<ReturnType<typeof useResponsiveLayout>>({shouldUseNarrowLayout: true}));
        mockUseVerticalBarBackButton.mockReturnValue(false);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('shows its own back button on a narrow layout while the window has no vertical bar', () => {
        // Given a narrow layout, where the header that the skeleton stands in for has a back button, and no vertical bar
        const goBack = jest.fn();

        // When the skeleton is rendered
        renderSkeleton(goBack);

        // Then it offers its back button to the vertical bar with the handler it was given, and draws the button
        // itself because the bar did not take it
        expect(mockUseVerticalBarBackButton).toHaveBeenLastCalledWith(goBack, true);
        expect(screen.getByLabelText(translateLocal('common.back'))).toBeOnTheScreen();
    });

    it('leaves its own back button out while the vertical bar of a foldable iPhone has it', () => {
        // Given a narrow layout on a foldable iPhone, where the vertical bar takes the back button of a header
        mockUseVerticalBarBackButton.mockReturnValue(true);

        // When the skeleton is rendered
        renderSkeleton(jest.fn());

        // Then it draws no back button, so the loading header shows one button, the same as the header that follows it
        expect(screen.queryByLabelText(translateLocal('common.back'))).not.toBeOnTheScreen();
    });

    it('asks for no back button in the vertical bar on a wide layout, where it has none', () => {
        // Given a wide layout, where the header that the skeleton stands in for has no back button
        mockUseResponsiveLayout.mockReturnValue(createMock<ReturnType<typeof useResponsiveLayout>>({shouldUseNarrowLayout: false}));
        const goBack = jest.fn();

        // When the skeleton is rendered
        renderSkeleton(goBack);

        // Then it tells the vertical bar that it has no back button, so none appears there, and draws none itself
        expect(mockUseVerticalBarBackButton).toHaveBeenLastCalledWith(goBack, false);
        expect(screen.queryByLabelText(translateLocal('common.back'))).not.toBeOnTheScreen();
    });
});
