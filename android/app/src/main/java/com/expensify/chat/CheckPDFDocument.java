package com.expensify.chat;

import com.itextpdf.kernel.pdf.PdfReader;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.File;
import java.io.IOException;
import java.util.Map;
import java.util.HashMap;
import com.facebook.react.bridge.Callback;
import android.util.Log;



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
    public void checkPdf(String name, Callback callback) {
        if (PdfUtils.isPdfCorrupted(name)) {
            // Handle the case where the PDF file is corrupted
            callback.invoke(false);
        } else {
            // Proceed with processing the PDF file
            // For example, display the PDF file to the user
            callback.invoke(true);
        }
    }
}