import {act, render} from '@testing-library/react-native';

import GrowlNotification from '@components/GrowlNotification';
import type GrowlNotificationContent from '@components/GrowlNotification/GrowlNotificationContent';

import Growl, {growlRef} from '@libs/Growl';

import CONST from '@src/CONST';

import type {ComponentProps} from 'react';

import React from 'react';

type GrowlContentProps = ComponentProps<typeof GrowlNotificationContent>;

const mockGrowlContent = jest.fn<void, [GrowlContentProps]>();
jest.mock('@components/GrowlNotification/GrowlNotificationContent', () => (props: GrowlContentProps) => {
    mockGrowlContent(props);
    return null;
});

function lastGrowlProps() {
    return mockGrowlContent.mock.calls.at(-1)?.[0];
}

function showGrowl(bodyText: string) {
    return act(() => Growl.success({bodyText, duration: Infinity}));
}

function dismissGrowl(nonce: number | undefined) {
    if (nonce === undefined) {
        throw new Error('The growl was not shown');
    }
    act(() => lastGrowlProps()?.onDismissed(nonce));
}

function hideGrowl(nonce: number | undefined) {
    if (nonce === undefined) {
        throw new Error('The growl was not shown');
    }
    act(() => Growl.hide(nonce));
}

describe('GrowlNotification', () => {
    beforeEach(() => {
        mockGrowlContent.mockClear();
        render(<GrowlNotification ref={growlRef} />);
    });

    it('resolves the nonce of the growl that is shown', async () => {
        // Given the growl shell is mounted
        // When a growl is shown
        const nonce = await showGrowl('first');

        // Then the growl is rendered with the nonce that show resolved, so the caller can hide exactly this growl
        expect(nonce).toBeDefined();
        expect(lastGrowlProps()).toMatchObject({bodyText: 'first', nonce, type: CONST.GROWL.SUCCESS});
    });

    it('slides out the growl that is hidden by its nonce', async () => {
        // Given a growl is shown
        const nonce = await showGrowl('first');
        expect(lastGrowlProps()?.shouldDismiss).toBeFalsy();

        // When it is hidden by the nonce it resolved
        hideGrowl(nonce);

        // Then the growl is told to slide out
        expect(lastGrowlProps()).toMatchObject({nonce, shouldDismiss: true});
    });

    it('hides a growl right after it was shown, without waiting for a render in between', async () => {
        // Given a growl that is shown and hidden in the same batch, like a download that finishes instantly
        // When the nonce arrives and hide runs before the shell rendered the new growl
        await act(async () => {
            const nonce = await Growl.success({bodyText: 'fast', duration: Infinity});
            if (nonce !== undefined) {
                Growl.hide(nonce);
            }
        });

        // Then the growl is hidden anyway, so it can not stay on the screen forever
        expect(lastGrowlProps()).toMatchObject({bodyText: 'fast', shouldDismiss: true});
    });

    it('does not hide a newer growl that replaced the one with the nonce', async () => {
        // Given a growl was replaced by a newer one
        const firstNonce = await showGrowl('first');
        const secondNonce = await showGrowl('second');

        // When the first growl is hidden by its nonce
        hideGrowl(firstNonce);

        // Then the newer growl stays, unaffected
        expect(secondNonce).not.toBe(firstNonce);
        expect(lastGrowlProps()).toMatchObject({bodyText: 'second', nonce: secondNonce});
        expect(lastGrowlProps()?.shouldDismiss).toBeFalsy();
    });

    it('shows a new growl that does not inherit the dismissal of the one hidden before it', async () => {
        // Given a growl that was hidden but is still sliding out
        const firstNonce = await showGrowl('first');
        hideGrowl(firstNonce);

        // When a new growl is shown
        await showGrowl('second');

        // Then the new growl is not dismissed with it
        expect(lastGrowlProps()).toMatchObject({bodyText: 'second'});
        expect(lastGrowlProps()?.shouldDismiss).toBeFalsy();
    });

    it('ignores the late dismissal of a growl that was replaced', async () => {
        // Given the slide-out of the first growl finishes after a second growl replaced it
        const firstNonce = await showGrowl('first');
        const firstOnDismissed = lastGrowlProps()?.onDismissed;
        const secondNonce = await showGrowl('second');

        // When the first growl reports that it is dismissed
        act(() => {
            firstOnDismissed?.(firstNonce ?? -1);
        });

        // Then the second growl is still rendered
        expect(lastGrowlProps()).toMatchObject({bodyText: 'second', nonce: secondNonce});
    });

    it('does not reuse a nonce once a growl is gone, so a late hide can not close a later growl', async () => {
        // Given a growl that was dismissed and is gone
        const firstNonce = await showGrowl('first');
        dismissGrowl(firstNonce);

        // When a new growl is shown and the first one is hidden late
        const secondNonce = await showGrowl('second');
        hideGrowl(firstNonce);

        // Then the new growl has another nonce and stays
        expect(secondNonce).not.toBe(firstNonce);
        expect(lastGrowlProps()).toMatchObject({bodyText: 'second', nonce: secondNonce});
        expect(lastGrowlProps()?.shouldDismiss).toBeFalsy();
    });
});
