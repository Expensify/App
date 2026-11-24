// cspell:ignore reportid
import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import MentionReportRenderer from '@components/HTMLEngineProvider/HTMLRenderers/MentionReportRenderer';
import MentionReportContext from '@components/HTMLEngineProvider/HTMLRenderers/MentionReportRenderer/MentionReportContext';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import type {ComponentProps} from 'react';

import React, {Profiler} from 'react';
import Onyx from 'react-native-onyx';

import {createRandomReport} from '../utils/collections/reports';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    isTopmostRouteModalScreen: jest.fn(() => false),
}));

jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => () => false);

type RendererProps = ComponentProps<typeof MentionReportRenderer>;

const POLICY_ID = 'policy1';
const MENTION_COUNT = 10;
const UNRELATED_UPDATES = 20;

function getRoom(reportID: string, reportName: string) {
    return {
        ...createRandomReport(Number(reportID), CONST.REPORT.CHAT_TYPE.POLICY_ROOM),
        reportID,
        reportName,
        policyID: POLICY_ID,
    };
}

function Mention({reportID, data}: {reportID?: string; data: string}) {
    // The renderer only reads these fields, so a partial props object is enough
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const props = {
        tnode: {attributes: reportID ? {reportid: reportID} : {}, data},
        style: {},
        TDefaultRenderer: () => null,
    } as unknown as RendererProps;
    return <MentionReportRenderer {...props} />;
}

function renderMentions(onRender: jest.Mock, mentions: Array<{reportID?: string; data: string}>) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <Profiler
                id="Mentions"
                onRender={onRender}
            >
                {mentions.map((mention) => (
                    <Mention
                        key={mention.reportID ?? mention.data}
                        reportID={mention.reportID}
                        data={mention.data}
                    />
                ))}
            </Profiler>
        </ComposeProviders>,
    );
}

