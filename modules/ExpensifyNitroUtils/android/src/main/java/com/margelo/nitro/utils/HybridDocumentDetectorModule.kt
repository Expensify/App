package com.margelo.nitro.utils

import ai.onnxruntime.OnnxTensor
import ai.onnxruntime.OrtEnvironment
import ai.onnxruntime.OrtSession
import android.os.SystemClock
import android.util.Log
import com.margelo.nitro.NitroModules
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.FloatBuffer
import kotlin.math.abs
import kotlin.math.atan2
import kotlin.math.exp
import kotlin.math.hypot
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sqrt

// DocQuadNet-256 is from MakeACopy (https://github.com/egdels/makeacopy), Apache-2.0.
class HybridDocumentDetectorModule : HybridDocumentDetectorModuleSpec() {
    override val memorySize: Long = 0L

    override val isSupported: Boolean = true

    private class Region(val x: Double, val y: Double, val width: Double, val height: Double)

    private class Pass(
        val corners: Array<DoubleArray>,
        val peaks: DoubleArray,
        val mask: FloatArray,
        val region: Region,
        val scale: Double,
        val offsetX: Double,
        val offsetY: Double,
    )

    private class Rectangle(val corners: Array<DoubleArray>, val rebuiltCorner: Int, val confidence: Double)

    private enum class Gate { REJECTED, ACCEPTED, REACQUIRED, JUMPED, UNCONFIRMED }

    private var session: OrtSession? = null
    private var didFailToLoad = false
    private val input: FloatBuffer =
        ByteBuffer.allocateDirect(3 * INPUT_SIZE * INPUT_SIZE * 4).order(ByteOrder.nativeOrder()).asFloatBuffer()
    private var heatmaps = FloatArray(4 * HEATMAP_SIZE * HEATMAP_SIZE)
    private val inputValues = FloatArray(3 * INPUT_SIZE * INPUT_SIZE)
    private val columnAxis = IntArray(INPUT_SIZE * AXIS_FIELDS)
    private val rowAxis = IntArray(INPUT_SIZE * AXIS_FIELDS)
    private val mask = FloatArray(HEATMAP_SIZE * HEATMAP_SIZE)

    private var luma = ByteArray(0)
    private var integral = IntArray(0)
    private var chromaU = ByteArray(0)
    private var chromaV = ByteArray(0)

    private var trackedCorners: Array<DoubleArray>? = null
    private var trackedAt = 0L

    private var pendingCorners: Array<DoubleArray>? = null
    private var pendingAt = 0L

    private var failedAcquisitions = 0

    private var isPendingFromFullFrame = false

    override fun detect(pixelBuffer: ULong): DetectedDocument? = null

