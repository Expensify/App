import React from 'react';
import {useOnyx} from 'react-native-onyx';
import type {FullPageNotFoundViewProps} from '@components/BlockingViews/FullPageNotFoundView';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '@components/ScreenWrapper';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';

type NotFoundPageProps = {
    onBackButtonPress?: () => void;
    isReportRelatedPage?: boolean;
} & FullPageNotFoundViewProps;

// eslint-disable-next-line rulesdir/no-negated-variables
function NotFoundPage({onBackButtonPress = () => Navigation.goBack(), isReportRelatedPage, ...fullPageNotFoundViewProps}: NotFoundPageProps) {
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to go back to the not found page on large screens and to the home page on small screen
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const topmostReportId = Navigation.getTopmostReportId();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${topmostReportId}`);

    return (
        <ScreenWrapper testID={NotFoundPage.displayName}>
            <FullPageNotFoundView
                shouldShow
                onBackButtonPress={() => {
                    if (!isReportRelatedPage || !isSmallScreenWidth) {
                        onBackButtonPress();
                        return;
                    }

                    // detect the report is invalid
                    if (topmostReportId && (!report || report.errorFields?.notFound)) {
                        Navigation.dismissModal();
                        return;
                    }
                    onBackButtonPress();
                }}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...fullPageNotFoundViewProps}
            />
        </ScreenWrapper>
    );
}

NotFoundPage.displayName = 'NotFoundPage';

export default NotFoundPage;
