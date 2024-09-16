package com.expensify.chat.customairshipextender;

import static androidx.core.app.NotificationCompat.CATEGORY_MESSAGE;
import static androidx.core.app.NotificationCompat.PRIORITY_MAX;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationChannelGroup;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Bitmap.Config;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.PorterDuff.Mode;
import android.graphics.PorterDuffXfermode;
import android.graphics.Rect;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.service.notification.StatusBarNotification;
import android.util.DisplayMetrics;
import android.util.Log;
import android.util.TypedValue;
import android.view.WindowManager;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.app.Person;
import androidx.core.content.pm.ShortcutInfoCompat;
import androidx.core.content.pm.ShortcutManagerCompat;
import androidx.core.graphics.drawable.IconCompat;
import androidx.versionedparcelable.ParcelUtils;

import com.expensify.chat.R;
import com.expensify.chat.shortcutManagerModule.ShortcutManagerUtils;
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
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
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

    // Define notification channel
    public static final String CHANNEL_MESSAGES_ID = "CHANNEL_MESSAGES";
    public static final String CHANNEL_MESSAGES_NAME = "Messages";
    public static final String NOTIFICATION_GROUP_CHATS = "NOTIFICATION_GROUP_CHATS";
    public static final String CHANNEL_GROUP_NAME = "Chats";

    // Conversation JSON keys
    private static final String PAYLOAD_KEY = "payload";
    private static final String ONYX_DATA_KEY = "onyxData";

    // Notification extras keys
    public static final String EXTRAS_REPORT_ID_KEY = "reportID";
    public static final String EXTRAS_AVATAR_KEY = "avatar";
    public static final String EXTRAS_NAME_KEY = "name";
    public static final String EXTRAS_ACCOUNT_ID_KEY = "accountID";


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
        builder.setVisibility(NotificationCompat.VISIBILITY_PRIVATE);

        // Configure the notification channel or priority to ensure it shows in foreground
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            builder.setChannelId(CHANNEL_MESSAGES_ID);
        } else {
            builder.setPriority(PRIORITY_MAX);
            // Set sound for versions below Oreo
            // for Oreo and above we set sound on the notification's channel level
            builder.setSound(getSoundFile(context));
        }

        // Attempt to parse data and apply custom notification styling
        if (message.containsKey(PAYLOAD_KEY)) {
            try {
                JsonMap payload = JsonValue.parseString(message.getExtra(PAYLOAD_KEY)).optMap();
                if (payload.containsKey(ONYX_DATA_KEY)) {
                    Objects.requireNonNull(payload.get(ONYX_DATA_KEY)).isNull();
                    Log.d(TAG, "payload contains onxyData");
                    String alert = message.getExtra(PushMessage.EXTRA_ALERT);
                    applyMessageStyle(context, builder, payload, arguments.getNotificationId(), alert);
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

        AudioAttributes audioAttributes = new AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                .build();

        channel.setSound(getSoundFile(context), audioAttributes);

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
     * android notification API to build conversations style notifications.
     *
     * @param builder Notification builder that will receive the message style
     * @param payload Notification payload, which contains all the data we need to build the notifications.
     * @param notificationID Current notification ID
     */
    private void applyMessageStyle(@NonNull Context context, NotificationCompat.Builder builder, JsonMap payload, int notificationID, String alert) {
        long reportID = payload.get("reportID").getLong(-1);
        if (reportID == -1) {
            return;
        }

        // Retrieve and check for existing notifications
        StatusBarNotification existingReportNotification = getActiveNotificationByReportId(context, reportID);
        boolean hasExistingNotification = existingReportNotification != null;
        try {
            JsonMap reportMap = payload.get(ONYX_DATA_KEY).getList().get(1).getMap().get("value").getMap();
            String reportId = reportMap.keySet().iterator().next();
            JsonMap messageData = reportMap.get(reportId).getMap();

            String name = messageData.get("person").getList().get(0).getMap().get("text").getString();
            String avatar = messageData.get("avatar").getString();
            String accountID = Integer.toString(messageData.get("actorAccountID").getInt(-1));
            
            // Use the formatted alert message from the backend. Otherwise fallback on the message in the Onyx data.
            String message = alert != null ? alert : messageData.get("message").getList().get(0).getMap().get("text").getString();
            String roomName = payload.get("roomName") == null ? "" : payload.get("roomName").getString("");

            // Create the Person object who sent the latest report comment
            Bitmap personIcon = fetchIcon(context, avatar);
            builder.setLargeIcon(personIcon);

            Person person = createMessagePersonObject(IconCompat.createWithBitmap(personIcon), accountID, name);

            ShortcutManagerUtils.addDynamicShortcut(context, reportID, name, accountID, personIcon, person);

            // Create latest received message object
            long createdTimeInMillis = getMessageTimeInMillis(messageData.get("created").getString(""));
            NotificationCompat.MessagingStyle.Message newMessage = new NotificationCompat.MessagingStyle.Message(message, createdTimeInMillis, person);

            NotificationCompat.MessagingStyle messagingStyle = new NotificationCompat.MessagingStyle(person);

            // Add all conversation messages to the notification, including the last one we just received.
            List<NotificationCompat.MessagingStyle.Message> messages;
            if (hasExistingNotification) {
                NotificationCompat.MessagingStyle previousStyle = NotificationCompat.MessagingStyle.extractMessagingStyleFromNotification(existingReportNotification.getNotification());
                messages = previousStyle != null ? previousStyle.getMessages() : new ArrayList<>(List.of(recreatePreviousMessage(existingReportNotification)));
            } else {
                messages = new ArrayList<>();
            }

            // add the last one message we just received.
            messages.add(newMessage);

            for (NotificationCompat.MessagingStyle.Message activeMessage : messages) {
                messagingStyle.addMessage(activeMessage);
            }

            // Conversational styling should be applied to groups chats, rooms, and any 1:1 chats with more than one notification (ensuring the large profile image is always shown)
            if (!roomName.isEmpty()) {
                // Create the messaging style notification builder for this notification, associating it with the person who sent the report comment
                messagingStyle
                        .setGroupConversation(true)
                        .setConversationTitle(roomName);
            }
            builder.setStyle(messagingStyle);
            builder.setShortcutId(accountID);

            // save reportID and person info for future merging
            builder.addExtras(createMessageExtrasBundle(reportID, person));

            // Clear the previous notification associated to this conversation so it looks like we are
            // replacing them with this new one we just built.
            if (hasExistingNotification) {
                int previousNotificationID = existingReportNotification.getId();
                NotificationManagerCompat.from(context).cancel(previousNotificationID);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private Person createMessagePersonObject (IconCompat icon, String key, String name) {
        return new Person.Builder().setIcon(icon).setKey(key).setName(name).build();
    }

    private NotificationCompat.MessagingStyle.Message recreatePreviousMessage (StatusBarNotification statusBarNotification) {
        // Get previous message
        Notification previousNotification = statusBarNotification.getNotification();
        String previousMessage = previousNotification.extras.getString("android.text");
        long time = statusBarNotification.getNotification().when;
        // Recreate Person object
        IconCompat avatarBitmap = ParcelUtils.getVersionedParcelable(previousNotification.extras, EXTRAS_AVATAR_KEY);
        String previousName = previousNotification.extras.getString(EXTRAS_NAME_KEY);
        String previousAccountID = previousNotification.extras.getString(EXTRAS_ACCOUNT_ID_KEY);
        Person previousPerson = createMessagePersonObject(avatarBitmap, previousAccountID, previousName);

        return new NotificationCompat.MessagingStyle.Message(previousMessage, time, previousPerson);
    }

    private Bundle createMessageExtrasBundle(long reportID, Person person) {
        Bundle extrasBundle = new Bundle();
        extrasBundle.putLong(EXTRAS_REPORT_ID_KEY, reportID);
        ParcelUtils.putVersionedParcelable(extrasBundle, EXTRAS_AVATAR_KEY, person.getIcon());
        extrasBundle.putString(EXTRAS_ACCOUNT_ID_KEY, person.getKey());
        extrasBundle.putString(EXTRAS_NAME_KEY, person.getName().toString());

        return extrasBundle;
    }

    private StatusBarNotification getActiveNotificationByReportId(@NonNull Context context, long reportId) {
        List<StatusBarNotification> notifications = NotificationManagerCompat.from(context).getActiveNotifications();
        for (StatusBarNotification currentNotification : notifications) {
            long associatedReportId = currentNotification.getNotification().extras.getLong("reportID", -1);
            if (associatedReportId == reportId) return currentNotification;
        }
        return null;
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

    private Uri getSoundFile(Context context) {
        return Uri.parse("android.resource://" + context.getPackageName() + "/" + R.raw.receive);
    }
}
