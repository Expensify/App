package com.margelo.nitro.utils

import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.ContactsContract
import android.provider.ContactsContract.CommonDataKinds.Email
import android.provider.ContactsContract.CommonDataKinds.Phone
import android.provider.ContactsContract.CommonDataKinds.StructuredName
import android.provider.ContactsPickerSessionContract
import android.util.Log
import com.facebook.react.bridge.ActivityEventListener
import com.margelo.nitro.NitroModules
import com.margelo.nitro.core.Promise
import kotlin.concurrent.thread

/**
 * Android only gives access to contacts the user explicitly picks, so the app doesn't need (and must not declare) READ_CONTACTS.
 * See Google Play's Contacts Permission policy.
 */
class HybridContactsModule : HybridContactsModuleSpec() {
    private val context = NitroModules.applicationContext!!

    @Volatile
    private var pendingPickPromise: Promise<Array<Contact>>? = null

    private val activityEventListener = object : ActivityEventListener {
        override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
            if (requestCode != PICK_CONTACT_REQUEST_CODE) {
                return
            }
            val promise = pendingPickPromise ?: return
            pendingPickPromise = null

            val resultUri = data?.data
            if (resultCode != Activity.RESULT_OK || resultUri == null) {
                promise.resolve(emptyArray())
                return
            }

            // The picker only grants temporary read access to the returned URI, so read it right away, off the main thread
            thread {
                try {
                    promise.resolve(readPickedContacts(resultUri))
                } catch (e: Throwable) {
                    promise.reject(e)
                }
            }
        }

