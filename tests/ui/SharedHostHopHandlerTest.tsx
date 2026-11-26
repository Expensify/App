import {render} from '@testing-library/react-native';

import SharedHostHopHandler from '@src/SharedHostHopHandler';
import type {Session} from '@src/types/onyx';

import React from 'react';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

let mockSession: Session | undefined;
const mockHopToSharedHost = jest.fn<Promise<boolean>, [Session | undefined]>();

jest.mock('@hooks/useOnyx', () => ({__esModule: true, default: () => [mockSession]}));
jest.mock('@libs/LegacyHostHop', () => ({hopToSharedHost: (session: Session | undefined) => mockHopToSharedHost(session)}));

const SESSION: Session = {authToken: 'authToken', email: 'user@example.com'};

beforeEach(() => {
    jest.clearAllMocks();
    mockSession = undefined;
    mockHopToSharedHost.mockResolvedValue(false);
});

describe('SharedHostHopHandler', () => {
    it('waits for the session, then hops once', async () => {
        // Given the session hasn't loaded yet
        const onStay = jest.fn();
        const {rerender} = render(<SharedHostHopHandler onStay={onStay} />);

        // Then nothing happens
        expect(mockHopToSharedHost).not.toHaveBeenCalled();

        // When the session loads and later changes
        mockSession = SESSION;
        rerender(<SharedHostHopHandler onStay={onStay} />);
        await waitForBatchedUpdatesWithAct();
        mockSession = {...SESSION, email: 'other@example.com'};
        rerender(<SharedHostHopHandler onStay={onStay} />);
        await waitForBatchedUpdatesWithAct();

        // Then the hop starts once, with the loaded session
        expect(mockHopToSharedHost).toHaveBeenCalledTimes(1);
        expect(mockHopToSharedHost).toHaveBeenCalledWith(SESSION);
    });

    it('calls onStay when the page stays on this host', async () => {
        mockSession = SESSION;
        const onStay = jest.fn();

        render(<SharedHostHopHandler onStay={onStay} />);
        await waitForBatchedUpdatesWithAct();

        expect(onStay).toHaveBeenCalledTimes(1);
    });

    it('calls onStay when the hop fails', async () => {
        mockSession = SESSION;
        mockHopToSharedHost.mockRejectedValue(new Error('failed'));
        const onStay = jest.fn();

        render(<SharedHostHopHandler onStay={onStay} />);
        await waitForBatchedUpdatesWithAct();

        expect(onStay).toHaveBeenCalledTimes(1);
    });

    it('does not call onStay while the page is leaving', async () => {
        mockSession = SESSION;
        mockHopToSharedHost.mockResolvedValue(true);
        const onStay = jest.fn();

        render(<SharedHostHopHandler onStay={onStay} />);
        await waitForBatchedUpdatesWithAct();

        expect(onStay).not.toHaveBeenCalled();
    });
});
