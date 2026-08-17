import {getDisplayContentsViewConfig} from '@components/DisplayContentsView/index.native';

import type {ActivityProps, ComponentType, PropsWithChildren, ReactNode} from 'react';
import type {Root} from 'react-dom/client';

import {act, Activity} from 'react';
import {createRoot} from 'react-dom/client';

/* eslint-disable testing-library/no-unnecessary-act -- this test drives a react-dom root directly, so its renders and cleanup must be wrapped in React act. */

type WebDisplayContentsViewProps = PropsWithChildren<{inert?: boolean}>;

type CreateAttributePayload = (props: Record<string, unknown>, validAttributes: ReturnType<typeof getDisplayContentsViewConfig>['validAttributes']) => Record<string, unknown> | null;

const DisplayContentsViewWeb = jest.requireActual<{default: ComponentType<WebDisplayContentsViewProps>}>('@components/DisplayContentsView/index.tsx').default;
const {create: createAttributePayload} = jest.requireActual<{create: CreateAttributePayload}>('react-native/Libraries/ReactNative/ReactFabricPublicInstance/ReactNativeAttributePayload');

function ActivityProbe({mode}: {mode: ActivityProps['mode']}) {
    return (
        <Activity mode={mode}>
            <DisplayContentsViewWeb>
                <span data-testid="content" />
            </DisplayContentsViewWeb>
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
                throw new Error('DisplayContentsView did not render a DOM element');
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

describe('DisplayContentsView', () => {
    it('processes the display value used by native Activity hiding as contents', () => {
        const viewConfig = getDisplayContentsViewConfig();

        expect(createAttributePayload({style: {display: 'none'}}, viewConfig.validAttributes)).toEqual({display: 'contents'});
    });

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

    it('takes the content out of the tab order only while it is covered', () => {
        const {render, getHostElement, unmount} = mountWebRoot();

        const renderInert = (inert: boolean) =>
            render(
                <DisplayContentsViewWeb inert={inert}>
                    <span data-testid="content" />
                </DisplayContentsViewWeb>,
            );

        renderInert(true);
        const element = getHostElement();
        expect(element.hasAttribute('inert')).toBe(true);

        renderInert(false);
        expect(element.hasAttribute('inert')).toBe(false);

        unmount();
    });
});
