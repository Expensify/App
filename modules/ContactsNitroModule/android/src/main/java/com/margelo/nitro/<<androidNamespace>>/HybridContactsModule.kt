package com.margelo.nitro.contacts

import android.Manifest
import android.content.pm.PackageManager
import android.provider.ContactsContract
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.margelo.nitro.NitroModules
import com.margelo.nitro.core.Promise

class HybridContactsModule : HybridContactsModuleSpec() {
    override val memorySize: Long
        get() = estimateMemorySize()

    private val context: ReactApplicationContext? = NitroModules.applicationContext

    fun requestContactPermission(): Boolean {
        val currentActivity = context?.currentActivity
        if (currentActivity != null) {
            ActivityCompat.requestPermissions(
                currentActivity,
                arrayOf(REQUIRED_PERMISSION),
                PERMISSION_REQUEST_CODE
            )
            return true
        }
        return false
    }

    private fun hasPhoneContactsPermission(): Boolean {
        if (context == null) {
            return false
        }

        val permissionStatus = ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.READ_CONTACTS
        )

        return permissionStatus == PackageManager.PERMISSION_GRANTED
    }

    override fun getAll(keys: Array<ContactFields>): Promise<Array<ContactData>> {
        return Promise.async {
            if (!hasPhoneContactsPermission()) {
                requestContactPermission()
                throw Exception("Contact permission not granted")
            }
            val startTime = System.currentTimeMillis()

            val startTime = System.currentTimeMillis()
            val contacts = mutableListOf<ContactData>()

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

                val selection = StringBuilder()
                val selectionArgs = mutableListOf<String>()

                selectionArgs.addAll(listOf(
                    ContactsContract.CommonDataKinds.StructuredName.CONTENT_ITEM_TYPE,
                    ContactsContract.CommonDataKinds.Phone.CONTENT_ITEM_TYPE,
                    ContactsContract.CommonDataKinds.Email.CONTENT_ITEM_TYPE
                ))

                selection.append("${ContactsContract.Data.MIMETYPE} IN (?, ?, ?)")

                val sortOrder = "${ContactsContract.Data.CONTACT_ID} ASC"

                val cursor = resolver.query(
                    ContactsContract.Data.CONTENT_URI,
                    projection,
                    selection.toString(),
                    selectionArgs.toTypedArray(),
                    sortOrder
                )

                cursor?.use {
                    val mimeTypeIndex = it.getColumnIndex(ContactsContract.Data.MIMETYPE)
                    val contactIdIndex = it.getColumnIndex(ContactsContract.Data.CONTACT_ID)
                    val photoUriIndex = it.getColumnIndex(ContactsContract.Contacts.PHOTO_URI)
                    val thumbnailUriIndex = it.getColumnIndex(ContactsContract.Contacts.PHOTO_THUMBNAIL_URI)
                    val data1Index = it.getColumnIndex(ContactsContract.Data.DATA1)
                    val givenNameIndex = it.getColumnIndex(ContactsContract.CommonDataKinds.StructuredName.GIVEN_NAME)
                    val familyNameIndex = it.getColumnIndex(ContactsContract.CommonDataKinds.StructuredName.FAMILY_NAME)
                    val middleNameIndex = it.getColumnIndex(ContactsContract.CommonDataKinds.StructuredName.MIDDLE_NAME)

                    var currentContact: ContactData? = null
                    var currentContactId: String? = null
                    val currentPhoneNumbers = mutableListOf<StringHolder>()
                    val currentEmailAddresses = mutableListOf<StringHolder>()

                    while (it.moveToNext()) {
                        val contactId = it.getString(contactIdIndex)
                        val mimeType = it.getString(mimeTypeIndex)

                        if (contactId != currentContactId) {
                            currentContact?.let { contact ->
                                contacts.add(contact.copy(
                                    phoneNumbers = currentPhoneNumbers.toTypedArray(),
                                    emailAddresses = currentEmailAddresses.toTypedArray()
                                ))
                            }
                            currentPhoneNumbers.clear()
                            currentEmailAddresses.clear()
                            currentContact = ContactData(
                                firstName = "",
                                lastName = "",
                                middleName = null,
                                phoneNumbers = emptyArray(),
                                emailAddresses = emptyArray(),
                                imageData = it.getString(photoUriIndex) ?: "",
                                thumbnailImageData = it.getString(thumbnailUriIndex) ?: ""
                            )
                            currentContactId = contactId
                        }

                        when (mimeType) {
                            ContactsContract.CommonDataKinds.StructuredName.CONTENT_ITEM_TYPE -> {
                                currentContact = currentContact?.copy(
                                    firstName = it.getString(givenNameIndex) ?: "",
                                    lastName = it.getString(familyNameIndex) ?: "",
                                    middleName = it.getString(middleNameIndex)
                                )
                            }
                            ContactsContract.CommonDataKinds.Phone.CONTENT_ITEM_TYPE -> {
                                it.getString(data1Index)?.let { phone ->
                                    currentPhoneNumbers.add(StringHolder(phone))
                                }
                            }
                            ContactsContract.CommonDataKinds.Email.CONTENT_ITEM_TYPE -> {
                                it.getString(data1Index)?.let { email ->
                                    currentEmailAddresses.add(StringHolder(email))
                                }
                            }
                        }
                    }
                    currentContact?.let { contact ->
                        contacts.add(contact.copy(
                            phoneNumbers = currentPhoneNumbers.toTypedArray(),
                            emailAddresses = currentEmailAddresses.toTypedArray()
                        ))
                    }
                }
            }

            val endTime = System.currentTimeMillis()
            val executionTime = endTime - startTime
            Log.d("HybridContact", "getAll execution time: $executionTime ms")
            Log.d("HybridContact", "Total contacts retrieved: ${contacts.size}")
            Log.d("HybridContact", "Estimated total memory size: $totalMemorySize bytes")
            estimatedMemorySize = totalMemorySize

            contacts.toTypedArray()
        }
    }

    private fun estimateMemorySize(): Long {
        // This is a rough estimate. You might want to implement a more accurate calculation based on actual data.
        return 1024 * 1024 // 1MB as a placeholder
    }

    companion object {
        const val PERMISSION_REQUEST_CODE = 1
        const val REQUIRED_PERMISSION = Manifest.permission.READ_CONTACTS

        fun onRequestPermissionsResult(
            requestCode: Int,
            permissions: Array<out String>,
            grantResults: IntArray,
            onGranted: () -> Unit,
            onDenied: () -> Unit
        ) {
            if (requestCode == PERMISSION_REQUEST_CODE) {
                if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    onGranted()
                } else {
                    onDenied()
                }
            }
        }
    }
}