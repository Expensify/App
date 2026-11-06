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
import kotlin.math.ceil
import kotlin.math.exp
import kotlin.math.floor
import kotlin.math.hypot
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sqrt

/**
 * Finds the receipt in the scan camera's frames on Android. Runs the DocQuadNet-256 model on each YUV frame, follows the
 * receipt from frame to frame, and bends the four-cornered shape onto the paper's real edge for the outline drawn in JS.
 * DocQuadNet-256 is from MakeACopy (https://github.com/egdels/makeacopy), Apache-2.0.
 */
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
        ByteBuffer.allocateDirect(INPUT_CHANNELS * INPUT_SIZE * INPUT_SIZE * Float.SIZE_BYTES).order(ByteOrder.nativeOrder()).asFloatBuffer()
    private var heatmaps = FloatArray(4 * HEATMAP_SIZE * HEATMAP_SIZE)
    private val inputValues = FloatArray(INPUT_CHANNELS * INPUT_SIZE * INPUT_SIZE)
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

        var isSnapped = false
        if (isRectangle && iou >= MIN_MASK_IOU) {
            val snapped = snapToEdges(corners, width, height, frame.yRowStride.toInt(), rotation, uprightWidth, uprightHeight)
            if (snapped != null && computeRectangleShapeError(snapped.first, getMaxAngleDeviation(rebuiltCorner)) <= 1.0) {
                corners = snapped.first
                isSnapped = true
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

        val toDocumentCorner = { point: DoubleArray ->
            DocumentCorner(toBufferX(point[0], point[1], width, rotation) / width, toBufferY(point[0], point[1], height, rotation) / height)
        }
        val rowStride = frame.yRowStride.toInt()
        val readLuma = LumaReader(width, height, rowStride, rotation, uprightWidth, uprightHeight)
        val outline = bendOutline(corners, first, uprightWidth, uprightHeight, readLuma, isSnapped)
        return DetectedDocument(corners.map(toDocumentCorner).toTypedArray(), confidence, outline?.map(toDocumentCorner)?.toTypedArray())
    }

    private fun bendOutline(corners: Array<DoubleArray>, pass: Pass, uprightWidth: Int, uprightHeight: Int, readLuma: LumaReader, isSnapped: Boolean): Array<DoubleArray>? {
        val shorterSide = (0 until 4).minOf { side -> hypot(corners[(side + 1) % 4][0] - corners[side][0], corners[(side + 1) % 4][1] - corners[side][1]) }
        val band = BEND_BAND * shorterSide
        val margin = FRAME_MARGIN * min(uprightWidth, uprightHeight)
        if (corners.any { it[0] < margin || it[1] < margin || it[0] > uprightWidth - margin || it[1] > uprightHeight - margin }) {
            return null
        }
        val step = HEATMAP_STRIDE / pass.scale / 2
        val lumaSearch = LUMA_SEARCH_CELLS * 2 * step
        val edgeHits = IntArray(2)
        val centreX = corners.sumOf { it[0] } / 4
        val centreY = corners.sumOf { it[1] } / 4
        val bentCorners = Array(4) { corner ->
            val point = corners[corner]
            // At its tip the paper is only a sliver, too thin for a clear brightness step, so the step search below stops
            // short of it and the corner is drawn rounded.
            findPaperTip(point, corners[(corner + 3) % 4], corners[(corner + 1) % 4], band, readLuma)?.let { return@Array it }
            val diagonal = hypot(point[0] - centreX, point[1] - centreY)
            val directionX = (point[0] - centreX) / diagonal
            val directionY = (point[1] - centreY) / diagonal
            val found = findMaskBorder(point[0], point[1], directionX, directionY, band, step, pass) ?: 0.0
            val edge = findLumaEdge(point[0], point[1], directionX, directionY, -band, max(found, 0.0) + lumaSearch, readLuma, shouldPreferOutermost = true)
            val offset = (edge ?: if (found < 0) min(0.0, found + 2 * step) else found).coerceIn(-band, 2 * step)
            doubleArrayOf(point[0] + directionX * offset, point[1] + directionY * offset)
        }
        val outline = ArrayList<DoubleArray>(4 * OUTLINE_POINTS_PER_SIDE)
        for (side in 0 until 4) {
            val a = bentCorners[side]
            val b = bentCorners[(side + 1) % 4]
            val length = hypot(b[0] - a[0], b[1] - a[1])
            var normalX = (b[1] - a[1]) / length
            var normalY = -(b[0] - a[0]) / length
            if (normalX * ((a[0] + b[0]) / 2 - centreX) + normalY * ((a[1] + b[1]) / 2 - centreY) < 0) {
                normalX = -normalX
                normalY = -normalY
            }
            val offsets = bendSide(a, b, normalX, normalY, band, step, pass, readLuma, edgeHits, isSnapped) ?: return null
            for (point in 0 until OUTLINE_POINTS_PER_SIDE) {
                val t = point.toDouble() / OUTLINE_POINTS_PER_SIDE
                outline.add(
                    doubleArrayOf(
                        a[0] + (b[0] - a[0]) * t + normalX * offsets[point],
                        a[1] + (b[1] - a[1]) * t + normalY * offsets[point],
                    ),
                )
            }
        }
        if (outline.any { it[0] < 0 || it[1] < 0 || it[0] > uprightWidth || it[1] > uprightHeight } || isSelfIntersecting(outline)) {
            return null
        }
        if (edgeHits[0] < MIN_EDGE_HIT_SHARE * edgeHits[1]) {
            return null
        }
        return outline.toTypedArray()
    }

    private fun bendSide(a: DoubleArray, b: DoubleArray, normalX: Double, normalY: Double, band: Double, step: Double, pass: Pass, readLuma: LumaReader, edgeHits: IntArray, isSnapped: Boolean): DoubleArray? {
        val found = arrayOfNulls<Double>(OUTLINE_POINTS_PER_SIDE)
        for (point in 1 until OUTLINE_POINTS_PER_SIDE) {
            val t = point.toDouble() / OUTLINE_POINTS_PER_SIDE
            found[point] = findMaskBorder(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, normalX, normalY, band, step, pass)
        }
        val foundOffsets = found.filterNotNull().sorted()
        val pointsBetweenCorners = OUTLINE_POINTS_PER_SIDE - 1
        if (foundOffsets.size * 2 <= pointsBetweenCorners) {
            return null
        }
        val maskCell = 2 * step
        val median = foundOffsets[foundOffsets.size / 2]
        // A snapped side already sits on the paper's brightness edge, so a push shared by the whole side is the mask's own
        // error and is removed, all but one cell: snapping lands a little inside a curled side.
        val removedShift = if (isSnapped) median - median.coerceIn(-maskCell, maskCell) else 0.0
        val offsets = DoubleArray(OUTLINE_POINTS_PER_SIDE)
        var clamped = 0
        for (point in 1 until OUTLINE_POINTS_PER_SIDE) {
            val offset = (found[point] ?: median) - removedShift
            if (abs(offset) > band) {
                clamped++
            }
            offsets[point] = offset.coerceIn(-band, band)
        }
        if (clamped * 2 > pointsBetweenCorners) {
            return null
        }
        val lumaSearch = LUMA_SEARCH_CELLS * maskCell
        val isOnPaper = BooleanArray(OUTLINE_POINTS_PER_SIDE)
        for (point in 1 until OUTLINE_POINTS_PER_SIDE) {
            val t = point.toDouble() / OUTLINE_POINTS_PER_SIDE
            val x = a[0] + (b[0] - a[0]) * t
            val y = a[1] + (b[1] - a[1]) * t
            val edge = findLumaEdge(x, y, normalX, normalY, offsets[point] - lumaSearch, offsets[point] + lumaSearch, readLuma)
            edgeHits[1]++
            if (edge != null) {
                offsets[point] = edge.coerceIn(-band, band)
                edgeHits[0]++
            }
            // Paper the mask stopped short of, like a strip below a fold, is still paper-bright. A shadow is darker, so it can't
            // pull the point onto the table. Without that, points next to a corner only move out by a cell: a curled
            // corner's shadow runs along both sides there.
            val paperEdge = findPaperBoundary(x, y, normalX, normalY, band, readLuma)
            if (paperEdge != null && paperEdge > offsets[point]) {
                offsets[point] = paperEdge
                isOnPaper[point] = true
            } else if (min(point, OUTLINE_POINTS_PER_SIDE - point) <= CORNER_POINTS) {
                offsets[point] = min(offsets[point], maskCell)
            }
        }
        // A point far from both neighbors caught something that isn't the paper. Points confirmed over paper stay: next to a
        // corner, a curled flap is only a point or two wide.
        val filtered = offsets.copyOf()
        for (point in 1 until OUTLINE_POINTS_PER_SIDE) {
            if (isOnPaper[point]) {
                continue
            }
            val next = if (point + 1 < OUTLINE_POINTS_PER_SIDE) offsets[point + 1] else 0.0
            val median = getMedianOfThree(offsets[point - 1], offsets[point], next)
            if (abs(offsets[point] - median) > maskCell) {
                filtered[point] = median
            }
        }
        val smooth = filtered.copyOf()
        for (point in 1 until OUTLINE_POINTS_PER_SIDE) {
            val next = if (point + 1 < OUTLINE_POINTS_PER_SIDE) filtered[point + 1] else 0.0
            smooth[point] = (filtered[point - 1] + 2 * filtered[point] + next) / 4
        }
        return smooth
    }

    // The paper spot reaching furthest along the corner's bisector. A walk along the line from the receipt's centre missed
    // the tip on a long receipt, where that line runs steeply.
    private fun findPaperTip(corner: DoubleArray, previous: DoubleArray, next: DoubleArray, radius: Double, readLuma: LumaReader): DoubleArray? {
        val toPreviousLength = hypot(previous[0] - corner[0], previous[1] - corner[1])
        val toNextLength = hypot(next[0] - corner[0], next[1] - corner[1])
        if (toPreviousLength <= 0 || toNextLength <= 0 || radius < 1) {
            return null
        }
        var outwardX = -((previous[0] - corner[0]) / toPreviousLength + (next[0] - corner[0]) / toNextLength)
        var outwardY = -((previous[1] - corner[1]) / toPreviousLength + (next[1] - corner[1]) / toNextLength)
        val outwardLength = hypot(outwardX, outwardY)
        if (outwardLength < 1e-6) {
            return null
        }
        outwardX /= outwardLength
        outwardY /= outwardLength
        fun read(offsetX: Double, offsetY: Double): Int = readLuma.read(corner[0] + offsetX, corner[1] + offsetY)
        val insideSamples = doubleArrayOf(0.3, 0.45, 0.6, 0.75, 0.9).map { read(-outwardX * radius * it, -outwardY * radius * it) }.sorted()
        val paper = insideSamples[insideSamples.size - 2]
        val outsideSamples = doubleArrayOf(1.6, 1.8, 2.0).map { read(outwardX * radius * it, outwardY * radius * it) }.sorted()
        val background = outsideSamples[1]
        if (paper - background < MIN_TIP_CONTRAST) {
            return null
        }
        val threshold = background + TIP_PAPER_SHARE * (paper - background)
        val steps = ceil(radius).toInt()
        var bestX = 0.0
        var bestY = 0.0
        var bestReach = Double.NEGATIVE_INFINITY
        for (row in -steps..steps) {
            for (column in -steps..steps) {
                val offsetX = column.toDouble()
                val offsetY = row.toDouble()
                if (offsetX * offsetX + offsetY * offsetY > radius * radius) {
                    continue
                }
                val reach = offsetX * outwardX + offsetY * outwardY
                if (reach <= bestReach) {
                    continue
                }
                if (read(offsetX, offsetY) < threshold ||
                    read(offsetX - outwardX * TIP_BACKING_PIXELS / 4, offsetY - outwardY * TIP_BACKING_PIXELS / 4) < threshold ||
                    read(offsetX - outwardX * TIP_BACKING_PIXELS / 2, offsetY - outwardY * TIP_BACKING_PIXELS / 2) < threshold ||
                    read(offsetX - outwardX * TIP_BACKING_PIXELS, offsetY - outwardY * TIP_BACKING_PIXELS) < threshold
                ) {
                    continue
                }
                bestX = offsetX
                bestY = offsetY
                bestReach = reach
            }
        }
        if (bestReach == Double.NEGATIVE_INFINITY) {
            return null
        }
        return doubleArrayOf(corner[0] + bestX, corner[1] + bestY)
    }

    private fun findPaperBoundary(x: Double, y: Double, normalX: Double, normalY: Double, limit: Double, readLuma: LumaReader): Double? {
        fun read(distance: Double): Int = readLuma.read(x + normalX * distance, y + normalY * distance)
        val insideSamples = doubleArrayOf(0.5, 0.75, 1.0, 1.25, 1.5).map { read(-limit * it) }.sorted()
        val paper = insideSamples[insideSamples.size - 2]
        val outsideSamples = doubleArrayOf(1.6, 1.8, 2.0).map { read(limit * it) }.sorted()
        val background = outsideSamples[1]
        if (paper - background < MIN_TIP_CONTRAST) {
            return null
        }
        val threshold = background + TIP_PAPER_SHARE * (paper - background)
        var distance = limit
        while (distance >= -limit) {
            if (read(distance) >= threshold &&
                read(distance - TIP_BACKING_PIXELS / 4) >= threshold &&
                read(distance - TIP_BACKING_PIXELS / 2) >= threshold &&
                read(distance - TIP_BACKING_PIXELS) >= threshold
            ) {
                return distance
            }
            distance -= 1.0
        }
        return null
    }

    private fun findLumaEdge(x: Double, y: Double, normalX: Double, normalY: Double, from: Double, to: Double, readLuma: LumaReader, shouldPreferOutermost: Boolean = false): Double? {
        var best: Double? = null
        var bestContrast = MIN_EDGE_CONTRAST
        var outermost: Double? = null
        var outermostContrast = 0.0
        var distance = from
        while (distance <= to) {
            val inside = readLuma.read(x + normalX * (distance - EDGE_PROBE), y + normalY * (distance - EDGE_PROBE))
            val outside = readLuma.read(x + normalX * (distance + EDGE_PROBE), y + normalY * (distance + EDGE_PROBE))
            val contrast = (inside - outside).toDouble()
            if (contrast > bestContrast) {
                bestContrast = contrast
                best = distance
            }
            if (contrast >= MIN_EDGE_CONTRAST) {
                outermost = distance
                outermostContrast = contrast
            }
            distance += 1.0
        }
        if (shouldPreferOutermost && outermost != null && outermostContrast >= OUTERMOST_EDGE_SHARE * bestContrast) {
            return outermost
        }
        return best
    }

    private fun findMaskBorder(x: Double, y: Double, normalX: Double, normalY: Double, band: Double, step: Double, pass: Pass): Double? {
        val stepsPerSide = max(1, ceil(band / step).toInt())
        var nearest: Double? = null
        var previousDistance = 0.0
        var previousValue = 0.0
        for (index in 0..2 * stepsPerSide) {
            val distance = -band + index * band / stepsPerSide
            val value = getMaskLogitAt(x + normalX * distance, y + normalY * distance, pass)
            if (value.isNaN()) {
                return null
            }
            if (index > 0 && previousValue > 0 && value <= 0) {
                val crossing = previousDistance + (distance - previousDistance) * previousValue / (previousValue - value)
                if (nearest == null || abs(crossing) < abs(nearest)) {
                    nearest = crossing
                }
            }
            previousDistance = distance
            previousValue = value
        }
        return nearest
    }

    private fun getMaskLogitAt(x: Double, y: Double, pass: Pass): Double {
        val cellX = ((x - pass.region.x) * pass.scale + pass.offsetX) / HEATMAP_STRIDE - 0.5
        val cellY = ((y - pass.region.y) * pass.scale + pass.offsetY) / HEATMAP_STRIDE - 0.5
        val left = floor(cellX).toInt()
        val top = floor(cellY).toInt()
        if (left < 0 || top < 0 || left + 1 >= HEATMAP_SIZE || top + 1 >= HEATMAP_SIZE) {
            return Double.NaN
        }
        val shareX = cellX - left
        val shareY = cellY - top
        val upperIndex = top * HEATMAP_SIZE + left
        val lowerIndex = upperIndex + HEATMAP_SIZE
        val upper = pass.mask[upperIndex] * (1 - shareX) + pass.mask[upperIndex + 1] * shareX
        val lower = pass.mask[lowerIndex] * (1 - shareX) + pass.mask[lowerIndex + 1] * shareX
        return upper * (1 - shareY) + lower * shareY
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
            // A receipt seen from above is close to a parallelogram, so a missing corner is the sum of its neighbors minus the
            // opposite corner.
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

    // A class, not a lambda: a lambda taking and returning numbers boxes every argument and result, thousands per frame.
    private inner class LumaReader(val width: Int, val height: Int, val rowStride: Int, val rotation: Int, val uprightWidth: Int, val uprightHeight: Int) {
        fun read(x: Double, y: Double): Int = readLumaAt(x, y, width, height, rowStride, rotation, uprightWidth, uprightHeight)
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

        private fun getMedianOfThree(a: Double, b: Double, c: Double): Double = max(min(a, b), min(max(a, b), c))
        private const val MODEL_ASSET_PATH = "docquad/docquadnet256_trained_opset17.ort"
        private const val INPUT_NAME = "input"
        private const val CORNERS_OUTPUT_NAME = "corner_heatmaps"
        private const val MASK_OUTPUT_NAME = "mask_logits"
        private const val INPUT_SIZE = 256

        private const val INPUT_CHANNELS = 3
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

        private const val MAX_CENTRE_SHIFT = 0.5

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

        // Same as the iOS detector and EDGE_POINTS_PER_SIDE in JS.
        private const val OUTLINE_POINTS_PER_SIDE = 24

        private const val LUMA_SEARCH_CELLS = 1.5

        private const val EDGE_PROBE = 2.0

        private const val FRAME_MARGIN = 0.02

        private const val CORNER_POINTS = 3

        private const val MIN_TIP_CONTRAST = 30

        private const val TIP_BACKING_PIXELS = 8.0

        // Halfway between background and paper brightness let a pale streak in a light wooden table pass, and a corner
        // jumped onto it.
        private const val TIP_PAPER_SHARE = 0.75

        private const val OUTERMOST_EDGE_SHARE = 0.5

        private const val MIN_EDGE_HIT_SHARE = 0.7

        private const val BEND_BAND = 0.15

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

        private fun isSelfIntersecting(points: List<DoubleArray>): Boolean {
            val count = points.size
            for (first in 0 until count) {
                for (second in first + 2 until count) {
                    if (first == 0 && second == count - 1) {
                        continue
                    }
                    if (doSegmentsCross(points[first], points[(first + 1) % count], points[second], points[(second + 1) % count])) {
                        return true
                    }
                }
            }
            return false
        }

        private fun doSegmentsCross(a: DoubleArray, b: DoubleArray, c: DoubleArray, d: DoubleArray): Boolean =
            computeTurn(c, d, a) * computeTurn(c, d, b) < 0 && computeTurn(a, b, c) * computeTurn(a, b, d) < 0

        private fun computeTurn(from: DoubleArray, to: DoubleArray, point: DoubleArray): Double =
            (to[0] - from[0]) * (point[1] - from[1]) - (to[1] - from[1]) * (point[0] - from[0])

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
