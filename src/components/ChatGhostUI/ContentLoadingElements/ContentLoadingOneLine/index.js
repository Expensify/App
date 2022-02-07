import React from 'react';
import ContentLoader from 'react-content-loader';

const ContentLoadingOneLine = () => (
    <ContentLoader
        height={60}
        width="100%"
        title=""
    >
        <circle cx="50" cy="26" r="20" />
        <rect x="90" y="11" width="20%" height="8" />
        <rect x="90" y="31" width="90%" height="8" />
    </ContentLoader>
);

ContentLoadingOneLine.displayName = 'ContentLoadingOneLine';
export default ContentLoadingOneLine;
