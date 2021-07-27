package com.expensify.chat;

import android.app.Notification;
import android.app.NotificationManager;
import android.content.Context;
import android.graphics.Bitmap;
import android.os.Build;
import android.service.notification.StatusBarNotification;
import android.util.DisplayMetrics;
import android.util.Log;
import android.util.TypedValue;
import android.view.WindowManager;

import androidx.annotation.DrawableRes;
import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;
import androidx.core.app.NotificationCompat;
import androidx.core.app.Person;
import androidx.core.graphics.drawable.IconCompat;

import com.urbanairship.AirshipConfigOptions;
import com.urbanairship.json.JsonException;
import com.urbanairship.json.JsonList;
import com.urbanairship.json.JsonMap;
import com.urbanairship.json.JsonValue;
import com.urbanairship.push.PushMessage;
import com.urbanairship.push.notifications.NotificationArguments;
import com.urbanairship.reactnative.ReactNotificationProvider;
import com.urbanairship.util.ImageUtils;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
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
    private static final String CONVERSATION_KEY = "conversation";
    private static final String CONVERSATION_OWNER_KEY = "owner";
    private static final String CONVERSATION_TITLE_KEY = "title";
    private static final String PEOPLE_KEY = "people";
    private static final String PERSON_ID_KEY = "id";
    private static final String PERSON_ICON_KEY = "icon";
    private static final String PERSON_NAME_KEY = "name";
    private static final String MESSAGES_KEY = "messages";
    private static final String MESSAGE_TEXT_KEY = "text";
    private static final String MESSAGE_TIME_KEY = "time";
    private static final String MESSAGE_PERSON_KEY = "person";

    // Expensify Conversation JSON keys
    private static final String PAYLOAD_KEY = "payload";
    private static final String TYPE_KEY = "type";
    private static final String REPORT_COMMENT_TYPE = "reportComment";

    private final ExecutorService executorService = Executors.newCachedThreadPool();

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

        if (message.containsKey(CONVERSATION_KEY)) {
            applyMessageStyle(message, builder);
        }

        if (message.containsKey(PAYLOAD_KEY)) {
            try {
                JsonMap payload = JsonValue.parseString(message.getExtra(PAYLOAD_KEY)).optMap();

                if (REPORT_COMMENT_TYPE.equals(payload.get(TYPE_KEY).getString())) {
                        applyExpensifyMessageStyle(builder, payload);
                }
            } catch (Exception e) {
                Log.e(TAG, "Failed to parse conversation", e);
            }
        }

        return builder;
    }

    private void applyExpensifyMessageStyle(NotificationCompat.Builder builder, JsonMap payload) {
        int reportID = payload.get("reportID").getInt(-1);
        JsonMap reportAction = payload.get("reportAction").getMap();
        String name = reportAction.get("person").getList().get(0).getMap().get("text").getString();
        String avatar = reportAction.get("avatar").getString();
        String accountID = Integer.toString(reportAction.get("actorAccountID").getInt(-1));

        String message = reportAction.get("message").getList().get(0).getMap().get("text").getString();
        long time = reportAction.get("timestamp").getLong(0);

        IconCompat iconCompat = fetchIcon(avatar, FALLBACK_ICON_ID);
        Person person = new Person.Builder()
                .setIcon(iconCompat)
                .setKey(accountID)
                .setName(name)
                .build();

        NotificationCompat.MessagingStyle messagingStyle = new NotificationCompat.MessagingStyle(person)
                .setGroupConversation(false)
                .setConversationTitle("Chat with " + name);

        messagingStyle.addMessage(message, time, person);

        builder.setStyle(messagingStyle);
    }


    private void applyMessageStyle(PushMessage message, NotificationCompat.Builder builder) {
        JsonMap conversation = null;
        try {
            conversation = JsonValue.parseString(message.getExtra(CONVERSATION_KEY)).optMap();
        } catch (JsonException e) {
            Log.e(TAG, "Failed to parse conversation", e);
        }

        if (conversation == null) {
            return;
        }

        Map<String, Person> people = resolvePeople(conversation.opt(PEOPLE_KEY).optList());
        if (people.isEmpty()) {
            Log.e(TAG, "Missing people.");
            return;
        }

        String ownerKey = conversation.get(CONVERSATION_OWNER_KEY).getString();
        if (!people.containsKey(ownerKey)) {
            Log.e(TAG, "Missing owner.");
            return;
        }

        NotificationCompat.MessagingStyle messagingStyle = new NotificationCompat.MessagingStyle(people.get(ownerKey))
                .setGroupConversation(people.size() > 2)
                .setConversationTitle(conversation.opt(CONVERSATION_TITLE_KEY).optString());

        for (JsonValue messageJson : conversation.opt(MESSAGES_KEY).optList()) {
            String personKey = messageJson.optMap().opt(MESSAGE_PERSON_KEY).getString();
            String text = messageJson.optMap().opt(MESSAGE_TEXT_KEY).getString();
            long time = messageJson.optMap().opt(MESSAGE_TIME_KEY).getLong(0);

            if (people.containsKey(personKey) && text != null && time > 0) {
                messagingStyle.addMessage(text, time, people.get(personKey));
            }
        }

        builder.setStyle(messagingStyle);
    }

    private Map<String, Person> resolvePeople(JsonList peopleJson) {
        Map<String, Person> people = Collections.synchronizedMap(new HashMap<>());
        CountDownLatch countDownLatch = new CountDownLatch(peopleJson.size());

        for (JsonValue personJson : peopleJson) {
            executorService.execute(() -> {
                String id = personJson.optMap().opt(PERSON_ID_KEY).optString();
                String name = personJson.optMap().opt(PERSON_NAME_KEY).optString();
                String icon = personJson.optMap().opt(PERSON_ICON_KEY).optString();

                if (id != null) {
                    IconCompat iconCompat = fetchIcon(icon, FALLBACK_ICON_ID);
                    Person person = new Person.Builder()
                            .setIcon(iconCompat)
                            .setKey(id)
                            .setName(name)
                            .build();

                    people.put(id, person);
                }

                countDownLatch.countDown();
            });
        }

        try {
            countDownLatch.await();
        } catch (InterruptedException e) {
            Log.e(TAG, "Failed to resolve people", e);
            Thread.currentThread().interrupt();
        }

        return people;
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
}
