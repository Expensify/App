package com.expensify.chat.customairshipextender;

import android.graphics.Bitmap;
import androidx.core.app.Person;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class NotificationCache {

    public static final HashMap<Long, NotificationData> cache = new HashMap<>();

    /*
     * Get NotificationData for an existing notification or create a new instance
     * if it doesn't exist
     */
    public static NotificationData getNotificationData(long reportID) {
        NotificationData notificationData = cache.get(reportID);

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
        cache.put(reportID, data);
    }

    public static class NotificationData {
        public Map<String, Person> people = new HashMap<>();
        public ArrayList<Message> messages = new ArrayList<>();

        public Map<String, Bitmap> bitmapIcons = new HashMap<>();
        public int prevNotificationID = -1;

        public static class Message {
            public Person person;
            public String text;
            public long time;

            Message(Person person, String text, long time) {
                this.person = person;
                this.text = text;
                this.time = time;
            }
        }
    }
}
