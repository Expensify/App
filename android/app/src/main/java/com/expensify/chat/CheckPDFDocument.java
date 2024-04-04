package com.expensify.chat;

import com.itextpdf.kernel.pdf.PdfReader;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
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
        Log.d(MODULE_NAME, "Checking pdf: " + name);
        try {
            PdfReader pdfReader = new PdfReader(name);
            Log.d("good", "pdfFileValidator ==> Exit");
            callback.invoke(true);
        } catch (Throwable e) {
            e.printStackTrace();
            Log.e("bad", "pdfFileValidator ==> Exit. Error ==> " + e.getMessage());
            callback.invoke(false);
        }
    }
}