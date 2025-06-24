package com.margelo.nitro.utils

import android.Manifest
import android.content.pm.PackageManager
import android.provider.ContactsContract
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ThemedReactContext
import com.margelo.nitro.NitroModules
import com.margelo.nitro.core.Promise

class HybridContactsModule : HybridContactsModuleSpec() {
    @Volatile
    private var estimatedMemorySize: Long = 0
    private val context = NitroModules.applicationContext!!

    override val memorySize: Long
        get() = estimatedMemorySize

    private fun requestContactPermission(): Boolean {
        val currentActivity = context.currentActivity
        if (currentActivity == null) {
            return false
        }

        // Request permissions
        ActivityCompat.requestPermissions(
            currentActivity, 
            REQUIRED_PERMISSIONS, 
            PERMISSION_REQUEST_CODE
        )
        return true
    }

    private fun hasPhoneContactsPermission(): Boolean {
        return ContextCompat.checkSelfPermission(context, Manifest.permission.READ_CONTACTS) == PackageManager.PERMISSION_GRANTED
    }

    override fun getAll(keys: Array<ContactFields>): Promise<Array<Contact>> {
        return Promise.parallel {
            val contacts = mutableListOf<Contact>()
            if (!hasPhoneContactsPermission()) {
                requestContactPermission()
                return@parallel emptyArray()
            }

            context.contentResolver?.let { resolver ->
                resolver.query(
                    ContactsContract.Data.CONTENT_URI,
                    CONTACT_PROJECTION,
                    CONTACT_SELECTION,
                    CONTACT_SELECTION_ARGS,
                    CONTACT_SORT_ORDER
                )?.use { cursor ->
                    val mimeTypeIndex = cursor.getColumnIndex(ContactsContract.Data.MIMETYPE)
                    val contactIdIndex = cursor.getColumnIndex(ContactsContract.Data.CONTACT_ID)
                    val photoUriIndex = cursor.getColumnIndex(ContactsContract.Contacts.PHOTO_URI)
                    val data1Index = cursor.getColumnIndex(ContactsContract.Data.DATA1)
                    val givenNameIndex =
                        cursor.getColumnIndex(ContactsContract.CommonDataKinds.StructuredName.GIVEN_NAME)
                    val familyNameIndex =
                        cursor.getColumnIndex(ContactsContract.CommonDataKinds.StructuredName.FAMILY_NAME)

                    var currentContact: Contact? = null
                    var currentContactId: String? = null
                    val currentPhoneNumbers = mutableListOf<StringHolder>()
                    val currentEmailAddresses = mutableListOf<StringHolder>()

                    while (cursor.moveToNext()) {
                        val contactId = cursor.getString(contactIdIndex)
                        val mimeType = cursor.getString(mimeTypeIndex)

                        if (contactId != currentContactId) {
                            currentContact?.let { contact ->
                                contacts.add(
                                    contact.copy(
                                        phoneNumbers = currentPhoneNumbers.toTypedArray(),
                                        emailAddresses = currentEmailAddresses.toTypedArray()
                                    )
                                )
                            }
                            currentPhoneNumbers.clear()
                            currentEmailAddresses.clear()
                            currentContact = Contact(
                                firstName = "",
                                lastName = "",
                                phoneNumbers = emptyArray(),
                                emailAddresses = emptyArray(),
                                imageData = cursor.getString(photoUriIndex) ?: ""
                            )
                            currentContactId = contactId
                        }

                        when (mimeType) {
                            ContactsContract.CommonDataKinds.StructuredName.CONTENT_ITEM_TYPE -> {
                                currentContact = currentContact?.copy(
                                    firstName = cursor.getString(givenNameIndex) ?: "",
                                    lastName = cursor.getString(familyNameIndex) ?: ""
                                )
                            }

                            ContactsContract.CommonDataKinds.Phone.CONTENT_ITEM_TYPE -> {
                                cursor.getString(data1Index)?.let { phone ->
                                    currentPhoneNumbers.add(StringHolder(phone))
                                }
                            }

                            ContactsContract.CommonDataKinds.Email.CONTENT_ITEM_TYPE -> {
                                cursor.getString(data1Index)?.let { email ->
                                    currentEmailAddresses.add(StringHolder(email))
                                }
                            }
                        }
                    }

                    // Add the last contact
                    currentContact?.let { contact ->
                        contacts.add(
                            contact.copy(
                                phoneNumbers = currentPhoneNumbers.toTypedArray(),
                                emailAddresses = currentEmailAddresses.toTypedArray()
                            )
                        )
                    }
                }
            }

            // Update memory size based on contact count
            estimatedMemorySize = contacts.size.toLong() * 1024 // Assume ~1KB per contact
            contacts.toTypedArray()
        }
    }

    companion object {
        const val PERMISSION_REQUEST_CODE = 1
        val REQUIRED_PERMISSIONS = arrayOf(Manifest.permission.READ_CONTACTS)
        
        private val CONTACT_PROJECTION = arrayOf(
            ContactsContract.Data.MIMETYPE,
            ContactsContract.Data.CONTACT_ID,
            ContactsContract.Data.DISPLAY_NAME,
            ContactsContract.Contacts.PHOTO_URI,
            ContactsContract.Data.DATA1,
            ContactsContract.CommonDataKinds.StructuredName.GIVEN_NAME,
            ContactsContract.CommonDataKinds.StructuredName.FAMILY_NAME
        )
        
        private const val CONTACT_SELECTION = "${ContactsContract.Data.MIMETYPE} IN (?, ?, ?)"
        
        private val CONTACT_SELECTION_ARGS = arrayOf(
            ContactsContract.CommonDataKinds.StructuredName.CONTENT_ITEM_TYPE,
            ContactsContract.CommonDataKinds.Phone.CONTENT_ITEM_TYPE,
            ContactsContract.CommonDataKinds.Email.CONTENT_ITEM_TYPE
        )
        
        private const val CONTACT_SORT_ORDER = "${ContactsContract.Data.CONTACT_ID} ASC"
    }
}
