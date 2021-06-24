/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import HTML from './BaseRenderHTML';

const RenderHTML = props => (
    <HTML
        stextSelectable
        {...props}
    />
);


export default RenderHTML;
