import React from 'react';
import ContentLoader, {Circle, Rect} from 'react-content-loader/native';

const ContentLoadingOneLine = () => (
    <ContentLoader
        height={60}
        width="100%"
        title=""
    >
        <Circle cx="50" cy="26" r="20" />
        <Rect x="90" y="11" width="20%" height="8" />
        <Rect x="90" y="31" width="90%" height="8" />
    </ContentLoader>
);

ContentLoadingOneLine.displayName = 'ContentLoadingOneLine';
export default ContentLoadingOneLine;
