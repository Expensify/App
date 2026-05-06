import React from 'react';
import RenderHTML from '@components/RenderHTML';

// This is equivalent to returning a negative boolean in normal functions, but we can keep the element return type.
// If the child was rendered using RenderHTML and an empty html string, it has an empty prop called html.
// If we render an empty component/fragment, this does not apply.
const emptyHTML = <RenderHTML html="" />;

const isEmptyHTML = <T extends React.JSX.Element>({props: {html}}: T): boolean => typeof html === 'string' && html.length === 0;

export {emptyHTML, isEmptyHTML};
