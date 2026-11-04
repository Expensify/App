import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FullScreenWebView from '@components/FullScreenWebView';
import ScreenWrapper from '@components/ScreenWrapper';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useOnyx from '@hooks/useOnyx';

import Log from '@libs/Log';

import Navigation from '@navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import type {ShouldStartLoadRequest} from 'react-native-webview/lib/WebViewTypes';

import React from 'react';

function parseURL(url: string): URL | undefined {
    try {
        return new URL(url);
    } catch {
        return undefined;
    }
}

function isWiseURL(url: string): boolean {
    const hostname = parseURL(url)?.hostname;
    return CONST.WISE.KYC_REVIEW_FORM_HOSTS.some((host) => host === hostname);
}

/** Reads how Wise's form ended from a navigation that leaves Wise's site for the redirect URL, or returns undefined for any other navigation */
function getRedirectStatus(url: string) {
    if (isWiseURL(url)) {
        return undefined;
    }
    return parseURL(url)?.searchParams.get(CONST.WISE.KYC_REVIEW_REDIRECT_STATUS_PARAM);
}

/** Shows Wise's hosted KYC form in a WebView, as Wise's mobile guides describe, and closes it when the form ends */
function WiseKYCReviewPage() {
    const [kycReviewURL] = useOnyx(ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK, {selector: (embeddedLink) => embeddedLink?.url});
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.WISE_KYC_REVIEW.path);

    // The link comes from the server, so only a link to Wise is shown, never a lookalike page inside the app
    const formURL = kycReviewURL && isWiseURL(kycReviewURL) ? kycReviewURL : undefined;

    const goBack = () => Navigation.goBack(backPath);

    // Wise ends the form by redirecting to our redirect URL with the outcome in a query param, so the WebView stops there instead of loading that page
    const closeFormOnRedirect = ({url}: ShouldStartLoadRequest) => {
        const status = getRedirectStatus(url);
        if (!status) {
            return true;
        }
        // This log is temporary and only makes the outcome visible for testing, until the status page shows it
        Log.info('[Wise] The KYC review form ended', false, {status});
        goBack();
        return false;
    };

    return (
        <ScreenWrapper
            testID="WiseKYCReviewPage"
            shouldEnableMaxHeight
        >
            {/* The link lives only in memory, so a restored or deep linked screen has no form to show */}
            <FullPageNotFoundView
                shouldShow={!formURL}
                onBackButtonPress={goBack}
            >
                {/* Wise's form has its own header with a close button, so it takes the whole screen */}
                <FullScreenWebView
                    source={{uri: formURL ?? ''}}
                    onShouldStartLoadWithRequest={closeFormOnRedirect}
                    // The form holds identity documents, so its cookies and cache do not outlive the screen
                    incognito
                    // The form's ID document step films the user, so the camera preview has to play inline, and Wise's own host gets the camera without a second prompt
                    allowsInlineMediaPlayback
                    mediaCapturePermissionGrantType="grantIfSameHostElsePrompt"
                    onGoBack={goBack}
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default WiseKYCReviewPage;
