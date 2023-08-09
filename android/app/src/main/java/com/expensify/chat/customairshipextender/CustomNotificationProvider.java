package com.expensify.chat.customairshipextender;

import static androidx.core.app.NotificationCompat.CATEGORY_MESSAGE;
import static androidx.core.app.NotificationCompat.PRIORITY_MAX;

import android.app.NotificationChannel;
import android.app.NotificationChannelGroup;
import android.app.NotificationManager;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Bitmap.Config;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.PorterDuff.Mode;
import android.graphics.PorterDuffXfermode;
import android.graphics.Rect;
import android.os.Build;
import android.util.DisplayMetrics;
import android.util.Log;
import android.util.TypedValue;
import android.view.WindowManager;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;
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
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import com.expensify.chat.customairshipextender.NotificationCache.NotificationData;
import com.expensify.chat.customairshipextender.NotificationCache.NotificationMessage;

public class CustomNotificationProvider extends ReactNotificationProvider {
    // Resize icons to 100 dp x 100 dp
    private static final int MAX_ICON_SIZE_DPS = 100;

    // Max wait time to resolve an icon. We have ~10 seconds to a little less
    // to ensure the notification builds.
    private static final int MAX_ICON_FETCH_WAIT_TIME_SECONDS = 8;

    // Logging
    private static final String TAG = "NotificationProvider";

    // Define notification channel
    public static final String CHANNEL_MESSAGES_ID = "CHANNEL_MESSAGES";
    public static final String CHANNEL_MESSAGES_NAME = "Messages";
    public static final String NOTIFICATION_GROUP_CHATS = "NOTIFICATION_GROUP_CHATS";
    public static final String CHANNEL_GROUP_NAME = "Chats";

    // Conversation JSON keys
    private static final String PAYLOAD_KEY = "payload";
    private static final String ONYX_DATA_KEY = "onyxData";

    private final ExecutorService executorService = Executors.newCachedThreadPool();

