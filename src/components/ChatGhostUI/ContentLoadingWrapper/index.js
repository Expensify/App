import React from 'react';
import PropTypes from 'prop-types';
import ContentLoader from 'react-content-loader';

const propTypes = {
    /* Children to wrap within the Content Loader */
    children: PropTypes.node.isRequired,

    /* Height of the content-loader */
    height: PropTypes.number.isRequired,
};

const ContentLoadingWrapper = (props) => {
    <ContentLoader height={props.height} width="100%" title="">
        {props.children}
    </ContentLoader>;
};

ContentLoadingWrapper.protoTypes = propTypes;
ContentLoadingWrapper.displayName = 'ContentLoadingWrapper';
export default ContentLoadingWrapper;
