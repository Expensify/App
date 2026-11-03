import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
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
import {WebView} from 'react-native-webview';

/** Reads how Wise's form ended from a navigation that leaves Wise's site for the redirect URL, or returns null for any other navigation */
function getRedirectStatus(url: string, formURL: string): string | null {
    try {
        const {host, searchParams} = new URL(url);
        return host === new URL(formURL).host ? null : searchParams.get(CONST.WISE.KYC_REVIEW_REDIRECT_STATUS_PARAM);
    } catch {
        return null;
    }
}

/** Shows Wise's hosted KYC form in a WebView, as Wise's mobile guides describe, and closes it when the form ends */
function WiseKYCReviewPage() {
    const [kycReviewURL] = useOnyx(ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK, {selector: (embeddedLink) => embeddedLink?.url});
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.WISE_KYC_REVIEW.path);

    const goBack = () => Navigation.goBack(backPath);

    // Wise ends the form by redirecting to our redirect URL with the outcome in a query param, so the WebView stops there instead of loading that page
    const closeFormOnRedirect = ({url, isTopFrame}: ShouldStartLoadRequest) => {
        const status = isTopFrame && kycReviewURL ? getRedirectStatus(url, kycReviewURL) : null;
        if (!status) {
            return true;
        }
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
                shouldShow={!kycReviewURL}
                onBackButtonPress={goBack}
            >
                {/* Wise's form has its own header with a close button, so it takes the whole screen */}
                <WebView
                    source={{uri: kycReviewURL ?? ''}}
                    onShouldStartLoadWithRequest={closeFormOnRedirect}
                    // The form's ID document step films the user, so the camera preview has to play inline, and Wise's own host gets the camera without a second prompt
                    allowsInlineMediaPlayback
                    mediaCapturePermissionGrantType="grantIfSameHostElsePrompt"
                    startInLoadingState
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default WiseKYCReviewPage;