    @Synchronized
    override fun detectYuv(frame: YuvFrame): DetectedDocument? {
        val session = getSession() ?: return null
        val width = frame.width.toInt()
        val height = frame.height.toInt()
        val rotation = ((frame.rotation.toInt() % 360) + 360) % 360
        val uprightWidth = if (rotation == 90 || rotation == 270) height else width
        val uprightHeight = if (rotation == 90 || rotation == 270) width else height

        val startedAt = SystemClock.uptimeMillis()
        copyPlanes(frame)
        buildIntegral(width, height, frame.yRowStride.toInt())

        val tracked = trackedCorners?.takeIf { startedAt - trackedAt <= TRACK_MEMORY_MS }
        val isFullFrameSearch = tracked == null && shouldSearchFullFrame()
        val region =
            when {
                tracked != null -> getRegionAround(tracked, uprightWidth, uprightHeight)
                isFullFrameSearch -> Region(0.0, 0.0, uprightWidth.toDouble(), uprightHeight.toDouble())
                else -> getCentreRegion(uprightWidth, uprightHeight)
            }
        val first = runPass(session, region, frame, width, height, rotation, uprightWidth, uprightHeight)
        var corners = first.corners
        val peaks = first.peaks

        val rectangle = toRectangle(corners, peaks)
        val rebuiltCorner = rectangle?.rebuiltCorner ?: NO_REBUILT_CORNER
        if (rectangle != null) {
            corners = rectangle.corners
        }
        val confidence = rectangle?.confidence ?: 0.0
        val isRectangle = rectangle != null
        val iou = if (isRectangle) computeMaskIou(corners, first) else 0.0

        if (isRectangle && iou >= MIN_MASK_IOU) {
            val snapped = snapToEdges(corners, width, height, frame.yRowStride.toInt(), rotation, uprightWidth, uprightHeight)
            if (snapped != null && computeRectangleShapeError(snapped.first, getMaxAngleDeviation(rebuiltCorner)) <= 1.0) {
                corners = snapped.first
            }
        }
        val finishedAt = SystemClock.uptimeMillis()

        val minIou = if (rebuiltCorner >= 0) MIN_REBUILT_MASK_IOU else MIN_MASK_IOU
        val passesChecks = isRectangle && iou >= minIou
        // A box that jumps away from the followed receipt is only accepted once the next frame finds the same box, so a
        // single false detection never replaces the receipt.
        val gate =
            when {
                !passesChecks -> Gate.REJECTED
                tracked != null && isConsistent(tracked, corners) -> Gate.ACCEPTED
                tracked != null -> if (confirmsPending(corners, finishedAt)) Gate.REACQUIRED else Gate.JUMPED
                else -> if (confirmsPending(corners, finishedAt)) Gate.ACCEPTED else Gate.UNCONFIRMED
            }
        if (tracked == null) {
            failedAcquisitions = if (gate == Gate.ACCEPTED) 0 else failedAcquisitions + 1
            isPendingFromFullFrame = isFullFrameSearch && gate == Gate.UNCONFIRMED
        }
        if (gate != Gate.ACCEPTED && gate != Gate.REACQUIRED) {
            return null
        }
        trackedCorners = Array(4) { corners[it].copyOf() }
        trackedAt = finishedAt
        pendingCorners = null
        isPendingFromFullFrame = false

        val result =
            corners.map { point ->
                DocumentCorner(toBufferX(point[0], point[1], width, rotation) / width, toBufferY(point[0], point[1], height, rotation) / height)
            }
        return DetectedDocument(result.toTypedArray(), confidence)
    }

    private fun toRectangle(corners: Array<DoubleArray>, peaks: DoubleArray): Rectangle? {
        if (peaks.all { it >= MIN_CORNER_PEAK } && isClockwiseConvex(corners) && computeRectangleShapeError(corners, MAX_ANGLE_DEVIATION) <= 1.0) {
            return Rectangle(corners, NO_REBUILT_CORNER, peaks.minOrNull() ?: 0.0)
        }
        var best: Rectangle? = null
        var bestError = Double.MAX_VALUE
        for (rebuilt in 0 until 4) {
            val kept = (0 until 4).filter { it != rebuilt }
            if (kept.any { peaks[it] < MIN_CORNER_PEAK }) {
                continue
            }
            val previous = corners[(rebuilt + 3) % 4]
            val next = corners[(rebuilt + 1) % 4]
            val opposite = corners[(rebuilt + 2) % 4]
            // A receipt seen from above is close to a parallelogram, so a missing corner is the sum of its neighbors
            // minus the opposite corner.
            val candidate = Array(4) { if (it == rebuilt) doubleArrayOf(previous[0] + next[0] - opposite[0], previous[1] + next[1] - opposite[1]) else corners[it] }
            if (!isClockwiseConvex(candidate)) {
                continue
            }
            val error = computeRectangleShapeError(candidate, MAX_REBUILT_ANGLE_DEVIATION)
            if (error <= 1.0 && error < bestError) {
                bestError = error
                best = Rectangle(candidate, rebuilt, kept.minOf { peaks[it] })
            }
        }
        return best
    }

    private fun shouldSearchFullFrame(): Boolean {
        if (isPendingFromFullFrame) {
            return true
        }
        // Every other attempt, so the centre search, which keeps nearby papers out of view, still gets its turn.
        return failedAcquisitions >= FULL_FRAME_AFTER_FAILED_ACQUISITIONS && failedAcquisitions % 2 == 0
    }

    private fun confirmsPending(corners: Array<DoubleArray>, finishedAt: Long): Boolean {
        val pending = pendingCorners?.takeIf { finishedAt - pendingAt <= CONFIRM_WINDOW_MS }
        pendingCorners = Array(4) { corners[it].copyOf() }
        pendingAt = finishedAt
        return pending != null && isConsistent(pending, corners)
    }

