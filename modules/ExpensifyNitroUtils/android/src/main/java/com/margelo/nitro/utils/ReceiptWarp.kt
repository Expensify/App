package com.margelo.nitro.utils

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Matrix
import android.graphics.Paint
import android.os.Build
import android.os.SystemClock
import android.util.Log
import kotlin.math.hypot
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

object ReceiptWarp {
    private const val TAG = "ReceiptWarp"
    private const val CORNER_COUNT = 4

    fun warp(source: Bitmap, quad: Array<DocumentCorner>, maxLongSide: Double): Bitmap {
        require(quad.size == CORNER_COUNT) { "warpImage needs 4 corners, got ${quad.size}" }
        val startedAt = SystemClock.elapsedRealtime()
        val (topLeft, topRight, bottomRight, bottomLeft) = quad

        val width = max(distance(topLeft, topRight), distance(bottomLeft, bottomRight))
        val height = max(distance(topLeft, bottomLeft), distance(topRight, bottomRight))
        val scale = min(1.0, maxLongSide / max(width, height))
        val outputWidth = max(1, (width * scale).roundToInt())
        val outputHeight = max(1, (height * scale).roundToInt())

        val from = floatArrayOf(
            topLeft.x.toFloat(), topLeft.y.toFloat(),
            topRight.x.toFloat(), topRight.y.toFloat(),
            bottomRight.x.toFloat(), bottomRight.y.toFloat(),
            bottomLeft.x.toFloat(), bottomLeft.y.toFloat(),
        )
        val to = floatArrayOf(
            0f, 0f,
            outputWidth.toFloat(), 0f,
            outputWidth.toFloat(), outputHeight.toFloat(),
            0f, outputHeight.toFloat(),
        )
        val matrix = Matrix()
        check(matrix.setPolyToPoly(from, 0, to, 0, CORNER_COUNT)) { "The corners do not form a shape a rectangle can be mapped from" }

        val readable = toSoftwareBitmap(source)
        try {
            val output = Bitmap.createBitmap(outputWidth, outputHeight, Bitmap.Config.ARGB_8888)
            Canvas(output).drawBitmap(readable, matrix, Paint(Paint.FILTER_BITMAP_FLAG or Paint.ANTI_ALIAS_FLAG))
            Log.i(TAG, "warped ${source.width}x${source.height} to ${outputWidth}x$outputHeight in ${SystemClock.elapsedRealtime() - startedAt}ms")
            return output
        } finally {
            if (readable !== source) {
                readable.recycle()
            }
        }
    }

    /** A software canvas and getPixels can't read a GPU-backed bitmap, so that one is copied to memory. */
    fun toSoftwareBitmap(source: Bitmap): Bitmap {
        val isHardware = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && source.config == Bitmap.Config.HARDWARE
        return if (isHardware) source.copy(Bitmap.Config.ARGB_8888, false) else source
    }

    private fun distance(start: DocumentCorner, end: DocumentCorner): Double = hypot(end.x - start.x, end.y - start.y)
}
