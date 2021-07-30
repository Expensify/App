import React from 'react';

const ComposeProviders = props => (
    <>
        {props.components.reduceRight((memo, Component) => (
            <Component>{memo}</Component>
        ), props.children)}
    </>
);

ComposeProviders.displayName = 'ComposeProviders';
export default ComposeProviders;
