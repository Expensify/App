package com.expensify.chat;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;




public class CheckPDFDocument extends ReactContextBaseJavaModule {
    private static final String MODULE_NAME = "CheckPDFDocument";

    public CheckPDFDocument(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @ReactMethod
    public void checkPdf(String uri, Callback callback) {
        String path = uri.replaceFirst("^file:", "");
        if (PdfUtils.isPdfCorrupted(path)) {
            // Handle the case where the PDF file is corrupted
            callback.invoke(false);
        } else {
            // Proceed with processing the PDF file
            // For example, display the PDF file to the user
            callback.invoke(true);
        }
    }
}