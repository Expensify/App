import React from 'react';
import ContentLoader, {Circle, Rect} from 'react-content-loader/native';

const ContentLoadingThreeLines = () => (
    <ContentLoader
        height={100}
        width="100%"
        title=""
    >
        <Circle cx="50" cy="26" r="20" />
        <Rect x="90" y="11" width="20%" height="8" />
        <Rect x="90" y="31" width="75%" height="8" />
        <Rect x="90" y="51" width="75%" height="8" />
        <Rect x="90" y="71" width="50%" height="8" />
    </ContentLoader>
);

ContentLoadingThreeLines.displayName = 'ContentLoadingThreeLines';
export default ContentLoadingThreeLines;
