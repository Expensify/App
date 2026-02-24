package com.expensify.chat.shortcutManagerModule;

import static androidx.core.app.NotificationCompat.CATEGORY_MESSAGE;

import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;

import androidx.core.app.Person;
import androidx.core.content.pm.ShortcutInfoCompat;
import androidx.core.content.pm.ShortcutManagerCompat;
import androidx.core.graphics.drawable.IconCompat;

import java.util.Collections;

public class ShortcutManagerUtils {
    public static void removeAllDynamicShortcuts(Context context) {
        ShortcutManagerCompat.removeAllDynamicShortcuts(context);
    }

    public static void addDynamicShortcut(Context context, long reportID, String name, String accountID, Bitmap personIcon, Person person) {
        Intent intent = new Intent(Intent.ACTION_VIEW,
                Uri.parse("new-expensify://r/" + reportID));

        ShortcutInfoCompat shortcutInfo = new ShortcutInfoCompat.Builder(context, accountID)
                .setShortLabel(name)
                .setLongLabel(name)
                .setCategories(Collections.singleton(CATEGORY_MESSAGE))
                .setIntent(intent)
                .setLongLived(true)
                .setPerson(person)
                .setIcon(IconCompat.createWithBitmap(personIcon))
                .build();
        ShortcutManagerCompat.pushDynamicShortcut(context, shortcutInfo);
    }

}
