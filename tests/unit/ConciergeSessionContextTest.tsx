import {act, renderHook} from '@testing-library/react-native';

import {ConciergeSessionProvider, useConciergeSessionActions, useConciergeSessionState} from '@pages/inbox/ConciergeSessionContext';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

const UNREAD_BOUNDARY = '2024-06-01 12:00:00.000';

const wrapper = ({children}: {children: React.ReactNode}) => <ConciergeSessionProvider>{children}</ConciergeSessionProvider>;

describe('ConciergeSessionProvider', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    it('keeps the New chat boundary when the unread anchor resolves again', () => {
        const {result} = renderHook(() => ({...useConciergeSessionState(), ...useConciergeSessionActions()}), {wrapper});

        act(() => result.current.startSession(UNREAD_BOUNDARY));
        expect(result.current.sessionStartTime).toBe(UNREAD_BOUNDARY);

        act(() => result.current.resetSession());
        const boundaryAfterReset = result.current.sessionStartTime;

        act(() => result.current.startSession(UNREAD_BOUNDARY));
        expect(result.current.sessionStartTime).toBe(boundaryAfterReset);
    });
});
