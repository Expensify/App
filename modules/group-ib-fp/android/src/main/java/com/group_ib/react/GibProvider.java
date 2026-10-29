package com.group_ib.react;

import android.content.ContentValues;
import android.database.Cursor;
import android.net.Uri;

public class GibProvider extends com.group_ib.sdk.provider.GibProvider {
    @Override
    protected String initProviderName() {
        return getContext().getPackageName() + ".gib";
    }
}
