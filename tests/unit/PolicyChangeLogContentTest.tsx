import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import PolicyChangeLogContent, {HANDLED_POLICY_CHANGE_LOG_ACTIONS, isHandledPolicyChangeLogAction} from '@pages/inbox/report/actionContents/PolicyChangeLogContent';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';
import type ReportActionName from '@src/types/onyx/ReportActionName';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import createMock from '../utils/createMock';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const mockPolicy = createRandomPolicy(1);
const allTypes = [...new Set<ReportActionName>(Object.values(CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG))];
const handledActionTypes = [...HANDLED_POLICY_CHANGE_LOG_ACTIONS];
const handledTypes = allTypes.filter((type) => HANDLED_POLICY_CHANGE_LOG_ACTIONS.has(type));
const fallthroughTypes = allTypes.filter((type) => !HANDLED_POLICY_CHANGE_LOG_ACTIONS.has(type));

describe('PolicyChangeLogContent', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${mockPolicy.id}`, mockPolicy);
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('every POLICY_CHANGE_LOG type is accounted for (handled or fallthrough)', () => {
        const fallthroughCount = allTypes.filter((type) => !HANDLED_POLICY_CHANGE_LOG_ACTIONS.has(type)).length;
        expect(HANDLED_POLICY_CHANGE_LOG_ACTIONS.size + fallthroughCount).toBe(allTypes.length);
    });

    it('no handled type is missing from CONST', () => {
        const allTypesSet = new Set<string>(allTypes);
        const orphaned = handledActionTypes.filter((type) => !allTypesSet.has(type));
        expect(orphaned).toEqual([]);
    });

    it.each([
        [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ARCHIVE_POLICY, 'archived this workspace'],
        [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UNARCHIVE_POLICY, 'unarchived this workspace'],
    ] as const)('renders the workspace history message for %s', async (actionName, message) => {
        // Given a backend changelog without pre-rendered text, the client must resolve its action type.
        const action = createMock<ReportAction>({actionName, originalMessage: {}});

        // When the changelog is displayed in the admins room.
        render(
            <NavigationContainer>
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider]}>
                    <PolicyChangeLogContent
                        action={action}
                        policyID={mockPolicy.id}
                    />
                </ComposeProviders>
            </NavigationContainer>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then admins can read the specific archive or unarchive event.
        expect(screen.getByText(message)).toBeOnTheScreen();
    });

    it.each(handledTypes)('renders non-null for handled type %s', async (type) => {
        const fakeAction = createMock<ReportAction>({actionName: type, originalMessage: {}});

        render(
            <NavigationContainer>
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider]}>
                    <PolicyChangeLogContent
                        action={fakeAction}
                        policyID={mockPolicy.id}
                    />
                </ComposeProviders>
            </NavigationContainer>,
        );
        await waitForBatchedUpdatesWithAct();

        expect(screen.toJSON()).not.toBeNull();
    });

    it.each(handledTypes)('isHandledPolicyChangeLogAction returns true for %s', (type) => {
        expect(isHandledPolicyChangeLogAction(createMock<ReportAction>({actionName: type}))).toBe(true);
    });

    it.each(fallthroughTypes)('renders null for fallthrough type %s', async (type) => {
        const fakeAction = createMock<ReportAction>({actionName: type, originalMessage: {}});

        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider]}>
                <PolicyChangeLogContent
                    action={fakeAction}
                    policyID={mockPolicy.id}
                />
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();

        expect(screen.toJSON()).toBeNull();
    });

    it.each(fallthroughTypes)('isHandledPolicyChangeLogAction returns false for %s', (type) => {
        expect(isHandledPolicyChangeLogAction(createMock<ReportAction>({actionName: type}))).toBe(false);
    });
});