    private fun isConsistent(previous: Array<DoubleArray>, next: Array<DoubleArray>): Boolean {
        val previousArea = computeQuadArea(previous)
        val nextArea = computeQuadArea(next)
        if (previousArea <= 0 || nextArea <= 0) {
            return false
        }
        val areaRatio = max(previousArea, nextArea) / min(previousArea, nextArea)
        val centreShift = hypot(next.sumOf { it[0] } / 4 - previous.sumOf { it[0] } / 4, next.sumOf { it[1] } / 4 - previous.sumOf { it[1] } / 4)
        return areaRatio <= MAX_AREA_CHANGE && centreShift <= MAX_CENTRE_SHIFT * sqrt(previousArea)
    }

    private fun getCentreRegion(uprightWidth: Int, uprightHeight: Int) =
        Region(
            uprightWidth * (1 - CENTRE_SHARE) / 2,
            uprightHeight * (1 - CENTRE_SHARE) / 2,
            uprightWidth * CENTRE_SHARE,
            uprightHeight * CENTRE_SHARE,
        )

    private fun getRegionAround(corners: Array<DoubleArray>, uprightWidth: Int, uprightHeight: Int): Region {
        val centre = getCentreRegion(uprightWidth, uprightHeight)
        val left = corners.minOf { it[0] }
        val right = corners.maxOf { it[0] }
        val top = corners.minOf { it[1] }
        val bottom = corners.maxOf { it[1] }
        val marginX = (right - left) * TRACK_MARGIN
        val marginY = (bottom - top) * TRACK_MARGIN
        val x = min(centre.x, left - marginX).coerceAtLeast(0.0)
        val y = min(centre.y, top - marginY).coerceAtLeast(0.0)
        val regionRight = max(centre.x + centre.width, right + marginX).coerceAtMost(uprightWidth.toDouble())
        val regionBottom = max(centre.y + centre.height, bottom + marginY).coerceAtMost(uprightHeight.toDouble())
        return Region(x, y, regionRight - x, regionBottom - y)
    }

    private fun getMaxAngleDeviation(rebuiltCorner: Int) = if (rebuiltCorner >= 0) MAX_REBUILT_ANGLE_DEVIATION else MAX_ANGLE_DEVIATION

    private fun computeRectangleShapeError(corners: Array<DoubleArray>, maxAngleDeviation: Double): Double {
        var worstAngle = 0.0
        for (corner in 0 until 4) {
            val previous = corners[(corner + 3) % 4]
            val current = corners[corner]
            val next = corners[(corner + 1) % 4]
            val ax = previous[0] - current[0]
            val ay = previous[1] - current[1]
            val bx = next[0] - current[0]
            val by = next[1] - current[1]
            val angle = Math.toDegrees(atan2(abs(ax * by - ay * bx), ax * bx + ay * by))
            worstAngle = max(worstAngle, abs(angle - 90))
        }
        val sides = DoubleArray(4) { hypot(corners[(it + 1) % 4][0] - corners[it][0], corners[(it + 1) % 4][1] - corners[it][1]) }
        var worstRatio = 1.0
        for (side in 0 until 2) {
            worstRatio = min(worstRatio, min(sides[side], sides[side + 2]) / max(sides[side], sides[side + 2]))
        }
        return max(worstAngle / maxAngleDeviation, (1 - worstRatio) / (1 - MIN_OPPOSITE_SIDE_RATIO))
    }

