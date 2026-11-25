package com.margelo.nitro.utils

import androidx.exifinterface.media.ExifInterface
import org.junit.Assert.assertEquals
import org.junit.Test

class SharedMediaSizeTest {
    private val landscape = 4000.0 to 3000.0
    private val portrait = 3000.0 to 4000.0

    @Test
    fun swapsAnImageWhoseOrientationTurnsItAQuarterTurn() {
        // Given a photo stored in landscape with an EXIF orientation that turns it a quarter turn, with or without a mirror
        val quarterTurns = listOf(
            ExifInterface.ORIENTATION_ROTATE_90,
            ExifInterface.ORIENTATION_ROTATE_270,
            ExifInterface.ORIENTATION_TRANSPOSE,
            ExifInterface.ORIENTATION_TRANSVERSE,
        )

        // When its shown size is read
        // Then it is portrait, as the gallery shows it
        quarterTurns.forEach { orientation ->
            assertEquals(portrait, SharedMediaSize.getImageDisplaySize(landscape.first, landscape.second, orientation))
        }
    }

    @Test
    fun keepsAnImageWhoseOrientationDoesNotTurnIt() {
        // Given a photo whose EXIF orientation is missing, normal, a half turn or a mirror
        val sameShape = listOf(
            ExifInterface.ORIENTATION_UNDEFINED,
            ExifInterface.ORIENTATION_NORMAL,
            ExifInterface.ORIENTATION_ROTATE_180,
            ExifInterface.ORIENTATION_FLIP_HORIZONTAL,
            ExifInterface.ORIENTATION_FLIP_VERTICAL,
        )

        // When its shown size is read
        // Then the stored size is kept, because none of these change which side is longer
        sameShape.forEach { orientation ->
            assertEquals(landscape, SharedMediaSize.getImageDisplaySize(landscape.first, landscape.second, orientation))
        }
    }

    @Test
    fun swapsAVideoRotatedAQuarterTurn() {
        // Given a video stored in landscape with a rotation that shows it in portrait, including a negative angle
        // When its shown size is read
        // Then it is portrait
        listOf(90, 270, -90).forEach { rotation ->
            assertEquals(portrait, SharedMediaSize.getVideoDisplaySize(landscape.first, landscape.second, rotation))
        }
    }

    @Test
    fun keepsAVideoThatIsNotRotatedAQuarterTurn() {
        // Given a video with no rotation or a half turn
        // When its shown size is read
        // Then the stored size is kept
        listOf(0, 180).forEach { rotation ->
            assertEquals(landscape, SharedMediaSize.getVideoDisplaySize(landscape.first, landscape.second, rotation))
        }
    }
}
