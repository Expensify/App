import {render} from '@testing-library/react-native';

import {getReportActionHtml} from '@libs/ReportActionsUtils';

import HomeAddressRequiredContent from '@pages/inbox/report/actionContents/HomeAddressRequiredContent';

import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';

import React from 'react';

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
    const MockButton = () => null;
    MockButton.Text = () => null;
    return {__esModule: true, default: MockButton};
});
jest.mock('@pages/inbox/report/ReportActionItemBasicMessage', () => ({__esModule: true, default: ({children}: {children: React.ReactNode}) => children}));
jest.mock('@hooks/useLocalize', () => () => ({translate: jest.fn()}));
jest.mock('@libs/ReportActionsUtils', () => ({
    getOriginalMessage: jest.fn(),
    getReportActionHtml: jest.fn(),
}));

describe('HomeAddressRequiredContent', () => {
    it('renders the home address link from the report action HTML', () => {
        jest.mocked(getReportActionHtml).mockReturnValue('Add your <a href="https://example.com">home address</a>.');

        render(<HomeAddressRequiredContent action={{} as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.HOME_ADDRESS_REQUIRED>} />);

        expect(mockRenderHTML).toHaveBeenCalledWith('<comment><muted-text>Add your <a href="https://example.com">home address</a>.</muted-text></comment>');
    });
});