    private fun snapToEdges(
        corners: Array<DoubleArray>,
        width: Int,
        height: Int,
        rowStride: Int,
        rotation: Int,
        uprightWidth: Int,
        uprightHeight: Int,
    ): Pair<Array<DoubleArray>, Int>? {
        val band = SNAP_BAND * min(uprightWidth, uprightHeight)
        val bandSteps = band.toInt()
        val linePoints = Array(4) { corners[it].copyOf() }
        val directions = Array(4) { side ->
            val a = corners[side]
            val b = corners[(side + 1) % 4]
            val length = hypot(b[0] - a[0], b[1] - a[1])
            doubleArrayOf((b[0] - a[0]) / length, (b[1] - a[1]) / length)
        }
        var movedSides = 0
        for (side in 0 until 4) {
            val a = corners[side]
            val b = corners[(side + 1) % 4]
            val normalX = directions[side][1]
            val normalY = -directions[side][0]
            var bestOffset = 0
            var bestScore = 0.0
            for (offset in -bandSteps..bandSteps) {
                var sum = 0.0
                for (sample in 0 until SNAP_SAMPLES) {
                    val t = SNAP_SIDE_START + (1 - 2 * SNAP_SIDE_START) * sample / (SNAP_SAMPLES - 1)
                    val x = a[0] + (b[0] - a[0]) * t + normalX * offset
                    val y = a[1] + (b[1] - a[1]) * t + normalY * offset
                    val outside = readLumaAt(x + normalX * SNAP_PROBE, y + normalY * SNAP_PROBE, width, height, rowStride, rotation, uprightWidth, uprightHeight)
                    val inside = readLumaAt(x - normalX * SNAP_PROBE, y - normalY * SNAP_PROBE, width, height, rowStride, rotation, uprightWidth, uprightHeight)
                    sum += outside - inside
                }
                val score = abs(sum) / SNAP_SAMPLES
                if (score > bestScore) {
                    bestScore = score
                    bestOffset = offset
                }
            }
            if (bestScore >= MIN_EDGE_CONTRAST && bestOffset != 0) {
                linePoints[side][0] += normalX * bestOffset
                linePoints[side][1] += normalY * bestOffset
                movedSides++
            }
        }
        if (movedSides == 0) {
            return Pair(corners, 0)
        }

        val snapped = Array(4) { corner ->
            val previous = (corner + 3) % 4
            intersect(linePoints[previous], directions[previous], linePoints[corner], directions[corner]) ?: return null
        }
        for (corner in 0 until 4) {
            if (hypot(snapped[corner][0] - corners[corner][0], snapped[corner][1] - corners[corner][1]) > SNAP_MAX_CORNER_SHIFT * band) {
                return null
            }
        }
        return if (isClockwiseConvex(snapped)) Pair(snapped, movedSides) else null
    }

    private fun readLumaAt(x: Double, y: Double, width: Int, height: Int, rowStride: Int, rotation: Int, uprightWidth: Int, uprightHeight: Int): Int {
        val uprightX = x.toInt().coerceIn(0, uprightWidth - 1)
        val uprightY = y.toInt().coerceIn(0, uprightHeight - 1)
        val column = toBufferColumn(uprightX, uprightY, width, rotation)
        val row = toBufferRow(uprightX, uprightY, height, rotation)
        return luma[row * rowStride + column].toInt() and 0xFF
    }

    private fun computeMaskIou(corners: Array<DoubleArray>, pass: Pass): Double {
        val cells = Array(4) { corner ->
            doubleArrayOf(
                ((corners[corner][0] - pass.region.x) * pass.scale + pass.offsetX) / HEATMAP_STRIDE,
                ((corners[corner][1] - pass.region.y) * pass.scale + pass.offsetY) / HEATMAP_STRIDE,
            )
        }
        var intersection = 0
        var union = 0
        for (y in 0 until HEATMAP_SIZE) {
            for (x in 0 until HEATMAP_SIZE) {
                val isInMask = pass.mask[y * HEATMAP_SIZE + x] > 0
                val isInQuad = isInsideClockwiseQuad(cells, x + 0.5, y + 0.5)
                if (isInMask && isInQuad) {
                    intersection++
                }
                if (isInMask || isInQuad) {
                    union++
                }
            }
        }
        return if (union == 0) 0.0 else intersection.toDouble() / union
    }

    private fun runPass(
        session: OrtSession,
        region: Region,
        frame: YuvFrame,
        width: Int,
        height: Int,
        rotation: Int,
        uprightWidth: Int,
        uprightHeight: Int,
    ): Pass {
        val scale = min(INPUT_SIZE / region.width, INPUT_SIZE / region.height)
        val offsetX = (INPUT_SIZE - region.width * scale) / 2
        val offsetY = (INPUT_SIZE - region.height * scale) / 2
        fillInput(region, scale, offsetX, offsetY, frame, width, height, rotation, uprightWidth, uprightHeight)

        val env = OrtEnvironment.getEnvironment()
        OnnxTensor.createTensor(env, input, longArrayOf(1, 3, INPUT_SIZE.toLong(), INPUT_SIZE.toLong())).use { tensor ->
            session.run(mapOf(INPUT_NAME to tensor), setOf(CORNERS_OUTPUT_NAME, MASK_OUTPUT_NAME)).use { result ->
                val buffer = (result.get(CORNERS_OUTPUT_NAME).get() as OnnxTensor).floatBuffer
                if (heatmaps.size != buffer.remaining()) {
                    heatmaps = FloatArray(buffer.remaining())
                }
                buffer.get(heatmaps)
                (result.get(MASK_OUTPUT_NAME).get() as OnnxTensor).floatBuffer.get(mask)
            }
        }

        val corners = Array(4) { DoubleArray(2) }
        val peaks = DoubleArray(4)
        for (corner in 0 until 4) {
            val (x64, y64, peak) = refinePeak(corner)
            peaks[corner] = applySigmoid(peak)
            corners[corner][0] = region.x + (x64 * HEATMAP_STRIDE - offsetX) / scale
            corners[corner][1] = region.y + (y64 * HEATMAP_STRIDE - offsetY) / scale
        }
        return Pass(corners, peaks, mask.copyOf(), region, scale, offsetX, offsetY)
    }

