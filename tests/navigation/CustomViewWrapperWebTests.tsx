import type CustomViewWrapperType from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/CustomViewWrapper';

import type {Root} from 'react-dom/client';

import React, {Activity, act} from 'react';
import {createPortal} from 'react-dom';
import {createRoot} from 'react-dom/client';

// Jest (jest-expo) resolves the `.native` variant by default, so we require the web entry point explicitly
// (with its `.tsx` extension) to exercise the web implementation.
const customViewWrapperModule: unknown = require('@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/CustomViewWrapper/index.tsx');

// The `require` above yields `any`, and narrowing it to the module shape needs a type assertion that
// can't be avoided for this test-only web-entry-point escape hatch, so disable the rule on this line.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const CustomViewWrapper = (customViewWrapperModule as {default: typeof CustomViewWrapperType}).default;

type Mode = 'visible' | 'hidden';

function WrappedContent({mode}: {mode: Mode}) {
    return (
        <Activity mode={mode}>
            <CustomViewWrapper style={{flex: 1}}>
                <span id="screen-content">screen content</span>
            </CustomViewWrapper>
        </Activity>
    );
}

function BareContent({mode}: {mode: Mode}) {
    return (
        <Activity mode={mode}>
            <div id="bare-screen">screen content</div>
        </Activity>
    );
}

let container: HTMLDivElement;
let root: Root;

async function renderTree(element: React.JSX.Element) {
    // This is the react-dom act, wrapping a react-dom root render, so the react-native rule does not apply here.
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
        root.render(element);
    });
}

function getWrapperElement(): HTMLElement {
    const element = container.querySelector<HTMLElement>('div');
    if (!element) {
        throw new Error('The wrapper element is missing from the document');
    }
    return element;
}

