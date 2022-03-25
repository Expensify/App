import React from 'react';
import {Rect, Circle} from 'react-native-svg';
import ContentLoadingWrapper from './ContentLoadingWrapper';

const ContentLoadingOneLine = () => (
    <ContentLoadingWrapper
        height={60}
    >
        <Circle cx="50" cy="26" r="20" />
        <Rect x="90" y="11" width="20%" height="8" />
        <Rect x="90" y="31" width="90%" height="8" />
    </ContentLoadingWrapper>
);

ContentLoadingOneLine.displayName = 'ContentLoadingOneLine';
export default ContentLoadingOneLine;