    private fun getSession(): OrtSession? {
        session?.let { return it }
        if (didFailToLoad) {
            return null
        }
        return try {
            val context = NitroModules.applicationContext ?: return null
            val model = context.assets.open(MODEL_ASSET_PATH).use { it.readBytes() }
            val options = OrtSession.SessionOptions().apply {
                setOptimizationLevel(OrtSession.SessionOptions.OptLevel.ALL_OPT)
                setIntraOpNumThreads(INFERENCE_THREADS)
            }
            OrtEnvironment.getEnvironment().createSession(model, options).also {
                session = it
            }
        } catch (error: Throwable) {
            Log.e(TAG, "Could not load the document detection model", error)
            didFailToLoad = true
            null
        }
    }

    private fun copyPlanes(frame: YuvFrame) {
        luma = copyInto(frame.y.getBuffer(false), luma)
        chromaU = copyInto(frame.u.getBuffer(false), chromaU)
        chromaV = copyInto(frame.v.getBuffer(false), chromaV)
    }

    private fun buildIntegral(width: Int, height: Int, rowStride: Int) {
        val integralWidth = width + 1
        val size = integralWidth * (height + 1)
        if (integral.size != size) {
            integral = IntArray(size)
        }
        for (y in 0 until height) {
            var rowSum = 0
            val rowStart = y * rowStride
            val above = y * integralWidth
            val current = (y + 1) * integralWidth
            for (x in 0 until width) {
                val index = rowStart + x
                rowSum += if (index < luma.size) luma[index].toInt() and 0xFF else 0
                integral[current + x + 1] = integral[above + x + 1] + rowSum
            }
        }
    }

    private fun fillInput(
        region: Region,
        scale: Double,
        offsetX: Double,
        offsetY: Double,
        frame: YuvFrame,
        width: Int,
        height: Int,
        rotation: Int,
        uprightWidth: Int,
        uprightHeight: Int,
    ) {
        val uvRowStride = frame.uvRowStride.toInt()
        val uvPixelStride = frame.uvPixelStride.toInt()
        val planeSize = INPUT_SIZE * INPUT_SIZE
        val halfBox = 0.5 / scale
        val integralWidth = width + 1
        val isSwapped = rotation == 90 || rotation == 270
        fillAxis(columnAxis, region.x, region.x + region.width, uprightWidth, offsetX, scale, halfBox,
            isFlipped = rotation == 180 || rotation == 90, flipSize = if (rotation == 90) height else width)
        fillAxis(rowAxis, region.y, region.y + region.height, uprightHeight, offsetY, scale, halfBox,
            isFlipped = rotation == 180 || rotation == 270, flipSize = if (rotation == 270) width else height)

        val values = inputValues
        for (row in 0 until INPUT_SIZE) {
            val rowBase = row * AXIS_FIELDS
            val isRowInside = rowAxis[rowBase] != 0
            for (column in 0 until INPUT_SIZE) {
                val index = row * INPUT_SIZE + column
                val columnBase = column * AXIS_FIELDS
                if (!isRowInside || columnAxis[columnBase] == 0) {
                    values[index] = 0f
                    values[planeSize + index] = 0f
                    values[2 * planeSize + index] = 0f
                    continue
                }
                val xBase = if (isSwapped) rowBase else columnBase
                val yBase = if (isSwapped) columnBase else rowBase
                val xAxis = if (isSwapped) rowAxis else columnAxis
                val yAxis = if (isSwapped) columnAxis else rowAxis
                val x0 = xAxis[xBase + 1]
                val x1 = xAxis[xBase + 2] + 1
                val y0 = yAxis[yBase + 1]
                val y1 = yAxis[yBase + 2] + 1
                val sum = integral[y1 * integralWidth + x1] - integral[y0 * integralWidth + x1] - integral[y1 * integralWidth + x0] + integral[y0 * integralWidth + x0]
                val y = (sum / ((x1 - x0) * (y1 - y0))).toDouble()

                val chromaIndex = (yAxis[yBase + 3] / 2) * uvRowStride + (xAxis[xBase + 3] / 2) * uvPixelStride
                val u = (if (chromaIndex < chromaU.size) chromaU[chromaIndex].toInt() and 0xFF else CHROMA_OFFSET) - CHROMA_OFFSET.toDouble()
                val v = (if (chromaIndex < chromaV.size) chromaV[chromaIndex].toInt() and 0xFF else CHROMA_OFFSET) - CHROMA_OFFSET.toDouble()

                values[index] = toUnit(y + RED_FROM_V * v)
                values[planeSize + index] = toUnit(y - GREEN_FROM_U * u - GREEN_FROM_V * v)
                values[2 * planeSize + index] = toUnit(y + BLUE_FROM_U * u)
            }
        }
        input.clear()
        input.put(values)
        input.rewind()
    }

