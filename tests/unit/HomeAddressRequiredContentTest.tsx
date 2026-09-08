import {render} from '@testing-library/react-native';

import {getReportActionHtml, getReportActionText} from '@libs/ReportActionsUtils';

import HomeAddressRequiredContent from '@pages/inbox/report/actionContents/HomeAddressRequiredContent';

import CONST from '@src/CONST';

import type {ReactNode} from 'react';

import createMock from '../utils/createMock';

const mockRenderHTML = jest.fn();

jest.mock('@components/RenderHTML', () => ({
    __esModule: true,
    default: ({html}: {html: string}) => {
        mockRenderHTML(html);
        return null;
    },
}));

jest.mock('@components/ReportActionItem/ActionableItemButtons', () => () => null);
jest.mock('@components/ButtonComposed', () => {
    function MockButton() {
        return null;
    }

    function MockButtonText() {
        return null;
    }

    return {__esModule: true, default: Object.assign(MockButton, {Text: MockButtonText})};
});
jest.mock('@pages/inbox/report/ReportActionItemBasicMessage', () => ({__esModule: true, default: ({children}: {children: ReactNode}) => children}));
jest.mock('@hooks/useLocalize', () => () => ({translate: jest.fn()}));
jest.mock('@libs/ReportActionsUtils', () => ({
    getOriginalMessage: jest.fn(),
    getReportActionHtml: jest.fn(),
    getReportActionText: jest.fn(),
}));

const mockReportAction = createMock<Parameters<typeof HomeAddressRequiredContent>[0]['action']>({actionName: CONST.REPORT.ACTIONS.TYPE.HOME_ADDRESS_REQUIRED});

describe('HomeAddressRequiredContent', () => {
    it('renders the home address link from the report action HTML', () => {
        jest.mocked(getReportActionHtml).mockReturnValue('Add your <a href="https://example.com">home address</a>.');

        render(<HomeAddressRequiredContent action={mockReportAction} />);

        expect(mockRenderHTML).toHaveBeenCalledWith('<comment><muted-text>Add your <a href="https://example.com">home address</a>.</muted-text></comment>');
    });

    it('renders the text message when HTML is unavailable', () => {
        jest.mocked(getReportActionHtml).mockReturnValue('');
        jest.mocked(getReportActionText).mockReturnValue('Add your home address.');

        render(<HomeAddressRequiredContent action={mockReportAction} />);

        expect(mockRenderHTML).toHaveBeenLastCalledWith('<comment><muted-text>Add your home address.</muted-text></comment>');
    });
});
