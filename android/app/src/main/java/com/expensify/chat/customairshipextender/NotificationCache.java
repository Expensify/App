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

public class NotificationCache {

    private static final HashMap<Long, NotificationData> cache = new HashMap<>();

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
        private final Bundle people = new Bundle();
        private final Bundle icons = new Bundle();
        public ArrayList<NotificationMessage> messages = new ArrayList<>();

        public int prevNotificationID = -1;

        public Person getPerson(String accountID) {
            return convertToPerson(people.getParcelable(accountID));
        }

        public void putPerson(String accountID, Person person) {
            people.putParcelable(accountID, convertToBundle(person));
        }

        public Bitmap getIcon(String accountID) {
            return icons.getParcelable(accountID);
        }

        public void putIcon(String accountID, Bitmap bitmap) {
            icons.putParcelable(accountID, bitmap);
        }
    }

    public static class NotificationMessage implements Parcelable {
        public Person person;
        public String text;
        public long time;

        NotificationMessage(Person person, String text, long time) {
            this.person = person;
            this.text = text;
            this.time = time;
        }

        NotificationMessage(Parcel parcel) {
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

        public final Parcelable.Creator CREATOR = new Parcelable.Creator()
        {
            public NotificationMessage createFromParcel(Parcel in) {
                return new NotificationMessage(in);
            }

            @Override
            public Object[] newArray(int size) {
                return new Person[size];
            }
        };
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
