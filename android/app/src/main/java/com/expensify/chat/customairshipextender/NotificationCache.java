package com.expensify.chat.customairshipextender;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Bundle;
import android.util.Base64;

import androidx.core.app.Person;
import androidx.core.graphics.drawable.IconCompat;

import java.io.ByteArrayOutputStream;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;

public class NotificationCache {

    private static final HashMap<String, NotificationData> cache = new HashMap();

    /*
     * Get NotificationData for an existing notification or create a new instance
     * if it doesn't exist
     */
    public static NotificationData getNotificationData(long reportID) {
        NotificationData notificationData = cache.get(Long.toString(reportID));

        if (notificationData == null) {
            notificationData = new NotificationData();
            setNotificationData(reportID, notificationData);
        }

        return notificationData;
    }

    /*
     * Set and persist NotificationData in the cache
     */
    public static void setNotificationData(long reportID, NotificationData data) {
        cache.put(Long.toString(reportID), data);
    }

    private static void writeToInternalStorage() {
    }

    public static class NotificationData implements Serializable {
        public HashMap<String, Person> people = new HashMap();
        public HashMap<String, Bitmap> icons = new HashMap();
        public ArrayList<NotificationMessage> messages = new ArrayList<>();

        public int prevNotificationID = -1;

        public NotificationData() {
        }

        public static String encodeTobase64(Bitmap bitmap) {
            if (bitmap == null) {
                return "";
            }

            ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, byteArrayOutputStream);
            byte[] byteArray = byteArrayOutputStream.toByteArray();
            return Base64.encodeToString(byteArray, Base64.DEFAULT);
        }

        public static Bitmap decodeToBitmap(String base64String) {
            if (base64String == null) {
                return null;
            }

            byte[] decodedBytes = Base64.decode(base64String, Base64.DEFAULT);
            return BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.length);
        }
    }

    public static class NotificationMessage implements Serializable {
        public String accountID;
        public String text;
        public long time;

        NotificationMessage(String accountID, String text, long time) {
            this.accountID = accountID;
            this.text = text;
            this.time = time;
        }
    }

    private static Bundle convertToBundle(Person p) {
        Bundle bundle = new Bundle();
        bundle.putBundle("icon", p.getIcon().toBundle());
        bundle.putString("key", p.getKey());
        bundle.putString("name", p.getName().toString());
        return bundle;
    }

    private static Person convertToPerson(Bundle b) {
        if (b == null) {
            return null;
        }

        return new Person.Builder()
                .setIcon(IconCompat.createFromBundle(b.getBundle("icon")))
                .setKey(b.getString("key"))
                .setName(b.getString("name"))
                .build();
    }
}
