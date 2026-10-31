import type MiniReportActionContextMenuProps from '@pages/inbox/report/ContextMenu/MiniReportActionContextMenu/types';
import type {MiniReportActionContextMenuController} from '@pages/inbox/report/ContextMenu/MiniReportActionContextMenuContext';
import {useMiniReportActionContextMenuController} from '@pages/inbox/report/ContextMenu/MiniReportActionContextMenuContext';
import MiniReportActionContextMenuProvider from '@pages/inbox/report/ContextMenu/MiniReportActionContextMenuProvider';

import type {Root} from 'react-dom/client';

import React, {act, useLayoutEffect} from 'react';
import {createRoot} from 'react-dom/client';

/* eslint-disable testing-library/no-unnecessary-act -- These tests drive a react-dom root directly, including native events and batched controller updates. */

// Jest resolves native variants by default; this regression exercises the web portal implementation.
jest.mock('@pages/inbox/report/ContextMenu/MiniReportActionContextMenuProvider', () =>
    jest.requireActual<{default: typeof MiniReportActionContextMenuProvider}>('@pages/inbox/report/ContextMenu/MiniReportActionContextMenuProvider/index.tsx'),
);

jest.mock('@pages/inbox/report/ContextMenu/MiniReportActionContextMenu/MiniReportActionContextMenuContent', () => {
    const ReactActual = jest.requireActual<typeof React>('react');

    // Copy feedback is local component state, so this reproduces its lifecycle without unrelated Onyx setup.
    function MockMiniMenu({reportActionID}: MiniReportActionContextMenuProps) {
        const [hasCopied, setHasCopied] = ReactActual.useState(false);
        return ReactActual.createElement('button', {type: 'button', disabled: hasCopied, onClick: () => setHasCopied(true)}, hasCopied ? 'Copied' : reportActionID);
    }

    return MockMiniMenu;
});

describe('MiniReportActionContextMenuProvider', () => {
    let container: HTMLDivElement;
    let firstHost: HTMLDivElement;
    let secondHost: HTMLDivElement;
    let root: Root;
    let controller: MiniReportActionContextMenuController;

    function ControllerCapture() {
        const value = useMiniReportActionContextMenuController();
        useLayoutEffect(() => {
            if (!value) {
                return;
            }
            controller = value;
        }, [value]);
        return null;
    }

    beforeEach(() => {
        container = document.createElement('div');
        firstHost = document.createElement('div');
        secondHost = document.createElement('div');
        document.body.append(container, firstHost, secondHost);
        root = createRoot(container);
        act(() => {
            root.render(
                <MiniReportActionContextMenuProvider>
                    <ControllerCapture />
                </MiniReportActionContextMenuProvider>,
            );
        });
    });

    afterEach(() => {
        act(() => root.unmount());
        container.remove();
        firstHost.remove();
        secondHost.remove();
    });

    it.each(['pointer', 'assistive technology'])('does not carry copy feedback between messages after activation with %s', (inputMethod) => {
        // Given completed copy feedback, the next message must not inherit its checkmark or throttle.
        const firstToken = {current: null};
        const secondToken = {current: null};
        const firstProps = {reportID: '1', originalReportID: '1', reportActionID: '1', isVisible: true};
        const secondProps = {...firstProps, reportActionID: '2'};
        act(() => {
            controller.attach(firstToken, firstHost, firstProps);
        });
        const firstButton = firstHost.querySelector('button');
        act(() => {
            if (inputMethod === 'pointer') {
                firstButton?.dispatchEvent(new Event('pointerover', {bubbles: true}));
            }
            firstButton?.click();
        });
        expect(firstButton?.textContent).toBe('Copied');

        // When leaving the toolbar and entering another row share a commit, a clear can be batched away.
        act(() => {
            controller.detach(firstToken);
            controller.attach(secondToken, secondHost, secondProps);
        });

        // Then the second message has its own usable action rather than the first message's success state.
        const secondButton = secondHost.querySelector('button');
        expect(secondButton?.textContent).toBe('2');
        expect(secondButton?.disabled).toBe(false);
    });

    it('does not let an invisible row replace the hovered message after losing ownership', () => {
        // Given a picker opened outside the toolbar, its invisible row can remain mounted during another hover.
        const firstToken = {current: null};
        const secondToken = {current: null};
        const firstProps = {reportID: '1', originalReportID: '1', reportActionID: '1', isVisible: false};
        const secondProps = {...firstProps, reportActionID: '2', isVisible: true};
        act(() => {
            controller.attach(firstToken, firstHost, firstProps);
        });
        act(() => {
            controller.attach(secondToken, secondHost, secondProps);
        });

        // When the picker's row updates, it must not move the visible menu away from the hovered message.
        let hasClaimedMenu: boolean | undefined;
        act(() => {
            hasClaimedMenu = controller.attach(firstToken, firstHost, {...firstProps, disabledActions: []});
        });

        // Then the picker row uses its local fallback and the hovered message keeps the retained toolbar.
        expect(hasClaimedMenu).toBe(false);
        expect(secondHost.querySelector('button')?.textContent).toBe('2');
        expect(firstHost.querySelector('button')).toBeNull();
    });

    it('does not show a prepared target before its own slot attaches', () => {
        // Given a row kept mounted by a reaction picker, its slot can outlive the next hover's preparation.
        const firstToken = {current: null};
        const secondToken = {current: null};
        const firstProps = {reportID: '1', originalReportID: '1', reportActionID: '1', anchor: firstToken, isVisible: false};
        const secondProps = {...firstProps, reportActionID: '2', anchor: secondToken, isVisible: true};
        act(() => {
            controller.attach(firstToken, firstHost, firstProps);
        });

        // When a hover is canceled before its slot commits, preparation must not reveal its actions in the old row.
        act(() => {
            controller.prepare(secondProps);
        });

        // Then the prepared menu is either detached or hidden until its own slot actually attaches.
        const previousButton = firstHost.querySelector('button');
        if (previousButton) {
            expect(getComputedStyle(previousButton).visibility).toBe('hidden');
        }
        expect(secondHost.querySelector('button')).toBeNull();

        act(() => {
            controller.attach(secondToken, secondHost, secondProps);
        });
        const nextButton = secondHost.querySelector('button');
        expect(nextButton?.textContent).toBe('2');
        expect(nextButton ? getComputedStyle(nextButton).visibility : undefined).toBe('visible');
    });

    it('does not detach a slot that attaches during the provider initial layout', () => {
        // Given an already active row, its first slot can attach before the provider has rendered a target.
        const token = {current: null};
        const props = {reportID: '1', originalReportID: '1', reportActionID: '1', anchor: token, isVisible: true};
        function InitiallyVisibleSlot() {
            const value = useMiniReportActionContextMenuController();
            useLayoutEffect(() => {
                value?.attach(token, firstHost, props);
                return () => value?.detach(token);
            }, [value]);
            return null;
        }

        // When child layout queues the first target, the parent's committed state still has no target.
        act(() => {
            root.render(
                <MiniReportActionContextMenuProvider key="initial-slot">
                    <InitiallyVisibleSlot />
                </MiniReportActionContextMenuProvider>,
            );
        });

        // Then the parent's validation preserves the actual attachment instead of trusting stale render state.
        expect(firstHost.querySelector('button')?.textContent).toBe('1');
    });
});
