package com.margelo.nitro.utils

import androidx.exifinterface.media.ExifInterface

/** Turns the stored width and height of a shared image or video into the size it is shown at, so its aspect ratio matches what the user sees. */
object SharedMediaSize {
    // These orientations turn the stored image a quarter turn, so it is shown with its width and height swapped.
    private val ROTATED_ORIENTATIONS = setOf(
        ExifInterface.ORIENTATION_ROTATE_90,
        ExifInterface.ORIENTATION_ROTATE_270,
        ExifInterface.ORIENTATION_TRANSPOSE,
        ExifInterface.ORIENTATION_TRANSVERSE,
    )

    // Camera photos are often stored in landscape with an EXIF orientation that shows them in portrait.
    fun getImageDisplaySize(width: Double, height: Double, exifOrientation: Int): Pair<Double, Double> =
        if (exifOrientation in ROTATED_ORIENTATIONS) height to width else width to height

    fun getVideoDisplaySize(width: Double, height: Double, rotationDegrees: Int): Pair<Double, Double> =
        if (rotationDegrees % 180 != 0) height to width else width to height
}
