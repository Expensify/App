package com.expensify.chat.customairshipextender;

import android.util.Log;

import androidx.annotation.NonNull;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import com.urbanairship.json.JsonException;
import com.urbanairship.json.JsonValue;
import com.urbanairship.push.PushMessage;
import com.urbanairship.push.PushProviderBridge;
import com.urbanairship.push.fcm.AirshipFirebaseIntegration;
import com.urbanairship.push.fcm.FcmPushProvider;
import com.urbanairship.util.UAStringUtil;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.zip.GZIPInputStream;

/**
 * Airship FirebaseMessagingService.
 */
public class CustomFirebaseMessagingService extends FirebaseMessagingService {

    // Key to look for to know which fields to decompress
    private static final String GZIPPED_FIELDS = "gzipped_fields";
    // Logging tag
    private static final String TAG = "CustomFcmService";

    @Override
    public void onMessageReceived(@NonNull RemoteMessage message) {
        PushMessage pushMessage = parseMessage(message);
        PushProviderBridge.processPush(FcmPushProvider.class, pushMessage)
                .executeSync(getApplicationContext());
    }

    @Override
    public void onNewToken(@NonNull String token) {
        AirshipFirebaseIntegration.processNewToken(getApplicationContext(), token);
    }

    private static PushMessage parseMessage(RemoteMessage message) {
        Map<String, String> data = new HashMap<>(message.getData());
        List<String> gzippedKeys = parseGzippedKeys(data);

        for (String key : gzippedKeys) {
            String gzippedValue = data.get(key);
            if (gzippedValue != null) {
                try {
                    String decompressed = decompress(gzippedValue);
                    data.put(key, decompressed);
                } catch (Exception e) {
                    Log.e(TAG, "Failed to decompress field " + key, e);
                    data.remove(key);
                }
            }
        }

        return new PushMessage(data);
    }

    private static List<String> parseGzippedKeys(Map<String, String> data) {
        String keysJsonString = data.get(GZIPPED_FIELDS);
        if (UAStringUtil.isEmpty(keysJsonString)) {
            return Collections.emptyList();
        }

        try {
            JsonValue jsonValue = JsonValue.parseString(keysJsonString);
            if (jsonValue.isString()) {
                return Collections.singletonList(jsonValue.optString());
            }

            List<String> keys = new ArrayList<>();
            for (JsonValue jsonKey : jsonValue.requireList()) {
                keys.add(jsonKey.requireString());
            }
            return keys;
        } catch (JsonException e) {
            Log.e(TAG, "Failed to parse gzipped keys", e);
            return Collections.emptyList();
        }
    }

    private static String decompress(String encoded) throws IOException {
        GZIPInputStream gzipInput = null;
        BufferedReader bufferedReader = null;
        try {
            byte[] byteArray = UAStringUtil.base64Decode(encoded);
            gzipInput = new GZIPInputStream(new ByteArrayInputStream(byteArray));
            bufferedReader = new BufferedReader(new InputStreamReader(gzipInput));

            StringBuilder sb = new StringBuilder();
            String inputLine;
            while ((inputLine = bufferedReader.readLine()) != null) {
                sb.append(inputLine);
            }
            return sb.toString();
        } finally {
            if (gzipInput != null) {
                gzipInput.close();
            }

            if (bufferedReader != null) {
                bufferedReader.close();
            }
        }
    }
}