package com.expensify.chat.utils

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class FileUtilsTest {
    @Test
    fun keepsAnOrdinaryFileName() {
        // Given a normal display name from the sending app
        // When it is made safe
        // Then it is unchanged, so the attachment keeps the name the user sees
        assertEquals("invoice.pdf", FileUtils.getSafeFileName("invoice.pdf"))
    }

    @Test
    fun dropsDirectorySegmentsSoTheCopyStaysInTheShareFolder() {
        // Given display names a malicious content provider could return to write outside the share folder
        // When they are made safe
        // Then only the last segment is kept
        assertEquals("session.xml", FileUtils.getSafeFileName("../shared_prefs/session.xml"))
        assertEquals("c.pdf", FileUtils.getSafeFileName("a/b/c.pdf"))
        assertEquals("c.pdf", FileUtils.getSafeFileName("..\\..\\c.pdf"))
    }

    @Test
    fun rejectsNamesThatAreNotAFile() {
        // Given display names that would point at a folder or nothing
        // When they are made safe
        // Then the copy is refused
        assertNull(FileUtils.getSafeFileName(null))
        assertNull(FileUtils.getSafeFileName(""))
        assertNull(FileUtils.getSafeFileName("."))
        assertNull(FileUtils.getSafeFileName(".."))
        assertNull(FileUtils.getSafeFileName("../"))
    }
}
