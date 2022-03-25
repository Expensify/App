import React from 'react';
import {Rect, Circle} from 'react-native-svg';
import ContentLoadingWrapper from './ContentLoadingWrapper';

const ContentLoadingThreeLines = () => (
    <ContentLoadingWrapper
        height={100}
    >
        <Circle cx="50" cy="26" r="20" />
        <Rect x="90" y="11" width="20%" height="8" />
        <Rect x="90" y="31" width="90%" height="8" />
        <Rect x="90" y="51" width="90%" height="8" />
        <Rect x="90" y="71" width="50%" height="8" />
    </ContentLoadingWrapper>
);

ContentLoadingThreeLines.displayName = 'ContentLoadingThreeLines';
export default ContentLoadingThreeLines;