describe('MentionReportRenderer', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('does not re-render the mentions when unrelated reports change', async () => {
        // Given many mentions with a reportid attribute, each reading only its own report
        const mentions = Array.from({length: MENTION_COUNT}, (_, index) => ({
            reportID: String(100 + index),
            data: `#room${index}`,
        }));
        await act(async () => {
            await Promise.all(mentions.map(({reportID}) => Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, getRoom(reportID, `#room-${reportID}`))));
        });
        const onRender = jest.fn();
        renderMentions(onRender, mentions);
        await waitForBatchedUpdatesWithAct();
        const renderCountBeforeChange = onRender.mock.calls.length;

        // When many reports that no mention points to change, which used to wake every mention
        for (let index = 0; index < UNRELATED_UPDATES; index++) {
            // Each write gets its own act so it notifies subscribers separately, like separate server pushes. Promise.all would batch them into one update and hide the extra renders.
            // eslint-disable-next-line no-await-in-loop
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${900 + index}`, getRoom(String(900 + index), `#other-${index}`));
            });
        }
        await waitForBatchedUpdatesWithAct();

        // Then no mention re-renders, so unrelated report updates cost nothing
        expect(renderCountBeforeChange).toBeGreaterThan(0);
        expect(onRender).toHaveBeenCalledTimes(renderCountBeforeChange);
    });

    it('updates the displayed text when the mentioned report is renamed', async () => {
        // Given a mention that points to a room by its reportid
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}100`, getRoom('100', '#old-name'));
        });
        const onRender = jest.fn();
        renderMentions(onRender, [{reportID: '100', data: '#ignored'}]);
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByText('#old-name')).toBeOnTheScreen();
        const renderCountBeforeRename = onRender.mock.calls.length;

        // When that room is renamed
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}100`, {
                reportName: '#new-name',
            });
        });
        await waitForBatchedUpdatesWithAct();

        // Then the mention shows the new name, so narrowing the subscription didn't hide real changes
        expect(screen.getByText('#new-name')).toBeOnTheScreen();
        expect(onRender.mock.calls.length).toBeGreaterThan(renderCountBeforeRename);
    });

    it('does not re-render the mention when an unused field of the mentioned report changes', async () => {
        // Given a mention of a room that is rendered with its id and name
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}100`, getRoom('100', '#room-100'));
        });
        const onRender = jest.fn();
        renderMentions(onRender, [{reportID: '100', data: '#room-100'}]);
        await waitForBatchedUpdatesWithAct();
        const renderCountBeforeChange = onRender.mock.calls.length;

        // When a field the mention doesn't read changes on that room, as it does with every new message
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}100`, {lastReadTime: '2026-11-06 10:00:00.000', lastMessageText: 'new message'});
        });
        await waitForBatchedUpdatesWithAct();

        // Then the mention doesn't re-render, so only the id and name wake it up
        expect(renderCountBeforeChange).toBeGreaterThan(0);
        expect(onRender).toHaveBeenCalledTimes(renderCountBeforeChange);
    });

    it('does not re-render the mentions when an unused field of the report they are shown in changes', async () => {
        // Given mentions of other rooms shown in a chat, which the renderer also reads as the current report
        const mentions = Array.from({length: MENTION_COUNT}, (_, index) => ({
            reportID: String(100 + index),
            data: `#room${index}`,
        }));
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}500`, getRoom('500', '#current-chat'));
            await Promise.all(mentions.map(({reportID}) => Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, getRoom(reportID, `#room-${reportID}`))));
        });
        const onRender = jest.fn();
        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <MentionReportContext.Provider value={{currentReportID: '500', exactlyMatch: true}}>
                    <Profiler
                        id="Mentions"
                        onRender={onRender}
                    >
                        {mentions.map(({reportID, data}) => (
                            <Mention
                                key={reportID}
                                reportID={reportID}
                                data={data}
                            />
                        ))}
                    </Profiler>
                </MentionReportContext.Provider>
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();
        const renderCountBeforeChange = onRender.mock.calls.length;

        // When fields the mentions don't read change on that chat, as they do with every new message
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}500`, {lastReadTime: '2026-11-06 10:00:00.000', lastMessageText: 'new message'});
        });
        await waitForBatchedUpdatesWithAct();

        // Then no mention re-renders, so a new message in the chat doesn't wake the mentions in it
        expect(renderCountBeforeChange).toBeGreaterThan(0);
        expect(onRender).toHaveBeenCalledTimes(renderCountBeforeChange);
    });

    it('shows Hidden for a mentioned report that is not loaded yet and the name once it arrives', async () => {
        // Given a mention of a report that is not in Onyx yet, as on a first load or a deeplink
        const onRender = jest.fn();
        renderMentions(onRender, [{reportID: '300', data: '#ignored'}]);
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByText('#Hidden')).toBeOnTheScreen();

        // When the report arrives
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}300`, getRoom('300', '#arrived-room'));
        });
        await waitForBatchedUpdatesWithAct();

        // Then the mention switches from the placeholder to the room name, so a missing report doesn't freeze the mention
        expect(screen.getByText('#arrived-room')).toBeOnTheScreen();
    });

    it('still resolves an old mention without a reportid by its name', async () => {
        // Given a workspace room and a legacy mention that only carries the room name
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}200`, getRoom('200', '#legacy-room'));
        });

        // When the mention is rendered in the context of the same workspace and has no reportid attribute
        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <MentionReportContext.Provider value={{currentReportID: undefined, policyID: POLICY_ID}}>
                    <Mention data="#legacy-room" />
                </MentionReportContext.Provider>
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the mention links to the room found by name, so the full collection scan keeps working for old messages
        expect(screen.getByText('#legacy-room')).toBeOnTheScreen();
        expect(screen.getByLabelText(`/${ROUTES.REPORT_WITH_ID.getRoute('200')}`)).toBeOnTheScreen();
    });
});
