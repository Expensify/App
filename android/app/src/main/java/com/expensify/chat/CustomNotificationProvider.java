package com.expensify.chat;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.Rect;
import android.graphics.Bitmap.Config;
import android.graphics.PorterDuffXfermode;
import android.graphics.PorterDuff.Mode;
import android.util.DisplayMetrics;
import android.util.Log;
import android.util.TypedValue;
import android.view.WindowManager;
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

        if (message.containsKey(PAYLOAD_KEY)) {
            try {
                JsonMap payload = JsonValue.parseString(message.getExtra(PAYLOAD_KEY)).optMap();

                // Apply message style only for report comments
                if (REPORT_COMMENT_TYPE.equals(payload.get(TYPE_KEY).getString())) {
                        applyMessageStyle(builder, payload, arguments.getNotificationId());
                }
            } catch (Exception e) {
                Log.e(TAG, "Failed to parse conversation. SendID=" + message.getSendId(), e);
            }
        }

        return builder;
    }

    /**
     * Creates a canvas to draw a circle and then draws the bitmap avatar within that circle
     * to clip off the area of the bitmap outside the circular path and returns a circular
     * bitmap.
     *
     * @param bitmap The bitmap image to modify.
     */
    public Bitmap getCroppedBitmap(Bitmap bitmap) {
       Bitmap output = Bitmap.createBitmap(bitmap.getWidth(),
            bitmap.getHeight(), Config.ARGB_8888);
       Canvas canvas = new Canvas(output);

       final int defaultBackgroundColor = 0xff424242;
       final Paint paint = new Paint();
       final Rect rect = new Rect(0, 0, bitmap.getWidth(), bitmap.getHeight());

       paint.setAntiAlias(true);
       canvas.drawARGB(0, 0, 0, 0);
       paint.setColor(defaultBackgroundColor);
       canvas.drawCircle(bitmap.getWidth() / 2, bitmap.getHeight() / 2,
            bitmap.getWidth() / 2, paint);
       paint.setXfermode(new PorterDuffXfermode(Mode.SRC_IN));
       canvas.drawBitmap(bitmap, rect, rect, paint);
       return output;
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
        if (reportID == -1) {
            return;
        }

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

        // Retrieve or create the Person object who sent the latest report comment
        Person person = notificationCache.people.get(accountID);
        if (person == null) {
            IconCompat iconCompat = fetchIcon(avatar);
            person = new Person.Builder()
                .setIcon(iconCompat)
                .setKey(accountID)
                .setName(name)
                .build();

            notificationCache.people.put(accountID, person);
        }

        // Store the latest report comment in the local conversation history
        notificationCache.messages.add(new NotificationCache.Message(person, message, time));

        // Create the messaging style notification builder for this notification.
        // Associate the notification with the person who sent the report comment.
        // If this conversation has 2 participants or more and there's no room name, we should mark
        // it as a group conversation.
        // Also set the conversation title.
        NotificationCompat.MessagingStyle messagingStyle = new NotificationCompat.MessagingStyle(person)
                .setGroupConversation(notificationCache.people.size() > 2 || !roomName.isEmpty())
                .setConversationTitle(conversationTitle);

        // Add all conversation messages to the notification, including the last one we just received.
        for (NotificationCache.Message cachedMessage : notificationCache.messages) {
            messagingStyle.addMessage(cachedMessage.text, cachedMessage.time, cachedMessage.person);
        }

        // Clear the previous notification associated to this conversation so it looks like we are
        // replacing them with this new one we just built.
        if (notificationCache.prevNotificationID != -1) {
            NotificationManagerCompat.from(context).cancel(notificationCache.prevNotificationID);
        }

        // Apply the messaging style to the notification builder
        builder.setStyle(messagingStyle);

        // Store the new notification ID so we can replace the notification if this conversation
        // receives more messages
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
            Log.e(TAG, "Failed to delete conversation cache. SendID=" + message.getSendId(), e);
        }
    }

    private IconCompat fetchIcon(String urlString) {
        URL parsedUrl = null;
        try {
            parsedUrl = urlString == null ? null : new URL(urlString);
        } catch (MalformedURLException e) {
            Log.e(TAG, "Failed to resolve URL " + urlString, e);
        }

        if (parsedUrl == null) {
            return null;
        }

        WindowManager window = (WindowManager) context.getSystemService(Context.WINDOW_SERVICE);
        DisplayMetrics dm = new DisplayMetrics();
        window.getDefaultDisplay().getMetrics(dm);

        final int reqWidth = (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, MAX_ICON_SIZE_DPS, dm);
        final int reqHeight = (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, MAX_ICON_SIZE_DPS, dm);

        final URL url = parsedUrl;
        Future<Bitmap> future = executorService.submit(() -> ImageUtils.fetchScaledBitmap(context, url, reqWidth, reqHeight));

        try {
            Bitmap bitmap = future.get(MAX_ICON_FETCH_WAIT_TIME_SECONDS, TimeUnit.SECONDS);
            return IconCompat.createWithBitmap(getCroppedBitmap(bitmap));
        } catch (InterruptedException e) {
            Log.e(TAG,"Failed to fetch icon", e);
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            Log.e(TAG,"Failed to fetch icon", e);
            future.cancel(true);
        }

        return null;
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
