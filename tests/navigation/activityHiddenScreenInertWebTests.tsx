import type ScreenActivityWrapperType from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper';

import type {Root} from 'react-dom/client';

import React, {act} from 'react';
import {createRoot} from 'react-dom/client';

/**
 * EC-17 from repo/activity-wrapper-edge-cases/EDGE_CASES.md: the wrapper keeps a hidden screen painted, so its
 * stale content would stay reachable for screen readers, the tab order and the pointer. RN8's ActivityView marks
 * content that is not focused with `inert`, and the tests below hold our wrapper to the same contract.
 */

// Jest resolves the `.native` CustomViewWrapper by default; the wrapper under test must use the web variant.
jest.mock('@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/CustomViewWrapper', () =>
    jest.requireActual<Record<string, unknown>>('@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/CustomViewWrapper/index.tsx'),
);

// The mode hook is navigation-driven; deriving it straight from the blurred prop keeps the harness free of a
// whole navigator while the wrapper still goes through its real hidden and visible states.
jest.mock('@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper/useScreenActivityMode', () => ({
    __esModule: true,
    default: ({isScreenCovered}: {isScreenCovered: boolean}) => (isScreenCovered ? 'hidden' : 'visible'),
}));

// The covered hook reads the navigation state for the same reason, so it reports what the harness passes in.
jest.mock('@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper/useIsScreenCovered', () => ({
    __esModule: true,
    default: (isScreenBlurred: boolean) => isScreenBlurred,
}));

jest.mock('@hooks/useThemeStyles', () => ({
    __esModule: true,
    default: () => ({flex1: {flex: 1}}),
}));

// Jest resolves the `.native` variant by default, so we require the web entry point explicitly (with its
// `.tsx` extension) to exercise the web implementation.
const screenActivityWrapperModule: unknown = require('@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper/index.tsx');

// The `require` above yields `any`, and narrowing it to the module shape needs a type assertion that
// can't be avoided for this test-only web-entry-point escape hatch, so disable the rule on this line.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const ScreenActivityWrapper = (screenActivityWrapperModule as {default: typeof ScreenActivityWrapperType}).default;

function WrappedScreen({isScreenBlurred}: {isScreenBlurred: boolean}) {
    return (
        <ScreenActivityWrapper
            isScreenBlurred={isScreenBlurred}
            routeKey="route-key-1"
            routeName="TestScreen"
        >
            <span id="screen-content">screen content</span>
        </ScreenActivityWrapper>
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

describe('accessibility of a screen deprioritized with Activity (web)', () => {
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

    it('exposes a visible screen to the accessibility tree', async () => {
        await renderTree(<WrappedScreen isScreenBlurred={false} />);

        expect(container.querySelector('#screen-content')).not.toBeNull();
        expect(container.querySelector('[inert]')).toBeNull();
    });

    it('marks a covered screen inert, so its stale painted content leaves the accessibility tree', async () => {
        await renderTree(<WrappedScreen isScreenBlurred={false} />);

        await renderTree(<WrappedScreen isScreenBlurred />);

        // The content must stay painted (that is the wrapper's whole point), but while it is deprioritized it
        // must not be reachable by screen readers or the tab order, which `inert` on the wrapper provides.
        expect(container.querySelector('#screen-content')).not.toBeNull();
        expect(container.querySelector('[inert]')).not.toBeNull();
    });

    it('gives the screen back to the accessibility tree as soon as it stops being covered', async () => {
        await renderTree(<WrappedScreen isScreenBlurred />);

        await renderTree(<WrappedScreen isScreenBlurred={false} />);

        expect(container.querySelector('[inert]')).toBeNull();
    });

    it('keeps forcing display contents on the inert wrapper, so the covered screen stays painted', async () => {
        // The screen has to mount visible for the enforcer to attach, which is what useScreenActivityMode does.
        await renderTree(<WrappedScreen isScreenBlurred={false} />);

        await renderTree(<WrappedScreen isScreenBlurred />);

        const wrapper = container.querySelector<HTMLElement>('div');
        expect(wrapper?.style.getPropertyValue('display')).toBe('contents');
    });
});