    private fun fillAxis(
        axis: IntArray,
        regionStart: Double,
        regionEnd: Double,
        uprightSize: Int,
        offset: Double,
        scale: Double,
        halfBox: Double,
        isFlipped: Boolean,
        flipSize: Int,
    ) {
        for (step in 0 until INPUT_SIZE) {
            val base = step * AXIS_FIELDS
            val upright = regionStart + (step + 0.5 - offset) / scale
            if (upright < regionStart || upright >= regionEnd || upright >= uprightSize) {
                axis[base] = 0
                continue
            }
            val low = (upright - halfBox).toInt().coerceIn(0, uprightSize - 1)
            val high = (upright + halfBox).toInt().coerceIn(0, uprightSize - 1)
            val center = upright.toInt().coerceIn(0, uprightSize - 1)
            axis[base] = 1
            axis[base + 1] = if (isFlipped) flipSize - 1 - high else low
            axis[base + 2] = if (isFlipped) flipSize - 1 - low else high
            axis[base + 3] = if (isFlipped) flipSize - 1 - center else center
        }
    }

    private fun refinePeak(corner: Int): Triple<Double, Double, Double> {
        val base = corner * HEATMAP_SIZE * HEATMAP_SIZE
        var bestIndex = 0
        var best = Float.NEGATIVE_INFINITY
        for (index in 0 until HEATMAP_SIZE * HEATMAP_SIZE) {
            val value = heatmaps[base + index]
            if (value > best) {
                best = value
                bestIndex = index
            }
        }
        val bestX = bestIndex % HEATMAP_SIZE
        val bestY = bestIndex / HEATMAP_SIZE

        var sumWeight = 0.0
        var sumX = 0.0
        var sumY = 0.0
        for (y in max(0, bestY - 1)..min(HEATMAP_SIZE - 1, bestY + 1)) {
            for (x in max(0, bestX - 1)..min(HEATMAP_SIZE - 1, bestX + 1)) {
                val weight = exp((heatmaps[base + y * HEATMAP_SIZE + x] - best).toDouble())
                sumWeight += weight
                sumX += weight * (x + 0.5)
                sumY += weight * (y + 0.5)
            }
        }
        return Triple(sumX / sumWeight, sumY / sumWeight, best.toDouble())
    }

