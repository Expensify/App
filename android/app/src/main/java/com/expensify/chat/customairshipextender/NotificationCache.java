package com.expensify.chat.customairshipextender;

import android.graphics.Bitmap;
import android.os.Bundle;
import android.os.Parcel;
import android.os.Parcelable;

import androidx.annotation.NonNull;
import androidx.core.app.Person;
import androidx.core.graphics.drawable.IconCompat;

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

        public static class Message implements Parcelable {
            public Person person;
            public String text;
            public long time;

            Message(Person person, String text, long time) {
                this.person = person;
                this.text = text;
                this.time = time;
            }

            Message(Parcel parcel) {
                this.person = convertToPerson(parcel.readBundle());
                this.text = parcel.readString();
                this.time = parcel.readLong();
            }

            @Override
            public void writeToParcel(@NonNull Parcel parcel, int i) {
                parcel.writeBundle(convertToBundle(person));
                parcel.writeString(text);
                parcel.writeLong(time);
            }

            @Override
            public int describeContents() {
                return 0;
            }

            public static final Parcelable.Creator CREATOR = new Parcelable.Creator()
            {
                public Message createFromParcel(Parcel in) {
                    return new Message(in);
                }

                @Override
                public Object[] newArray(int size) {
                    return new Person[size];
                }
            };
        }
    }

    private static Bundle convertToBundle(Person p) {
        Bundle bundle = new Bundle();
        bundle.putParcelable("icon", (Parcelable) p.getIcon());
        bundle.putString("key", p.getKey());
        bundle.putString("name", p.getName().toString());
        return bundle;
    }

    private static Person convertToPerson(Bundle b) {
        return new Person.Builder()
                .setIcon((IconCompat) b.getParcelable("icon"))
                .setKey(b.getString("key"))
                .setName(b.getString("name"))
                .build();
    }
}
