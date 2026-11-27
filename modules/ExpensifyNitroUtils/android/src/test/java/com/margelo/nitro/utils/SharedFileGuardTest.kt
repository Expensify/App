package com.margelo.nitro.utils

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder
import java.io.File
import java.nio.file.Files

class SharedFileGuardTest {
    @get:Rule
    val filesDir = TemporaryFolder()

    private lateinit var shareDirectory: File
    private lateinit var privateFile: File

    @Before
    fun setUp() {
        // Given an app files folder holding the share folder and a private file the app must never upload
        shareDirectory = filesDir.newFolder("Expensify")
        privateFile = File(filesDir.newFolder("shared_prefs"), "session.xml").apply { writeText("authToken") }
    }

    @Test
    fun returnsAFileCopiedIntoTheShareFolder() {
        // Given a file the intent handler copied into the share folder
        val sharedFile = File(shareDirectory, "receipt.pdf").apply { writeText("pdf") }

        // When it is resolved
        val result = SharedFileGuard.resolveInside(shareDirectory, sharedFile.path)

        // Then the share can be read
        assertEquals(sharedFile.canonicalFile, result)
    }

    @Test
    fun rejectsAnAbsolutePathToAPrivateFile() {
        // Given shared text that is the absolute path of a private file, as a malicious app would send
        // When it is resolved
        val result = SharedFileGuard.resolveInside(shareDirectory, privateFile.absolutePath)

        // Then it is not treated as a shared file
        assertNull(result)
    }

    @Test
    fun rejectsAPathThatClimbsOutOfTheShareFolder() {
        // Given a path that starts in the share folder but uses .. to reach a private file
        val path = "${shareDirectory.path}/../shared_prefs/session.xml"

        // When it is resolved
        val result = SharedFileGuard.resolveInside(shareDirectory, path)

        // Then the canonical path is outside the share folder, so it is rejected
        assertNull(result)
    }

    @Test
    fun rejectsASiblingFolderThatSharesThePrefix() {
        // Given a file in a folder whose name only starts with the share folder's name
        val sibling = File(filesDir.newFolder("Expensify2"), "x.txt").apply { writeText("x") }

        // When it is resolved
        val result = SharedFileGuard.resolveInside(shareDirectory, sibling.path)

        // Then the prefix match does not let it through
        assertNull(result)
    }

    @Test
    fun rejectsASymlinkInsideTheShareFolderThatPointsOut() {
        // Given a symlink inside the share folder that points at a private file
        val link = File(shareDirectory, "link.xml")
        Files.createSymbolicLink(link.toPath(), privateFile.toPath())

        // When it is resolved
        val result = SharedFileGuard.resolveInside(shareDirectory, link.path)

        // Then the link target decides, so it is rejected
        assertNull(result)
    }

    @Test
    fun rejectsMissingFilesFoldersAndEmptyPaths() {
        // Given paths that are not readable regular files in the share folder
        // When they are resolved
        // Then none of them is treated as a shared file
        assertNull(SharedFileGuard.resolveInside(shareDirectory, File(shareDirectory, "missing.pdf").path))
        assertNull(SharedFileGuard.resolveInside(shareDirectory, shareDirectory.path))
        assertNull(SharedFileGuard.resolveInside(shareDirectory, ""))
        assertNull(SharedFileGuard.resolveInside(shareDirectory, "hello world"))
    }
}