    companion object {
        private const val TAG = "DocumentDetector"
        private const val MODEL_ASSET_PATH = "docquad/docquadnet256_trained_opset17.ort"
        private const val INPUT_NAME = "input"
        private const val CORNERS_OUTPUT_NAME = "corner_heatmaps"
        private const val MASK_OUTPUT_NAME = "mask_logits"
        private const val INPUT_SIZE = 256
        private const val HEATMAP_SIZE = 64
        private const val HEATMAP_STRIDE = INPUT_SIZE.toDouble() / HEATMAP_SIZE

        private const val AXIS_FIELDS = 4

        private const val NO_REBUILT_CORNER = -1

        // Full-range BT.601 YUV to RGB, the conversion Android camera frames use.
        private const val CHROMA_OFFSET = 128
        private const val RED_FROM_V = 1.402
        private const val GREEN_FROM_U = 0.344136
        private const val GREEN_FROM_V = 0.714136
        private const val BLUE_FROM_U = 1.772

        private const val INFERENCE_THREADS = 4

        private const val MIN_MASK_IOU = 0.6

        private const val MIN_REBUILT_MASK_IOU = 0.75

        private const val CENTRE_SHARE = 0.75

        private const val FULL_FRAME_AFTER_FAILED_ACQUISITIONS = 2

        private const val TRACK_MARGIN = 0.5

        private const val TRACK_MEMORY_MS = 1000L

        private const val MAX_AREA_CHANGE = 1.4

        private const val MAX_CENTRE_SHIFT = 0.33

        private const val CONFIRM_WINDOW_MS = 300L

        private const val MIN_CORNER_PEAK = 0.2

        private const val MAX_ANGLE_DEVIATION = 25.0

        private const val MAX_REBUILT_ANGLE_DEVIATION = 10.0

        private const val MIN_OPPOSITE_SIDE_RATIO = 0.7

        private const val SNAP_BAND = 0.03

        private const val SNAP_SAMPLES = 24
        private const val SNAP_SIDE_START = 0.15

        private const val SNAP_PROBE = 3.0

        private const val MIN_EDGE_CONTRAST = 6.0

        private const val SNAP_MAX_CORNER_SHIFT = 2.0

        private fun applySigmoid(value: Double) = 1 / (1 + exp(-value))

        private fun toUnit(value: Double) = (value.coerceIn(0.0, 255.0) / 255.0).toFloat()

        private fun copyInto(source: ByteBuffer, target: ByteArray): ByteArray {
            val view = source.duplicate()
            view.rewind()
            val array = if (target.size == view.remaining()) target else ByteArray(view.remaining())
            view.get(array)
            return array
        }

        private fun toBufferX(x: Double, y: Double, width: Int, rotation: Int): Double =
            when (rotation) {
                90 -> y
                180 -> width - x
                270 -> width - y
                else -> x
            }

        private fun toBufferY(x: Double, y: Double, height: Int, rotation: Int): Double =
            when (rotation) {
                90 -> height - x
                180 -> height - y
                270 -> x
                else -> y
            }

        private fun toBufferColumn(x: Int, y: Int, width: Int, rotation: Int): Int =
            when (rotation) {
                90 -> y
                180 -> width - 1 - x
                270 -> width - 1 - y
                else -> x
            }

        private fun toBufferRow(x: Int, y: Int, height: Int, rotation: Int): Int =
            when (rotation) {
                90 -> height - 1 - x
                180 -> height - 1 - y
                270 -> x
                else -> y
            }

        private fun computeQuadArea(corners: Array<DoubleArray>): Double {
            var twiceArea = 0.0
            for (index in 0 until 4) {
                val a = corners[index]
                val b = corners[(index + 1) % 4]
                twiceArea += a[0] * b[1] - b[0] * a[1]
            }
            return abs(twiceArea) / 2
        }

        private fun intersect(pointA: DoubleArray, directionA: DoubleArray, pointB: DoubleArray, directionB: DoubleArray): DoubleArray? {
            val denominator = directionA[0] * directionB[1] - directionA[1] * directionB[0]
            if (abs(denominator) < 1e-6) {
                return null
            }
            val t = ((pointB[0] - pointA[0]) * directionB[1] - (pointB[1] - pointA[1]) * directionB[0]) / denominator
            return doubleArrayOf(pointA[0] + directionA[0] * t, pointA[1] + directionA[1] * t)
        }

        private fun isInsideClockwiseQuad(corners: Array<DoubleArray>, x: Double, y: Double): Boolean {
            for (index in 0 until 4) {
                val a = corners[index]
                val b = corners[(index + 1) % 4]
                if ((b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0]) < 0) {
                    return false
                }
            }
            return true
        }

        private fun isClockwiseConvex(corners: Array<DoubleArray>): Boolean {
            for (index in 0 until 4) {
                val a = corners[index]
                val b = corners[(index + 1) % 4]
                val c = corners[(index + 2) % 4]
                val cross = (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0])
                if (cross <= 0) {
                    return false
                }
            }
            return true
        }
    }
}
