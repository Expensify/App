package com.expensify.chat.customairshipextender;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;

import androidx.core.app.Person;
import androidx.core.graphics.drawable.IconCompat;

import com.expensify.chat.MainApplication;
import com.urbanairship.UAirship;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;

public class NotificationCache {

    private static final String CACHE_FILE_NAME = "notification-cache";
    private static HashMap<String, NotificationData> cache = null;

    /*
     * Get NotificationData for an existing notification or create a new instance
     * if it doesn't exist
     */
    public static NotificationData getNotificationData(long reportID) {
        if (cache == null) {
            cache = readFromInternalStorage();
        }

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
        if (cache == null) {
            cache = readFromInternalStorage();
        }

        cache.put(Long.toString(reportID), data);
        writeToInternalStorage();
    }

    private static void writeToInternalStorage() {
        Context context = UAirship.getApplicationContext();

        FileOutputStream fos = null;
        ObjectOutputStream oos = null;
        try {
            File outputFile = new File(context.getFilesDir(), CACHE_FILE_NAME);
            fos = new FileOutputStream(outputFile);
            oos = new ObjectOutputStream(fos);
            oos.writeObject(cache);
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            try {
                if (oos != null) {
                    oos.close();
                }
                if (fos != null) {
                    fos.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    private static HashMap<String, NotificationData> readFromInternalStorage() {
        HashMap<String, NotificationData> result;
        Context context = UAirship.getApplicationContext();

        FileInputStream fis = null;
        ObjectInputStream ois = null;
        try {
            File fileCache = new File(context.getFilesDir(), CACHE_FILE_NAME);
            fis = new FileInputStream(fileCache);
            ois = new ObjectInputStream(fis);
            result = (HashMap<String, NotificationData>) ois.readObject();
        } catch (IOException | ClassNotFoundException e) {
            e.printStackTrace();
            result = new HashMap<>();
        } finally {
            try {
                if (ois != null) {
                    ois.close();
                }
                if (fis != null) {
                    fis.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        return result;
    }

    /**
     * A class for caching data for notifications. We use this to track active notifications so we
     * can thread related notifications together
     */
    public static class NotificationData implements Serializable {
        private final HashMap<String, String> names = new HashMap<>();

        // A map of accountID => base64 encoded Bitmap
        // In order to make Bitmaps serializable, we encode them as base64 strings
        private final HashMap<String, String> icons = new HashMap<>();
        public ArrayList<NotificationMessage> messages = new ArrayList<>();

        public int prevNotificationID = -1;

        public NotificationData() {}

        public Bitmap getIcon(String accountID) {
            return decodeToBitmap(icons.get(accountID));
        }

        public void putIcon(String accountID, Bitmap bitmap) {
            icons.put(accountID, encodeToBase64(bitmap));
        }

        public Person getPerson(String accountID) {
            if (!names.containsKey(accountID) || !icons.containsKey(accountID)) {
                return null;
            }

            String name = names.get(accountID);
            Bitmap icon = getIcon(accountID);

            return new Person.Builder()
                    .setIcon(IconCompat.createWithBitmap(icon))
                    .setKey(accountID)
                    .setName(name)
                    .build();
        }

        public void putPerson(String accountID, String name, Bitmap icon) {
            names.put(accountID, name);
            putIcon(accountID, icon);
        }

        public static String encodeToBase64(Bitmap bitmap) {
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
}
