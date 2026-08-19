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

        // Given content wrapped in AlwaysPaintedView inside a visible Activity
        render(<ActivityProbe mode="visible" />);
        const element = getHostElement();
        expect(element.style.display).toBe('contents');
        expect(element.style.getPropertyPriority('display')).toBe('important');

        // When the Activity switches to the hidden mode
        render(<ActivityProbe mode="hidden" />);

        // Then the host keeps the display contents rule, so Activity cannot give the wrapper a box of its own
        expect(element.style.display).toBe('contents');
        expect(element.style.getPropertyPriority('display')).toBe('important');

        // When the Activity switches back to the visible mode
        render(<ActivityProbe mode="visible" />);

        // Then the rule is still in place
        expect(element.style.display).toBe('contents');
        expect(element.style.getPropertyPriority('display')).toBe('important');

        unmount();
    });

    it('refuses both display write paths React uses and forwards every other style write', () => {
        const {render, getHostElement, unmount} = mountWebRoot();

        // Given content wrapped in AlwaysPaintedView
        render(
            <AlwaysPaintedView>
                <span data-testid="content" />
            </AlwaysPaintedView>,
        );
        const element = getHostElement();

        // When display is written through setProperty, which is how React writes an important rule
        element.style.setProperty('display', 'none', 'important');

        // Then the rule stays contents
        expect(element.style.display).toBe('contents');

        // When display is written through the property setter, which is how React writes a plain rule
        element.style.display = 'block';

        // Then the rule stays contents, so both paths are covered
        expect(element.style.display).toBe('contents');

        // When any other property is written
        element.style.setProperty('opacity', '0.5');
        // Then it goes through untouched
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

        // Given content wrapped in AlwaysPaintedView
        // When it renders covered
        renderInert(true);

        // Then the host is inert, which takes the content out of the tab order and out of accessibility
        const element = getHostElement();
        expect(element.hasAttribute('inert')).toBe(true);

        // When it renders uncovered
        renderInert(false);

        // Then the content is reachable again
        expect(element.hasAttribute('inert')).toBe(false);

        unmount();
    });
});
