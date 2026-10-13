import {render, screen} from '@testing-library/react-native';

import ActivityIndicator from '@components/ActivityIndicator';
import ReportPDFDownloadModal from '@components/ReportPDFDownloadModal';

import useOnyx from '@hooks/useOnyx';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

jest.mock('@components/ActivityIndicator', () => jest.fn(() => null));
jest.mock('@components/Modal', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@libs/actions/Report', () => ({downloadReportPDF: jest.fn()}));
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({login: 'employee@mail.com'})));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));

const REPORT_ID = '1';

describe('ReportPDFDownloadModal', () => {
    const mockedUseOnyx = jest.mocked(useOnyx);
    const mockedActivityIndicator = jest.mocked(ActivityIndicator);

    const mockPDFFilename = (reportPDFFilename: string | undefined) => {
        (mockedUseOnyx as jest.Mock).mockImplementation((key: string) => {
            if (key === `${ONYXKEYS.COLLECTION.NVP_EXPENSIFY_REPORT_PDF_FILENAME}${REPORT_ID}`) {
                return [reportPDFFilename];
            }
            return [undefined];
        });
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderModal = () =>
        render(
            <ReportPDFDownloadModal
                reportID={REPORT_ID}
                isVisible
                onClose={jest.fn()}
            />,
        );

    it('shows the spinner while the PDF is still generating', () => {
        mockPDFFilename(undefined);

        renderModal();

        expect(screen.getByText('reportDetailsPage.waitForPDF')).toBeOnTheScreen();
        expect(mockedActivityIndicator).toHaveBeenCalled();
    });

    it('stops the spinner and offers a close button when the PDF generation fails', () => {
        mockPDFFilename(CONST.REPORT_DETAILS_MENU_ITEM.ERROR);

        renderModal();

        expect(screen.getByText('reportDetailsPage.errorPDF')).toBeOnTheScreen();
        expect(mockedActivityIndicator).not.toHaveBeenCalled();
        expect(screen.getByText('common.close')).toBeOnTheScreen();
    });

    it('stops the spinner and offers a download button once the PDF is ready', () => {
        mockPDFFilename('report.pdf');

        renderModal();

        expect(screen.getByText('reportDetailsPage.successPDF')).toBeOnTheScreen();
        expect(mockedActivityIndicator).not.toHaveBeenCalled();
        expect(screen.getByText('common.download')).toBeOnTheScreen();
    });
});