        override fun onNewIntent(intent: Intent) {}
    }

    init {
        context.addActivityEventListener(activityEventListener)
    }

    override val memorySize: Long
        get() = 0

    // Reading the whole address book requires READ_CONTACTS, which isn't declared on Android. Use pick() instead.
    override fun getAll(keys: Array<ContactFields>): Promise<Array<Contact>> {
        return Promise.resolved(emptyArray())
    }

    override fun pick(keys: Array<ContactFields>): Promise<Array<Contact>> {
        val promise = Promise<Array<Contact>>()
        val activity = context.currentActivity
        if (activity == null) {
            promise.resolve(emptyArray())
            return promise
        }

        // Only one picker can be on screen, so settle any previous request that never got a result
        pendingPickPromise?.resolve(emptyArray())
        pendingPickPromise = promise

        activity.runOnUiThread {
            try {
                activity.startActivityForResult(createPickIntent(keys), PICK_CONTACT_REQUEST_CODE)
            } catch (e: ActivityNotFoundException) {
                Log.w(TAG, "No activity found to pick a contact", e)
                if (pendingPickPromise === promise) {
                    pendingPickPromise = null
                }
                promise.resolve(emptyArray())
            }
        }
        return promise
    }

    private fun createPickIntent(keys: Array<ContactFields>): Intent {
        if (Build.VERSION.SDK_INT >= CONTACTS_PICKER_MIN_SDK) {
            val requestedDataFields = arrayListOf<String>()
            if (keys.contains(ContactFields.FIRST_NAME) || keys.contains(ContactFields.LAST_NAME)) {
                requestedDataFields.add(StructuredName.CONTENT_ITEM_TYPE)
            }
            if (keys.contains(ContactFields.EMAIL_ADDRESSES)) {
                requestedDataFields.add(Email.CONTENT_ITEM_TYPE)
            }
            if (keys.contains(ContactFields.PHONE_NUMBERS)) {
                requestedDataFields.add(Phone.CONTENT_ITEM_TYPE)
            }
            return Intent(ContactsPickerSessionContract.ACTION_PICK_CONTACTS).apply {
                putStringArrayListExtra(ContactsPickerSessionContract.EXTRA_PICK_CONTACTS_REQUESTED_DATA_FIELDS, requestedDataFields)
            }
        }

        // Before Android 17 the picker that needs no permission can only return one kind of data, so prefer email over phone
        val contentType = if (keys.contains(ContactFields.EMAIL_ADDRESSES)) Email.CONTENT_TYPE else Phone.CONTENT_TYPE
        return Intent(Intent.ACTION_PICK).setType(contentType)
    }

    private fun readPickedContacts(resultUri: Uri): Array<Contact> {
        if (resultUri.authority == ContactsPickerSessionContract.AUTHORITY) {
            return readContactsPickerSession(resultUri)
        }
        return readPickedDataRow(resultUri)
    }

    /** Reads the rows of an Android 17+ Contacts Picker session. Each row follows the ContactsContract.Data schema. */
    private fun readContactsPickerSession(sessionUri: Uri): Array<Contact> {
        val contactsByLookupKey = linkedMapOf<String, PickedContact>()

        context.contentResolver.query(sessionUri, SESSION_PROJECTION, null, null, null)?.use { cursor ->
            val lookupKeyIndex = cursor.getColumnIndex(ContactsContract.Contacts.LOOKUP_KEY)
            val displayNameIndex = cursor.getColumnIndex(ContactsContract.Contacts.DISPLAY_NAME_PRIMARY)
            val mimeTypeIndex = cursor.getColumnIndex(ContactsContract.Data.MIMETYPE)
            val data1Index = cursor.getColumnIndex(ContactsContract.Data.DATA1)
            val givenNameIndex = cursor.getColumnIndex(StructuredName.GIVEN_NAME)
            val familyNameIndex = cursor.getColumnIndex(StructuredName.FAMILY_NAME)

            while (cursor.moveToNext()) {
                val lookupKey = cursor.getStringOrNull(lookupKeyIndex) ?: continue
                val contact = contactsByLookupKey.getOrPut(lookupKey) {
                    PickedContact(displayName = cursor.getStringOrNull(displayNameIndex))
                }

                when (cursor.getStringOrNull(mimeTypeIndex)) {
                    StructuredName.CONTENT_ITEM_TYPE -> {
                        contact.firstName = cursor.getStringOrNull(givenNameIndex)
                        contact.lastName = cursor.getStringOrNull(familyNameIndex)
                    }

                    Email.CONTENT_ITEM_TYPE -> cursor.getStringOrNull(data1Index)?.let { contact.emailAddresses.add(StringHolder(it)) }
                    Phone.CONTENT_ITEM_TYPE -> cursor.getStringOrNull(data1Index)?.let { contact.phoneNumbers.add(StringHolder(it)) }
                }
            }
        }

        return contactsByLookupKey.values.map { it.toContact() }.toTypedArray()
    }

    /** Reads the single email or phone row returned by Intent.ACTION_PICK before Android 17. */
    private fun readPickedDataRow(dataUri: Uri): Array<Contact> {
        context.contentResolver.query(dataUri, DATA_ROW_PROJECTION, null, null, null)?.use { cursor ->
            if (!cursor.moveToFirst()) {
                return emptyArray()
            }
            val value = cursor.getStringOrNull(cursor.getColumnIndex(ContactsContract.Data.DATA1)) ?: return emptyArray()
            val contact = PickedContact(displayName = cursor.getStringOrNull(cursor.getColumnIndex(ContactsContract.Data.DISPLAY_NAME_PRIMARY)))
            when (cursor.getStringOrNull(cursor.getColumnIndex(ContactsContract.Data.MIMETYPE))) {
                Phone.CONTENT_ITEM_TYPE -> contact.phoneNumbers.add(StringHolder(value))
                else -> contact.emailAddresses.add(StringHolder(value))
            }
            return arrayOf(contact.toContact())
        }
        return emptyArray()
    }

    private fun android.database.Cursor.getStringOrNull(index: Int): String? {
        if (index < 0 || isNull(index)) {
            return null
        }
        return getString(index)
    }

    private class PickedContact(val displayName: String?) {
        var firstName: String? = null
        var lastName: String? = null
        val phoneNumbers = mutableListOf<StringHolder>()
        val emailAddresses = mutableListOf<StringHolder>()

        fun toContact(): Contact {
            val hasStructuredName = !firstName.isNullOrEmpty() || !lastName.isNullOrEmpty()
            return Contact(
                // Fall back to the display name when the contact has no structured name
                firstName = if (hasStructuredName) firstName ?: "" else displayName ?: "",
                lastName = if (hasStructuredName) lastName ?: "" else "",
                phoneNumbers = phoneNumbers.toTypedArray(),
                emailAddresses = emailAddresses.toTypedArray(),
                // The picker doesn't grant access to contact photos
                imageData = ""
            )
        }
    }

    companion object {
        private const val TAG = "HybridContactsModule"
        private const val PICK_CONTACT_REQUEST_CODE = 0xC047

        // Android 17, where ContactsPickerSessionContract.ACTION_PICK_CONTACTS was added
        private const val CONTACTS_PICKER_MIN_SDK = 37

        private val SESSION_PROJECTION = arrayOf(
            ContactsContract.Contacts.LOOKUP_KEY,
            ContactsContract.Contacts.DISPLAY_NAME_PRIMARY,
            ContactsContract.Data.MIMETYPE,
            ContactsContract.Data.DATA1,
            StructuredName.GIVEN_NAME,
            StructuredName.FAMILY_NAME
        )

        private val DATA_ROW_PROJECTION = arrayOf(
            ContactsContract.Data.DISPLAY_NAME_PRIMARY,
            ContactsContract.Data.MIMETYPE,
            ContactsContract.Data.DATA1
        )
    }
}
