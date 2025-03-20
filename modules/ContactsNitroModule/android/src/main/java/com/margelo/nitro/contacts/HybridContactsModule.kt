package com.margelo.nitro.contacts

import android.Manifest
import android.content.pm.PackageManager
import android.provider.ContactsContract
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.margelo.nitro.NitroModules
import com.margelo.nitro.core.Promise

class HybridContactsModule : HybridContactsModuleSpec() {
    @Volatile
    private var estimatedMemorySize: Long = 0

    override val memorySize: Long
        get() = estimatedMemorySize

    private val context: ReactApplicationContext? = NitroModules.applicationContext

    private fun requestContactPermission(): Boolean {
        val currentActivity = context?.currentActivity
        return if (currentActivity != null) {
            ActivityCompat.requestPermissions(
                currentActivity, arrayOf(REQUIRED_PERMISSION), PERMISSION_REQUEST_CODE
            )
            true
        } else {
            false
        }
    }

    private fun hasPhoneContactsPermission(): Boolean {
        return context?.let {
            ContextCompat.checkSelfPermission(it, Manifest.permission.READ_CONTACTS)
        } == PackageManager.PERMISSION_GRANTED
    }

    override fun getAll(keys: Array<ContactFields>): Promise<Array<Contact>> {
        return Promise.parallel {
            val contacts = mutableListOf<Contact>()
            if (!hasPhoneContactsPermission()) {
                requestContactPermission()
                return@parallel emptyArray()
            }

            context?.contentResolver?.let { resolver ->
                val projection = arrayOf(
                    ContactsContract.Data.MIMETYPE,
                    ContactsContract.Data.CONTACT_ID,
                    ContactsContract.Data.DISPLAY_NAME,
                    ContactsContract.Contacts.PHOTO_URI,
                    ContactsContract.Contacts.PHOTO_THUMBNAIL_URI,
                    ContactsContract.Data.DATA1,
                    ContactsContract.CommonDataKinds.StructuredName.GIVEN_NAME,
                    ContactsContract.CommonDataKinds.StructuredName.FAMILY_NAME,
                    ContactsContract.CommonDataKinds.StructuredName.MIDDLE_NAME
                )

                val selection = "${ContactsContract.Data.MIMETYPE} IN (?, ?, ?)"
                val selectionArgs = arrayOf(
                    ContactsContract.CommonDataKinds.StructuredName.CONTENT_ITEM_TYPE,
                    ContactsContract.CommonDataKinds.Phone.CONTENT_ITEM_TYPE,
                    ContactsContract.CommonDataKinds.Email.CONTENT_ITEM_TYPE
                )

                val sortOrder = "${ContactsContract.Data.CONTACT_ID} ASC"

                resolver.query(
                    ContactsContract.Data.CONTENT_URI,
                    projection,
                    selection,
                    selectionArgs,
                    sortOrder
                )?.use { cursor ->
                    val mimeTypeIndex = cursor.getColumnIndex(ContactsContract.Data.MIMETYPE)
                    val contactIdIndex = cursor.getColumnIndex(ContactsContract.Data.CONTACT_ID)
                    val photoUriIndex = cursor.getColumnIndex(ContactsContract.Contacts.PHOTO_URI)
                    val thumbnailUriIndex =
                        cursor.getColumnIndex(ContactsContract.Contacts.PHOTO_THUMBNAIL_URI)
                    val data1Index = cursor.getColumnIndex(ContactsContract.Data.DATA1)
                    val givenNameIndex =
                        cursor.getColumnIndex(ContactsContract.CommonDataKinds.StructuredName.GIVEN_NAME)
                    val familyNameIndex =
                        cursor.getColumnIndex(ContactsContract.CommonDataKinds.StructuredName.FAMILY_NAME)
                    val middleNameIndex =
                        cursor.getColumnIndex(ContactsContract.CommonDataKinds.StructuredName.MIDDLE_NAME)

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
                                middleName = null,
                                phoneNumbers = emptyArray(),
                                emailAddresses = emptyArray(),
                                imageData = cursor.getString(photoUriIndex) ?: "",
                                thumbnailImageData = cursor.getString(thumbnailUriIndex) ?: ""
                            )
                            currentContactId = contactId
                        }

                        when (mimeType) {
                            ContactsContract.CommonDataKinds.StructuredName.CONTENT_ITEM_TYPE -> {
                                currentContact = currentContact?.copy(
                                    firstName = cursor.getString(givenNameIndex) ?: "",
                                    lastName = cursor.getString(familyNameIndex) ?: "",
                                    middleName = cursor.getString(middleNameIndex)
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
        const val REQUIRED_PERMISSION = Manifest.permission.READ_CONTACTS
    }
}
