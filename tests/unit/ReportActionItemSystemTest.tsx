import {render, screen} from '@testing-library/react-native';

import useReportActionAvatars from '@components/ReportActionAvatars/useReportActionAvatars';
import Text from '@components/Text';

import DelegateOnBehalfOfText from '@pages/inbox/report/DelegateOnBehalfOfText';
import ReportActionItemDate from '@pages/inbox/report/ReportActionItemDate';
import {ReportActionItemSystemContent} from '@pages/inbox/report/ReportActionItemSystem';

import CONST from '@src/CONST';
import type {Report, ReportAction} from '@src/types/onyx';

import type ReactNative from 'react-native';

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
jest.mock('@pages/inbox/report/ReportActionItemDate', () => {
    const {Text: MockText} = jest.requireActual<typeof ReactNative>('react-native');
    return {
        __esModule: true,
        default: jest.fn(({created}: {created: string; isLowercase?: boolean}) => <MockText>{created}</MockText>),
    };
});

jest.mock('@hooks/useThemeStyles', () => {
    const styleProxy = new Proxy({}, {get: () => ({})});
    return jest.fn(() => styleProxy);
});

jest.mock('@hooks/useStyleUtils', () => jest.fn(() => ({getCompactContentContainerStyles: () => ({alignItems: 'baseline'})})));

describe('ReportActionItemSystem', () => {
    it('renders the actor and action together with the timestamp on a separate line', () => {
        const action: ReportAction = {
            reportActionID: '1',
            actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
            actorAccountID: 1,
            created: '2026-07-30 00:00:00.000',
            message: [{type: 'TEXT', html: 'submitted', text: 'submitted'}],
        };
        const report: Report = {reportID: '1'};

        render(
            <ReportActionItemSystemContent
                action={action}
                report={report}
                shouldUseRealActor
            >
                <Text>submitted</Text>
            </ReportActionItemSystemContent>,
        );

        expect(screen.getByText('Todd Clyde ')).toBeOnTheScreen();
        expect(screen.getByText('submitted')).toBeOnTheScreen();
        expect(screen.getByText('2026-07-30 00:00:00.000')).toBeOnTheScreen();
        expect(jest.mocked(ReportActionItemDate).mock.calls.at(-1)?.[0]).toEqual({created: '2026-07-30 00:00:00.000'});
        expect(jest.mocked(useReportActionAvatars)).toHaveBeenLastCalledWith(expect.objectContaining({shouldUseRealActor: true}));

        const actor = screen.getByText('Todd Clyde ');
        const content = screen.getByText('submitted');
        const timestamp = screen.getByText('2026-07-30 00:00:00.000');
        const getAncestors = (node: typeof actor) => {
            const ancestors: Array<typeof actor> = [];
            let parent = node.parent;
            while (parent) {
                ancestors.push(parent);
                parent = parent.parent;
            }
            return ancestors;
        };
        const actorAncestors = getAncestors(actor);
        const contentAncestors = getAncestors(content);
        const timestampAncestors = getAncestors(timestamp);
        const firstLineContainer = actorAncestors.find((ancestor) => contentAncestors.includes(ancestor));

        if (!firstLineContainer) {
            throw new Error('Expected actor and action content to share a line container');
        }
        expect(timestampAncestors.includes(firstLineContainer)).toBe(false);
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
            <ReportActionItemSystemContent
                action={action}
                report={report}
                shouldUseRealActor={false}
            >
                <Text>submitted</Text>
            </ReportActionItemSystemContent>,
        );

        const delegateProps = jest.mocked(DelegateOnBehalfOfText).mock.calls.at(-1)?.at(0);
        expect(delegateProps).toEqual({
            mainAccountID: 3,
            fallbackLogin: 'todd@example.com',
        });
    });
});
