import React from 'react';
import type {FullPageNotFoundViewProps} from '@components/BlockingViews/FullPageNotFoundView';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '@components/ScreenWrapper';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import ROUTES from '@src/ROUTES';

type NotFoundPageProps = {
    onBackButtonPress?: () => void;
    isReportRelatedPage?: boolean;
} & FullPageNotFoundViewProps;

// eslint-disable-next-line rulesdir/no-negated-variables
function NotFoundPage({onBackButtonPress = () => Navigation.goBack(), isReportRelatedPage, ...fullPageNotFoundViewProps}: NotFoundPageProps) {
    const {isSmallScreen} = useWindowDimensions();

    return (
        <ScreenWrapper testID={NotFoundPage.displayName}>
            <FullPageNotFoundView
                shouldShow
                onBackButtonPress={() => {
                    if (!isReportRelatedPage || !isSmallScreen) {
                        onBackButtonPress();
                        return;
                    }
                    const topmostReportId = Navigation.getTopmostReportId();
                    const report = ReportUtils.getReport(topmostReportId ?? '');
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