describe('CustomViewWrapper (web)', () => {
    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(async () => {
        await act(async () => {
            root.unmount();
        });
        container.remove();
    });

    it('renders its children', async () => {
        await renderTree(<WrappedContent mode="visible" />);

        expect(container.querySelector('#screen-content')).not.toBeNull();
    });

    it('forces display contents on the host element it renders', async () => {
        await renderTree(<WrappedContent mode="visible" />);

        expect(getWrapperElement().style.getPropertyValue('display')).toBe('contents');
    });

    it('forces display contents with the important priority, which is the only way to outrank React', async () => {
        await renderTree(<WrappedContent mode="visible" />);

        expect(getWrapperElement().style.getPropertyPriority('display')).toBe('important');
    });

    describe('inside a hidden Activity', () => {
        it('keeps the wrapper painted', async () => {
            await renderTree(<WrappedContent mode="visible" />);

            await renderTree(<WrappedContent mode="hidden" />);

            expect(getWrapperElement().style.getPropertyValue('display')).toBe('contents');
        });

        it('keeps the children in the document', async () => {
            await renderTree(<WrappedContent mode="visible" />);

            await renderTree(<WrappedContent mode="hidden" />);

            expect(container.querySelector('#screen-content')).not.toBeNull();
        });

        it('restores display contents when React hides the element again later', async () => {
            await renderTree(<WrappedContent mode="visible" />);
            const wrapper = getWrapperElement();

            // React applies exactly this when it hides a subtree, so applying it by hand drives the observer.
            await act(async () => {
                wrapper.style.setProperty('display', 'none', 'important');
            });

            expect(wrapper.style.getPropertyValue('display')).toBe('contents');
        });

        it('leaves other inline styles alone', async () => {
            await renderTree(<WrappedContent mode="visible" />);
            const wrapper = getWrapperElement();

            await act(async () => {
                wrapper.style.setProperty('opacity', '0.5');
            });

            expect(wrapper.style.getPropertyValue('opacity')).toBe('0.5');
        });

        it('is what keeps the content painted, unlike an unwrapped screen', async () => {
            await renderTree(<BareContent mode="visible" />);

            await renderTree(<BareContent mode="hidden" />);

            const bareScreen = container.querySelector<HTMLElement>('#bare-screen');
            expect(bareScreen?.style.getPropertyValue('display')).toBe('none');
        });
    });

    describe('when the tree is remounted', () => {
        it('attaches a single observer per element', async () => {
            const observeSpy = jest.spyOn(MutationObserver.prototype, 'observe');

            await renderTree(<WrappedContent mode="visible" />);
            await renderTree(<WrappedContent mode="hidden" />);
            await renderTree(<WrappedContent mode="visible" />);

            expect(observeSpy).toHaveBeenCalledTimes(1);
            observeSpy.mockRestore();
        });

        it('enforces display contents again on a fresh mount that starts visible', async () => {
            await renderTree(<WrappedContent mode="visible" />);
            await act(async () => {
                root.unmount();
            });
            root = createRoot(container);

            await renderTree(<WrappedContent mode="visible" />);
            await renderTree(<WrappedContent mode="hidden" />);

            expect(getWrapperElement().style.getPropertyValue('display')).toBe('contents');
        });
    });

    describe('mounted straight into a hidden Activity', () => {
        it('never attaches the enforcer, because React skips the refs of a subtree that mounts hidden', async () => {
            // useScreenActivityMode keeps the first render pass of every screen visible for exactly this reason.
            await renderTree(<WrappedContent mode="hidden" />);

            expect(getWrapperElement().style.getPropertyValue('display')).toBe('none');
        });

        it('enforces display contents as soon as the screen is revealed once', async () => {
            await renderTree(<WrappedContent mode="hidden" />);

            await renderTree(<WrappedContent mode="visible" />);

            expect(getWrapperElement().style.getPropertyValue('display')).toBe('contents');
        });
    });

    describe('content a screen renders through a portal', () => {
        // Popovers and modals render outside the screen subtree, so the enforcer that keeps the screen painted
        // does not protect them. These checks pin what actually happens to them when their screen gets covered,
        // which on a device decides whether a popover that is still open disappears at once.
        function PortalContent({mode}: {mode: Mode}) {
            return (
                <Activity mode={mode}>
                    <CustomViewWrapper style={{flex: 1}}>
                        <span id="screen-content">screen content</span>
                        {createPortal(<span id="portal-content">portal content</span>, document.body)}
                    </CustomViewWrapper>
                </Activity>
            );
        }

        it('stays in the document while the screen is covered', async () => {
            await renderTree(<PortalContent mode="visible" />);

            await renderTree(<PortalContent mode="hidden" />);

            expect(document.querySelector('#portal-content')).not.toBeNull();
        });

        it('keeps being painted, because React hides only the host elements of the subtree itself', async () => {
            await renderTree(<PortalContent mode="visible" />);

            await renderTree(<PortalContent mode="hidden" />);

            // A popover of a covered screen therefore stays on screen until its own close chain dismisses it,
            // which a hidden Activity still lets run.
            const portalContent = document.querySelector<HTMLElement>('#portal-content');
            expect(portalContent?.style.getPropertyValue('display')).toBe('');
        });

        it('survives the screen being revealed again', async () => {
            await renderTree(<PortalContent mode="visible" />);
            await renderTree(<PortalContent mode="hidden" />);

            await renderTree(<PortalContent mode="visible" />);

            expect(document.querySelector('#portal-content')).not.toBeNull();
        });
    });

    describe('without MutationObserver support', () => {
        const originalMutationObserver = globalThis.MutationObserver;

        afterEach(() => {
            globalThis.MutationObserver = originalMutationObserver;
        });

        it('renders the children instead of throwing', async () => {
            Reflect.deleteProperty(globalThis, 'MutationObserver');

            await renderTree(<WrappedContent mode="visible" />);

            expect(container.querySelector('#screen-content')).not.toBeNull();
        });
    });
});
