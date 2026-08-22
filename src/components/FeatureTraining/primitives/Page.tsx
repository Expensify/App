import type {ReactNode} from 'react';

import {isValidElement} from 'react';

type PageProps = {
    /** Page content — an Illustration and a Body */
    children?: ReactNode;
};

/**
 * Marker component. When rendered directly outside a Carousel it returns its children as-is.
 * The Carousel root filters children by this component type to enumerate pages.
 */
function Page({children}: PageProps) {
    if (children == null) {
        return null;
    }
    if (isValidElement(children)) {
        return children;
    }
    return null;
}

Page.displayName = 'FeatureTraining.Page';

export default Page;