    public CustomNotificationProvider(@NonNull Context context, @NonNull AirshipConfigOptions configOptions) {
        super(context, configOptions);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            createAndRegisterNotificationChannel(context);
        }
    }

    @NonNull
    @Override
    protected NotificationCompat.Builder onExtendBuilder(@NonNull Context context, @NonNull NotificationCompat.Builder builder, @NonNull NotificationArguments arguments) {
        super.onExtendBuilder(context, builder, arguments);
        PushMessage message = arguments.getMessage();
        Log.d(TAG, "buildNotification: " + message.toString());

        // Improve notification delivery by categorising as a time-critical message
        builder.setCategory(CATEGORY_MESSAGE);

        // Configure the notification channel or priority to ensure it shows in foreground
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            builder.setChannelId(CHANNEL_MESSAGES_ID);
        } else {
            builder.setPriority(PRIORITY_MAX);
        }

        // Attempt to parse data and apply custom notification styling
        if (message.containsKey(PAYLOAD_KEY)) {
            try {
                JsonMap payload = JsonValue.parseString(message.getExtra(PAYLOAD_KEY)).optMap();
                if (payload.containsKey(ONYX_DATA_KEY)) {
                    Objects.requireNonNull(payload.get(ONYX_DATA_KEY)).isNull();
                    Log.d(TAG, "payload contains onxyData");
                    applyMessageStyle(context, builder, payload, arguments.getNotificationId());
                }
            } catch (Exception e) {
                Log.e(TAG, "Failed to parse conversation, falling back to default notification style. SendID=" + message.getSendId(), e);
            }
        }

        return builder;
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    private void createAndRegisterNotificationChannel(@NonNull Context context) {
        NotificationChannelGroup channelGroup = new NotificationChannelGroup(NOTIFICATION_GROUP_CHATS, CHANNEL_GROUP_NAME);
        NotificationChannel channel = new NotificationChannel(CHANNEL_MESSAGES_ID, CHANNEL_MESSAGES_NAME, NotificationManager.IMPORTANCE_HIGH);

        NotificationManager notificationManager = context.getSystemService(NotificationManager.class);
        notificationManager.createNotificationChannelGroup(channelGroup);
        notificationManager.createNotificationChannel(channel);
    }

    /**
     * Creates a canvas to draw a circle and then draws the bitmap avatar within that circle
     * to clip off the area of the bitmap outside the circular path and returns a circular
     * bitmap.
     *
     * @param bitmap The bitmap image to modify.
     */
    public Bitmap getCroppedBitmap(Bitmap bitmap) {
       // Convert hardware bitmap to software bitmap so it can be drawn on the canvas
       bitmap = bitmap.copy(Config.ARGB_8888, true);

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
     * notification cache to build conversations style notifications.
     *
     * @param builder Notification builder that will receive the message style
     * @param payload Notification payload, which contains all the data we need to build the notifications.
     * @param notificationID Current notification ID
     */
    private void applyMessageStyle(@NonNull Context context, NotificationCompat.Builder builder, JsonMap payload, int notificationID) {
        long reportID = payload.get("reportID").getLong(-1);
        if (reportID == -1) {
            return;
        }

        // Retrieve and check for cached notifications 
        NotificationData notificationData = NotificationCache.getNotificationData(reportID);
        boolean hasExistingNotification = notificationData.messages.size() >= 1;

        try {
            JsonMap reportMap = payload.get(ONYX_DATA_KEY).getList().get(1).getMap().get("value").getMap();
            String reportId = reportMap.keySet().iterator().next();
            JsonMap messageData = reportMap.get(reportId).getMap();

            String name = messageData.get("person").getList().get(0).getMap().get("text").getString();
            String avatar = messageData.get("avatar").getString();
            String accountID = Integer.toString(messageData.get("actorAccountID").getInt(-1));
            String message = messageData.get("message").getList().get(0).getMap().get("text").getString();
            String conversationName = payload.get("roomName") == null ? "" : payload.get("roomName").getString("");

            // Retrieve or create the Person object who sent the latest report comment
            Person person = notificationData.getPerson(accountID);
            Bitmap personIcon = notificationData.getIcon(accountID);

            if (personIcon == null) {
                personIcon = fetchIcon(context, avatar);
            }
            builder.setLargeIcon(personIcon);

            // Persist the person and icon to the notification cache
            if (person == null) {
                IconCompat iconCompat = IconCompat.createWithBitmap(personIcon);
                person = new Person.Builder()
                    .setIcon(iconCompat)
                    .setKey(accountID)
                    .setName(name)
                    .build();

                notificationData.putPerson(accountID, name, personIcon);
            }

            // Despite not using conversation style for the initial notification from each chat, we need to cache it to enable conversation style for future notifications
            long createdTimeInMillis = getMessageTimeInMillis(messageData.get("created").getString(""));
            notificationData.messages.add(new NotificationMessage(accountID, message, createdTimeInMillis));


            // Conversational styling should be applied to groups chats, rooms, and any 1:1 chats with more than one notification (ensuring the large profile image is always shown)
            if (!conversationName.isEmpty() || hasExistingNotification) {
                // Create the messaging style notification builder for this notification, associating it with the person who sent the report comment
                NotificationCompat.MessagingStyle messagingStyle = new NotificationCompat.MessagingStyle(person)
                        .setGroupConversation(true)
                        .setConversationTitle(conversationName);

                // Add all conversation messages to the notification, including the last one we just received.
                for (NotificationMessage cachedMessage : notificationData.messages) {
                    messagingStyle.addMessage(cachedMessage.text, cachedMessage.time, notificationData.getPerson(cachedMessage.accountID));
                }
                builder.setStyle(messagingStyle);
            }

            // Clear the previous notification associated to this conversation so it looks like we are
            // replacing them with this new one we just built.
            if (notificationData.prevNotificationID != -1) {
                NotificationManagerCompat.from(context).cancel(notificationData.prevNotificationID);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        // Store the new notification ID so we can replace the notification if this conversation
        // receives more messages
        notificationData.prevNotificationID = notificationID;

        NotificationCache.setNotificationData(reportID, notificationData);
    }

    /**
     * Safely retrieve the message time in milliseconds
     */
    private long getMessageTimeInMillis(String createdTime) {
        if (!createdTime.isEmpty()) {
            try {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault());
                return sdf.parse(createdTime).getTime();
            } catch (Exception e) {
                Log.e(TAG, "error parsing createdTime: " + createdTime);
                e.printStackTrace();
            }
        }
        return Calendar.getInstance().getTimeInMillis();
    }

    /**
     * Remove the notification data from the cache when the user dismisses the notification.
     *
     * @param message Push notification's message
     */
    public void onDismissNotification(PushMessage message) {
        try {
            JsonMap payload = JsonValue.parseString(message.getExtra(PAYLOAD_KEY)).optMap();
            long reportID = payload.get("reportID").getLong(-1);

            if (reportID == -1) {
                return;
            }

            NotificationCache.setNotificationData(reportID, null);
        } catch (Exception e) {
            Log.e(TAG, "Failed to delete conversation cache. SendID=" + message.getSendId(), e);
        }
    }

    private Bitmap fetchIcon(@NonNull Context context, String urlString) {
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
            return getCroppedBitmap(bitmap);
        } catch (InterruptedException e) {
            Log.e(TAG,"Failed to fetch icon", e);
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            Log.e(TAG,"Failed to fetch icon", e);
            future.cancel(true);
        }

        return null;
    }
}
