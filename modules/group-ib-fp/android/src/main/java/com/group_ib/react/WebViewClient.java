package com.group_ib.react;

import android.graphics.Bitmap;
import android.webkit.WebView;

import com.group_ib.sdk.MobileSdk;

public class WebViewClient extends android.webkit.WebViewClient {
    private final MobileSdk.WebViewClient webViewClient;
    
    public WebViewClient() {
        webViewClient = new MobileSdk.WebViewClient();
    }

    @Override
    public void onPageStarted(WebView webView, String s, Bitmap bitmap) {
        webViewClient.onPageStarted(webView, s, bitmap);
    }
}
