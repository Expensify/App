import type AlwaysPaintedViewProps from '@components/AlwaysPaintedView/types';

import type {ActivityProps, ComponentType, ReactNode} from 'react';
import type {Root} from 'react-dom/client';

import {act, Activity} from 'react';
import {createRoot} from 'react-dom/client';

/* eslint-disable testing-library/no-unnecessary-act -- this test drives a react-dom root directly, so its renders and cleanup must be wrapped in React act. */

// Jest (jest-expo) resolves the `.native` variant by default, so we require the web entry point
// explicitly (with its `.tsx` extension) to exercise the web implementation.
const AlwaysPaintedView = jest.requireActual<{default: ComponentType<AlwaysPaintedViewProps>}>('@components/AlwaysPaintedView/index.tsx').default;

function ActivityProbe({mode}: {mode: ActivityProps['mode']}) {
    return (
        <Activity mode={mode}>
            <AlwaysPaintedView>
                <span data-testid="content" />
            </AlwaysPaintedView>
        </Activity>
    );
}

function mountWebRoot() {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root: Root = createRoot(container);

    return {
        render: (node: ReactNode) => {
            act(() => {
                root.render(node);
            });
        },
        getHostElement: () => {
            const element = container.querySelector<HTMLSpanElement>('[data-testid="content"]')?.parentElement;
            if (!element) {
                throw new Error('AlwaysPaintedView did not render a DOM element');
            }
            return element;
        },
        unmount: () => {
            act(() => {
                root.unmount();
            });
            container.remove();
        },
    };
}

describe('AlwaysPaintedView', () => {
    it('stays layout-neutral through React DOM Activity hide and reveal paths', () => {
        const {render, getHostElement, unmount} = mountWebRoot();

        render(<ActivityProbe mode="visible" />);
        const element = getHostElement();
        expect(element.style.display).toBe('contents');
        expect(element.style.getPropertyPriority('display')).toBe('important');

        render(<ActivityProbe mode="hidden" />);
        expect(element.style.display).toBe('contents');
        expect(element.style.getPropertyPriority('display')).toBe('important');

        render(<ActivityProbe mode="visible" />);
        expect(element.style.display).toBe('contents');
        expect(element.style.getPropertyPriority('display')).toBe('important');

        unmount();
    });

    it('refuses both display write paths React uses and forwards every other style write', () => {
        const {render, getHostElement, unmount} = mountWebRoot();

        render(
            <AlwaysPaintedView>
                <span data-testid="content" />
            </AlwaysPaintedView>,
        );
        const element = getHostElement();

        element.style.setProperty('display', 'none', 'important');
        expect(element.style.display).toBe('contents');

        element.style.display = 'block';
        expect(element.style.display).toBe('contents');

        element.style.setProperty('opacity', '0.5');
        expect(element.style.opacity).toBe('0.5');

        unmount();
    });

    it('takes the content out of the tab order only while it is covered', () => {
        const {render, getHostElement, unmount} = mountWebRoot();

        const renderInert = (inert: boolean) =>
            render(
                <AlwaysPaintedView inert={inert}>
                    <span data-testid="content" />
                </AlwaysPaintedView>,
            );

        renderInert(true);
        const element = getHostElement();
        expect(element.hasAttribute('inert')).toBe(true);

        renderInert(false);
        expect(element.hasAttribute('inert')).toBe(false);

        unmount();
    });
});
