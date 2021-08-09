package com.expensify.chat;

import android.content.Context;
import android.graphics.Bitmap;
import android.os.Build;
import android.util.DisplayMetrics;
import android.util.Log;
import android.util.TypedValue;
import android.view.WindowManager;
import androidx.annotation.DrawableRes;
import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.app.Person;
import androidx.core.graphics.drawable.IconCompat;
import com.urbanairship.AirshipConfigOptions;
import com.urbanairship.json.JsonMap;
import com.urbanairship.json.JsonValue;
import com.urbanairship.push.PushMessage;
import com.urbanairship.push.notifications.NotificationArguments;
import com.urbanairship.reactnative.ReactNotificationProvider;
import com.urbanairship.util.ImageUtils;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

public class CustomNotificationProvider extends ReactNotificationProvider {

    // Resize icons to 100 dp x 100 dp
    private static final int MAX_ICON_SIZE_DPS = 100;

    // Max wait time to resolve an icon. We have ~10 seconds to a little less
    // to ensure the notification builds.
    private static final int MAX_ICON_FETCH_WAIT_TIME_SECONDS = 8;

    // Fallback drawable ID. 0 to not use a fallback ID.
    private static final int FALLBACK_ICON_ID = 0;

    // Logging
    private static final String TAG = "NotificationProvider";

    // Conversation JSON keys
    private static final String PAYLOAD_KEY = "payload";
    private static final String TYPE_KEY = "type";
    private static final String REPORT_COMMENT_TYPE = "reportComment";

    private final ExecutorService executorService = Executors.newCachedThreadPool();
    public final HashMap<Integer, NotificationCache> cache = new HashMap<>();

    public CustomNotificationProvider(@NonNull Context context, @NonNull AirshipConfigOptions configOptions) {
        super(context, configOptions);
    }

    @NonNull
    @Override
    protected NotificationCompat.Builder onExtendBuilder(@NonNull Context context, @NonNull NotificationCompat.Builder builder, @NonNull NotificationArguments arguments) {
        super.onExtendBuilder(context, builder, arguments);
        PushMessage message = arguments.getMessage();

        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
            return builder;
        }

        if (message.containsKey(PAYLOAD_KEY)) {
            try {
                JsonMap payload = JsonValue.parseString(message.getExtra(PAYLOAD_KEY)).optMap();

                // Apply message style only for report comments
                if (REPORT_COMMENT_TYPE.equals(payload.get(TYPE_KEY).getString())) {
                        applyMessageStyle(builder, payload, arguments.getNotificationId());
                }
            } catch (Exception e) {
                Log.e(TAG, "Failed to parse conversation", e);
            }
        }

        return builder;
    }

    /**
     * Applies the message style to the notification builder. It also takes advantage of the
     * notification cache to build conversations.
     *
     * @param builder Notification builder that will receive the message style
     * @param payload Notification payload, which contains all the data we need to build the notifications.
     * @param notificationID Current notification ID
     */
    private void applyMessageStyle(NotificationCompat.Builder builder, JsonMap payload, int notificationID) {
        int reportID = payload.get("reportID").getInt(-1);
        NotificationCache notificationCache = findOrCreateNotificationCache(reportID);
        JsonMap reportAction = payload.get("reportAction").getMap();
        String name = reportAction.get("person").getList().get(0).getMap().get("text").getString();
        String avatar = reportAction.get("avatar").getString();
        String accountID = Integer.toString(reportAction.get("actorAccountID").getInt(-1));
        String message = reportAction.get("message").getList().get(0).getMap().get("text").getString();
        long time = reportAction.get("timestamp").getLong(0);
        String roomName = payload.get("roomName") == null ? "" : payload.get("roomName").getString("");
        String conversationTitle = "Chat with " + name;
        if (!roomName.isEmpty()) {
            conversationTitle = "#" + roomName;
        }

        IconCompat iconCompat = fetchIcon(avatar, FALLBACK_ICON_ID);
        Person person = new Person.Builder()
                .setIcon(iconCompat)
                .setKey(accountID)
                .setName(name)
                .build();

        if (!notificationCache.people.containsKey(accountID)) {
            notificationCache.people.put(accountID, person);
        }

        notificationCache.messages.add(new NotificationCache.Message(person, message, time));

        NotificationCompat.MessagingStyle messagingStyle = new NotificationCompat.MessagingStyle(person)
                .setGroupConversation(notificationCache.people.size() > 2 || !roomName.isEmpty())
                .setConversationTitle(conversationTitle);

        for (NotificationCache.Message cachedMessage : notificationCache.messages) {
            messagingStyle.addMessage(cachedMessage.text, cachedMessage.time, cachedMessage.person);
        }

        if (notificationCache.prevNotificationID != -1) {
            NotificationManagerCompat.from(context).cancel(notificationCache.prevNotificationID);
        }

        builder.setStyle(messagingStyle);
        notificationCache.prevNotificationID = notificationID;
    }

    /**
     * Check if we are showing a notification related to a reportID.
     * If not, create a new NotificationCache so we can build a conversation notification
     * as the messages come.
     *
     * @param reportID Report ID.
     * @return Notification Cache.
     */
    private NotificationCache findOrCreateNotificationCache(int reportID) {
        NotificationCache notificationCache = cache.get(reportID);

        if (notificationCache == null) {
            notificationCache = new NotificationCache();
            cache.put(reportID, notificationCache);
        }

        return notificationCache;
    }

    /**
     * Remove the notification data from the cache when the user dismisses the notification.
     *
     * @param message Push notification's message
     */
    public void onDismissNotification(PushMessage message) {
        try {
            JsonMap payload = JsonValue.parseString(message.getExtra(PAYLOAD_KEY)).optMap();
            int reportID = payload.get("reportID").getInt(-1);

            if (reportID == -1) {
                return;
            }

            cache.remove(reportID);
        } catch (Exception e) {
            Log.e(TAG, "Failed to delete conversation cache");
        }
    }

    @NonNull
    private IconCompat fetchIcon(@NonNull String urlString, @DrawableRes int fallbackId) {
        // TODO: Add disk LRU cache

        URL parsedUrl = null;
        try {
            parsedUrl = urlString == null ? null : new URL(urlString);
        } catch (MalformedURLException e) {
            Log.e(TAG, "Failed to resolve URL " + urlString, e);
        }

        if (parsedUrl != null) {
            WindowManager window = (WindowManager) context.getSystemService(Context.WINDOW_SERVICE);
            DisplayMetrics dm = new DisplayMetrics();
            window.getDefaultDisplay().getMetrics(dm);

            final int reqWidth = (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, MAX_ICON_SIZE_DPS, dm);
            final int reqHeight = (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, MAX_ICON_SIZE_DPS, dm);

            final URL url = parsedUrl;
            Future<Bitmap> future = executorService.submit(() -> ImageUtils.fetchScaledBitmap(context, url, reqWidth, reqHeight));

            try {
                Bitmap bitmap = future.get(MAX_ICON_FETCH_WAIT_TIME_SECONDS, TimeUnit.SECONDS);
                return IconCompat.createWithBitmap(bitmap);
            } catch (InterruptedException e) {
                Log.e(TAG,"Failed to fetch icon", e);
                Thread.currentThread().interrupt();
            } catch (Exception e) {
                Log.e(TAG,"Failed to fetch icon", e);
                future.cancel(true);
            }
        }

        return fallbackId == 0 ? null : IconCompat.createWithResource(context, fallbackId);
    }

    private static class NotificationCache {
        public Map<String, Person> people = new HashMap<>();
        public ArrayList<Message> messages = new ArrayList<>();
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
