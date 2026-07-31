import {render, screen} from '@testing-library/react-native';

import Text from '@components/Text';

import DelegateOnBehalfOfText from '@pages/inbox/report/DelegateOnBehalfOfText';
import ReportActionItemSystem from '@pages/inbox/report/ReportActionItemSystem';

import CONST from '@src/CONST';
import type {Report, ReportAction} from '@src/types/onyx';

import React from 'react';

jest.mock('@components/ReportActionAvatars/useReportActionAvatars', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        avatarType: 'single',
        avatars: [{name: 'Todd Clyde'}, {name: ''}],
        details: {login: 'todd@example.com'},
        reportPreviewSenderID: undefined,
    })),
}));

jest.mock('@pages/inbox/report/DelegateOnBehalfOfText', () => ({
    __esModule: true,
    default: jest.fn(() => null),
}));
jest.mock('@pages/inbox/report/HumanAgentAssistedByText', () => ({
    __esModule: true,
    default: jest.fn(() => null),
}));
jest.mock('@pages/inbox/report/VacationDelegateText', () => ({
    __esModule: true,
    default: jest.fn(() => null),
}));

jest.mock('@hooks/useThemeStyles', () => {
    const styleProxy = new Proxy({}, {get: () => ({})});
    return jest.fn(() => styleProxy);
});

jest.mock('@hooks/useStyleUtils', () => jest.fn(() => ({getCompactContentContainerStyles: () => ({alignItems: 'baseline'})})));

describe('ReportActionItemSystem', () => {
    it('renders the actor inline with the system action content', () => {
        const action: ReportAction = {
            reportActionID: '1',
            actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
            actorAccountID: 1,
            created: '2026-07-30 00:00:00.000',
            message: [{type: 'TEXT', html: 'submitted', text: 'submitted'}],
        };
        const report: Report = {reportID: '1'};

        render(
            <ReportActionItemSystem
                action={action}
                report={report}
            >
                <Text>submitted</Text>
            </ReportActionItemSystem>,
        );

        expect(screen.getByText('Todd Clyde ')).toBeOnTheScreen();
        expect(screen.getByText('submitted')).toBeOnTheScreen();
    });

    it('preserves delegated actor attribution in the inline system row', () => {
        const action: ReportAction = {
            reportActionID: '1',
            actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
            actorAccountID: 1,
            delegateAccountID: 2,
            childOwnerAccountID: 3,
            created: '2026-07-30 00:00:00.000',
            message: [{type: 'TEXT', html: 'submitted', text: 'submitted'}],
        };
        const report: Report = {reportID: '1'};

        render(
            <ReportActionItemSystem
                action={action}
                report={report}
            >
                <Text>submitted</Text>
            </ReportActionItemSystem>,
        );

        const delegateProps = jest.mocked(DelegateOnBehalfOfText).mock.calls.at(-1)?.at(0);
        expect(delegateProps).toEqual({
            mainAccountID: 3,
            fallbackLogin: 'todd@example.com',
        });
    });
});
