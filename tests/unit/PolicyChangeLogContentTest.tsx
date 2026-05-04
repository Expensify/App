import {act, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import PolicyChangeLogContent, {HANDLED_POLICY_CHANGE_LOG_ACTIONS, isHandledPolicyChangeLogAction} from '@pages/inbox/report/actionContents/PolicyChangeLogContent';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';
import createRandomPolicy from '../utils/collections/policies';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const mockPolicy = createRandomPolicy(1);
const allTypes = Object.values(CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG);
const handledTypes = [...HANDLED_POLICY_CHANGE_LOG_ACTIONS];
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
        const orphaned = handledTypes.filter((type) => !allTypesSet.has(type));
        expect(orphaned).toEqual([]);
    });

    it.each(handledTypes)('renders non-null for handled type %s', async (type) => {
        const fakeAction = {actionName: type, originalMessage: {}} as ReportAction;

        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider]}>
                <PolicyChangeLogContent
                    action={fakeAction}
                    policyID={mockPolicy.id}
                />
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();

        expect(screen.toJSON()).not.toBeNull();
    });

    it.each(handledTypes)('isHandledPolicyChangeLogAction returns true for %s', (type) => {
        expect(isHandledPolicyChangeLogAction({actionName: type} as ReportAction)).toBe(true);
    });

    it.each(fallthroughTypes)('renders null for fallthrough type %s', async (type) => {
        const fakeAction = {actionName: type, originalMessage: {}} as ReportAction;

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
        expect(isHandledPolicyChangeLogAction({actionName: type} as ReportAction)).toBe(false);
    });
});
