import {render} from '@testing-library/react-native';

import AnchorPressOverrideContext from '@components/HTMLEngineProvider/HTMLRenderers/AnchorPressOverrideContext';

import {openHomeAddressPageWithFocus} from '@libs/Navigation/helpers/openHomeAddressPage';
import {getReportActionHtml, getReportActionText} from '@libs/ReportActionsUtils';

import HomeAddressRequiredContent from '@pages/inbox/report/actionContents/HomeAddressRequiredContent';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import type {ReactNode} from 'react';

import React from 'react';

import createMock from '../utils/createMock';

const mockRenderHTML = jest.fn();
const mockReact = React;
const mockAnchorPressOverrideContext = AnchorPressOverrideContext;
const mockGetAnchorPressOverride = jest.fn<(() => void) | undefined, [string]>();

jest.mock('@libs/Navigation/helpers/openHomeAddressPage', () => ({
    __esModule: true,
    default: jest.fn(),
    openHomeAddressPageWithFocus: jest.fn(),
}));

jest.mock('@components/RenderHTML', () => ({
    __esModule: true,
    default: ({html}: {html: string}) => {
        mockRenderHTML(html);
        mockGetAnchorPressOverride.mockImplementation(mockReact.useContext(mockAnchorPressOverrideContext));
        return null;
    },
}));

jest.mock('@components/ReportActionItem/ActionableItemButtons', () => () => null);
jest.mock('@components/Button', () => {
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
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the home address link from the report action HTML', () => {
        jest.mocked(getReportActionHtml).mockReturnValue('Add your <a href="https://example.com">home address</a>.');

        render(
            <HomeAddressRequiredContent
                action={mockReportAction}
                reportID="1"
            />,
        );

        expect(mockRenderHTML).toHaveBeenCalledWith('<comment><muted-text>Add your <a href="https://example.com">home address</a>.</muted-text></comment>');
    });

    it('renders the text message when HTML is unavailable', () => {
        jest.mocked(getReportActionHtml).mockReturnValue('');
        jest.mocked(getReportActionText).mockReturnValue('Add your home address.');

        render(
            <HomeAddressRequiredContent
                action={mockReportAction}
                reportID="1"
            />,
        );

        expect(mockRenderHTML).toHaveBeenLastCalledWith('<comment><muted-text>Add your home address.</muted-text></comment>');
    });

    it('focuses the home address from the private-details message link', () => {
        // Given a home-address message links to private personal details
        render(
            <HomeAddressRequiredContent
                action={mockReportAction}
                reportID="1"
            />,
        );

        // When a message link is pressed, ignoring any existing query or fragment
        const press = mockGetAnchorPressOverride(`${CONST.NEW_EXPENSIFY_URL}${ROUTES.SETTINGS_PRIVATE_PERSONAL_DETAILS.route}?existing=value#address`);
        press?.();

        // Then the message destination opens the address-only page with opt-in focus
        expect(openHomeAddressPageWithFocus).toHaveBeenCalledTimes(1);
    });

    it('leaves an unrelated internal link to the shared renderer', () => {
        // Given a home-address message containing another link
        render(
            <HomeAddressRequiredContent
                action={mockReportAction}
                reportID="1"
            />,
        );

        // When the renderer asks whether that link has a custom action
        const press = mockGetAnchorPressOverride(`${CONST.NEW_EXPENSIFY_URL}settings/profile`);

        // Then the default link behavior is preserved
        expect(press).toBeUndefined();
        expect(openHomeAddressPageWithFocus).not.toHaveBeenCalled();
    });
});
