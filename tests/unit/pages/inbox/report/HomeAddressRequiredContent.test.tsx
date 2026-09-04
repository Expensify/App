import {act, render, screen, waitFor} from '@testing-library/react-native';

import Text from '@components/Text';

import HomeAddressRequiredContent from '@pages/inbox/report/actionContents/HomeAddressRequiredContent';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../../../../utils/createMock';
import {getFakeReportAction} from '../../../../utils/ReportTestUtils';
import waitForBatchedUpdates from '../../../../utils/waitForBatchedUpdates';

const mockReact = React;
const mockText = Text;

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
}));

jest.mock('@components/RenderHTML', () => {
    function MockRenderHTML() {
        return null;
    }

    return MockRenderHTML;
});

jest.mock('@components/ButtonComposed', () => {
    function MockButton({children}: {children: React.ReactNode}) {
        return mockReact.createElement('mock-button', null, children);
    }

    function ButtonText({children}: {children: React.ReactNode}) {
        return mockReact.createElement(mockText, null, children);
    }

    MockButton.Text = ButtonText;
    return MockButton;
});

jest.mock('@components/ReportActionItem/ActionableItemButtons', () => {
    function MockActionableItemButtons({children}: {children: React.ReactNode}) {
        return mockReact.createElement('mock-actionable-item-buttons', null, children);
    }

    return MockActionableItemButtons;
});

jest.mock('@pages/inbox/report/ReportActionItemBasicMessage', () => {
    function MockReportActionItemBasicMessage({message, children}: {message?: string; children?: React.ReactNode}) {
        return mockReact.createElement('mock-report-action-item-basic-message', null, message ? mockReact.createElement(mockText, null, message) : null, children);
    }

    return MockReportActionItemBasicMessage;
});

const action = createMock<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.HOME_ADDRESS_REQUIRED>>({
    ...getFakeReportAction(1),
    actionName: CONST.REPORT.ACTIONS.TYPE.HOME_ADDRESS_REQUIRED,
    originalMessage: {
        policyID: 'policyID',
    },
});

describe('HomeAddressRequiredContent', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('hides the add address CTA as soon as the current home address is saved', async () => {
        render(<HomeAddressRequiredContent action={action} />);

        expect(screen.getByText('homePage.timeSensitiveSection.addHomeAddress.cta')).toBeTruthy();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {
                addresses: [{street: '123 Main Street', current: true}],
            });
        });

        await waitFor(() => {
            expect(screen.queryByText('homePage.timeSensitiveSection.addHomeAddress.cta')).toBeNull();
        });
    });

    it('keeps the CTA hidden when the action is already resolved', () => {
        render(
            <HomeAddressRequiredContent
                action={{
                    ...action,
                    originalMessage: {
                        policyID: 'policyID',
                        resolution: 'done',
                    },
                }}
            />,
        );

        expect(screen.queryByText('homePage.timeSensitiveSection.addHomeAddress.cta')).toBeNull();
    });
});
