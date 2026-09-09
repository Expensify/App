import ProductMarketingWindowPortal from '@components/ProductMarketingWindow/ProductMarketingWindowPortal';

/* eslint-disable testing-library/no-unnecessary-act -- This test drives a react-dom root directly, so render and unmount must be wrapped in act. */
import type {Root} from 'react-dom/client';

import {act} from 'react';
import {createRoot} from 'react-dom/client';

describe('ProductMarketingWindowPortal', () => {
    let container: HTMLDivElement;
    let root: Root;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => {
            root.unmount();
        });
        container.remove();
    });

    it('renders the marketing window at the body level instead of inside the navigator stacking context', () => {
        act(() => {
            root.render(
                <ProductMarketingWindowPortal>
                    <div id="ProductMarketingWindowManager" />
                </ProductMarketingWindowPortal>,
            );
        });

        expect(container.querySelector('#ProductMarketingWindowManager')).toBeNull();
        expect(document.body.querySelector('#ProductMarketingWindowManager')?.parentElement).toBe(document.body);
    });
});
