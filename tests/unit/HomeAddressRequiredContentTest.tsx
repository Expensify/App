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

        render(<HomeAddressRequiredContent action={mockReportAction} />);

        expect(mockRenderHTML).toHaveBeenCalledWith('<comment><muted-text>Add your <a href="https://example.com">home address</a>.</muted-text></comment>');
    });

    it('renders the text message when HTML is unavailable', () => {
        jest.mocked(getReportActionHtml).mockReturnValue('');
        jest.mocked(getReportActionText).mockReturnValue('Add your home address.');

        render(<HomeAddressRequiredContent action={mockReportAction} />);

        expect(mockRenderHTML).toHaveBeenLastCalledWith('<comment><muted-text>Add your home address.</muted-text></comment>');
    });

    it.each([CONST.NEW_EXPENSIFY_URL, CONST.STAGING_NEW_EXPENSIFY_URL, CONST.QA_NEW_EXPENSIFY_URL, `${CONST.DEV_NEW_EXPENSIFY_URL}8082/`])(
        'focuses the home address when following a trusted link from %s',
        (origin) => {
            // Given the backend may still send the old private-details path, or the new address-only path
            render(<HomeAddressRequiredContent action={mockReportAction} />);
            const paths = [ROUTES.SETTINGS_PRIVATE_PERSONAL_DETAILS.route, ROUTES.SETTINGS_HOME_ADDRESS.route];

            for (const path of paths) {
                // When a message link is pressed, ignoring any existing query or fragment
                const press = mockGetAnchorPressOverride(`${origin.replace(/\/$/, '')}/${path}?existing=value#address`);
                press?.();
            }

            // Then both supported destinations open the address-only page with opt-in focus
            expect(openHomeAddressPageWithFocus).toHaveBeenCalledTimes(2);
        },
    );

    it.each(['https://example.com/settings/preferences/home-address', `${CONST.NEW_EXPENSIFY_URL}settings/profile`, 'not a URL'])(
        'leaves unrelated links to the shared renderer: %s',
        (href) => {
            // Given a home-address message containing another link
            render(<HomeAddressRequiredContent action={mockReportAction} />);

            // When the renderer asks whether that link has a custom action
            const press = mockGetAnchorPressOverride(href);

            // Then the default link behavior is preserved
            expect(press).toBeUndefined();
            expect(openHomeAddressPageWithFocus).not.toHaveBeenCalled();
        },
    );
});
