import React from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '@components/ScreenWrapper';

function ExpensifyCodePage() {
    return (
        <ScreenWrapper
            testID={ExpensifyCodePage.displayName}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <FullPageNotFoundView shouldShow />
        </ScreenWrapper>
    );
}

ExpensifyCodePage.displayName = 'ExpensifyCodePage';

export default ExpensifyCodePage;
