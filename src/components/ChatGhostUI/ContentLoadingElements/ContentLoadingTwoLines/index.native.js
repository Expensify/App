import React from 'react';
import ContentLoader, {Rect, Circle} from 'react-content-loader/native';

const ContentLoadingTwoLines = () => (
    <ContentLoader
        height={80}
        width="100%"
        title=""
    >
        <Circle cx="50" cy="26" r="20" />
        <Rect x="90" y="11" width="20%" height="8" />
        <Rect x="90" y="31" width="90%" height="8" />
        <Rect x="90" y="51" width="50%" height="8" />
    </ContentLoader>
);

ContentLoadingTwoLines.displayName = 'ContentLoadingTwoLines';
export default ContentLoadingTwoLines;
