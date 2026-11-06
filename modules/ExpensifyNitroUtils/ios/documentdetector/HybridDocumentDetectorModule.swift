import CoreVideo
import Foundation
import NitroModules
import Vision

/**
 * Finds the receipt in the scan camera's frames on iOS. Runs Vision's document segmentation on each camera buffer, moves
 * the four corners onto the paper, and bends the shape onto the paper's real edge for the outline drawn in JS.
 */
final class HybridDocumentDetectorModule: HybridDocumentDetectorModuleSpec {
    // Same as the Android detector and EDGE_POINTS_PER_SIDE in JS.
    private static let outlinePointsPerSide = 24

    // Wider than Android's 0.15: Vision's quad keeps to the flat part of a crumpled receipt, and a folded strip reached
    // ~20% of the width past it.
    private static let bendBand = 0.3

    // The full band reached fold highlights past the paper and drew spikes.
    private static let outwardSearchShare = 0.5

    private static let maskBorderValue = 0.5

    private static let lumaSearchCells = 1.5

    private static let edgeProbe = 2.0

    private static let minEdgeContrast = 6.0

    private static let outermostEdgeShare = 0.5

    private static let frameMargin = 0.02

    private static let minEdgeHitShare = 0.7

    private static let sideSnapPoints = 9

    private static let sideSnapInset = 0.15

    private static let minSideSnapHits = 5

    private static let tipSearchShare = 0.15

    private static let minTipContrast = 30.0

    private static let tipBackingPixels = 8.0

    // Halfway between background and paper brightness let a pale streak in a light wooden table pass, and a corner jumped
    // onto it.
    private static let tipPaperShare = 0.75

    private let sequenceHandler = VNSequenceRequestHandler()
    private let request = VNDetectDocumentSegmentationRequest()

    public var memorySize: Int { MemoryLayout<HybridDocumentDetectorModule>.size }

    var isSupported: Bool { true }

    func detect(pixelBuffer: UInt64) throws -> DetectedDocument? {
        guard let rawPointer = UnsafeRawPointer(bitPattern: UInt(pixelBuffer)) else {
            return nil
        }
        // VisionCamera NativeBuffer pointers carry a +1 retain that the JS caller releases, so the buffer is only borrowed here.
        let buffer = Unmanaged<CVPixelBuffer>.fromOpaque(rawPointer).takeUnretainedValue()

        // AVFoundation's device-point conversion expects the raw buffer's (sensor) orientation, which `.up` keeps.
        try sequenceHandler.perform([request], on: buffer, orientation: .up)
        guard let document = request.results?.first else {
            return nil
        }

        // Vision's normalized origin is bottom-left; flip y so corners match the buffer's top-left origin.
        let corners = [document.topLeft, document.topRight, document.bottomRight, document.bottomLeft].map {
            CGPoint(x: $0.x, y: 1 - $0.y)
        }
        let frameWidth = Double(CVPixelBufferGetWidth(buffer))
        let frameHeight = Double(CVPixelBufferGetHeight(buffer))
        let refined = document.globalSegmentationMask.flatMap { maskObservation in
            MaskReader.read(maskObservation.pixelBuffer) { mask in
                LumaReader.read(buffer) { luma -> (corners: [CGPoint], outline: [CGPoint]?)? in
                    let snapped = Self.snapCorners(corners: corners, mask: mask, luma: luma, frameWidth: frameWidth, frameHeight: frameHeight)
                    return (snapped, Self.bendOutline(corners: snapped, mask: mask, luma: luma, frameWidth: frameWidth, frameHeight: frameHeight))
                }
            }
        }
        return DetectedDocument(
            corners: (refined?.corners ?? corners).map { DocumentCorner(x: Double($0.x), y: Double($0.y)) },
            confidence: Double(document.confidence),
            outline: refined?.outline?.map { DocumentCorner(x: Double($0.x), y: Double($0.y)) }
        )
    }

    func detectYuv(frame: YuvFrame) throws -> DetectedDocument? {
        return nil
    }

    // Vision's quad keeps to the flat part of a crumpled receipt, so its sides run inside the paper. Each side is moved onto
    // the paper's edge and the corners are taken where those lines meet.
    private static func snapCorners(corners: [CGPoint], mask: MaskReader, luma: LumaReader, frameWidth: Double, frameHeight: Double) -> [CGPoint] {
        let pixelCorners = corners.map { CGPoint(x: Double($0.x) * frameWidth, y: Double($0.y) * frameHeight) }
        let shorterSide = (0..<4).map { getDistance(pixelCorners[$0], pixelCorners[($0 + 1) % 4]) }.min() ?? 0
        guard shorterSide > 0 else {
            return corners
        }
        let band = bendBand * shorterSide
        let step = max(max(frameWidth / Double(mask.width), frameHeight / Double(mask.height)) / 2, 0.5)
        let lumaSearch = lumaSearchCells * 2 * step
        let centreX = pixelCorners.map { Double($0.x) }.reduce(0, +) / 4
        let centreY = pixelCorners.map { Double($0.y) }.reduce(0, +) / 4

        var lines: [(start: CGPoint, end: CGPoint)] = []
        for side in 0..<4 {
            let a = pixelCorners[side]
            let b = pixelCorners[(side + 1) % 4]
            let length = getDistance(a, b)
            var normalX = Double(b.y - a.y) / length
            var normalY = -Double(b.x - a.x) / length
            if normalX * (Double(a.x + b.x) / 2 - centreX) + normalY * (Double(a.y + b.y) / 2 - centreY) < 0 {
                normalX = -normalX
                normalY = -normalY
            }
            var firstHalf: [Double] = []
            var secondHalf: [Double] = []
            for point in 0..<sideSnapPoints {
                let t = sideSnapInset + (1 - 2 * sideSnapInset) * Double(point) / Double(sideSnapPoints - 1)
                let x = Double(a.x) + Double(b.x - a.x) * t
                let y = Double(a.y) + Double(b.y - a.y) * t
                guard let found = findMaskBorder(x: x, y: y, normalX: normalX, normalY: normalY, band: band, step: step, valueAt: { sampleX, sampleY in
                    mask.value(x: sampleX / frameWidth, y: sampleY / frameHeight).map { $0 - maskBorderValue }
                }) else {
                    continue
                }
                guard let edge = findLumaEdge(x: x, y: y, normalX: normalX, normalY: normalY, from: found - lumaSearch, to: found + lumaSearch, luma: luma) else {
                    continue
                }
                let offset = min(max(edge, -band * outwardSearchShare), band * outwardSearchShare)
                if t < 0.5 {
                    firstHalf.append(offset)
                } else {
                    secondHalf.append(offset)
                }
            }
            guard firstHalf.count + secondHalf.count >= minSideSnapHits, !firstHalf.isEmpty, !secondHalf.isEmpty else {
                lines.append((a, b))
                continue
            }
            let firstOffset = firstHalf.sorted()[firstHalf.count / 2]
            let secondOffset = secondHalf.sorted()[secondHalf.count / 2]
            let startOffset = firstOffset - (secondOffset - firstOffset) / 2
            let endOffset = secondOffset + (secondOffset - firstOffset) / 2
            lines.append((
                CGPoint(x: Double(a.x) + normalX * startOffset, y: Double(a.y) + normalY * startOffset),
                CGPoint(x: Double(b.x) + normalX * endOffset, y: Double(b.y) + normalY * endOffset)
            ))
        }

        return (0..<4).map { corner in
            let original = pixelCorners[corner]
            let previous = lines[(corner + 3) % 4]
            let next = lines[corner]
            guard let meeting = intersectLines(previous.start, previous.end, next.start, next.end), getDistance(meeting, original) <= band else {
                return corners[corner]
            }
            return CGPoint(x: Double(meeting.x) / frameWidth, y: Double(meeting.y) / frameHeight)
        }
    }

    private static func intersectLines(_ a: CGPoint, _ b: CGPoint, _ c: CGPoint, _ d: CGPoint) -> CGPoint? {
        let firstX = Double(b.x - a.x)
        let firstY = Double(b.y - a.y)
        let secondX = Double(d.x - c.x)
        let secondY = Double(d.y - c.y)
        let denominator = firstX * secondY - firstY * secondX
        guard abs(denominator) > 1e-6 * hypot(firstX, firstY) * hypot(secondX, secondY) else {
            return nil
        }
        let share = (Double(c.x - a.x) * secondY - Double(c.y - a.y) * secondX) / denominator
        return CGPoint(x: Double(a.x) + firstX * share, y: Double(a.y) + firstY * share)
    }

    private static func bendOutline(corners: [CGPoint], mask: MaskReader, luma: LumaReader, frameWidth: Double, frameHeight: Double) -> [CGPoint]? {
        let pixelCorners = corners.map { CGPoint(x: Double($0.x) * frameWidth, y: Double($0.y) * frameHeight) }
        let shorterSide = (0..<4).map { getDistance(pixelCorners[$0], pixelCorners[($0 + 1) % 4]) }.min() ?? 0
        guard shorterSide > 0 else {
            return nil
        }
        let margin = frameMargin * min(frameWidth, frameHeight)
        guard pixelCorners.allSatisfy({ Double($0.x) >= margin && Double($0.y) >= margin && Double($0.x) <= frameWidth - margin && Double($0.y) <= frameHeight - margin }) else {
            return nil
        }
        let band = bendBand * shorterSide
        let step = max(max(frameWidth / Double(mask.width), frameHeight / Double(mask.height)) / 2, 0.5)
        let maskCell = 2 * step
        let lumaSearch = lumaSearchCells * maskCell
        var edgeHits = 0
        var edgeLooks = 0
        let centreX = pixelCorners.map { Double($0.x) }.reduce(0, +) / 4
        let centreY = pixelCorners.map { Double($0.y) }.reduce(0, +) / 4

        let bentCorners = pixelCorners.indices.map { index -> CGPoint in
            let corner = pixelCorners[index]
            // At its tip the paper is only a sliver, too thin for a clear brightness step, so the step search below stops
            // short of it and the corner is drawn rounded.
            if let tip = findPaperTip(
                corner: corner,
                previous: pixelCorners[(index + 3) % 4],
                next: pixelCorners[(index + 1) % 4],
                radius: min(band, tipSearchShare * shorterSide),
                luma: luma
            ) {
                return tip
            }
            let diagonal = hypot(Double(corner.x) - centreX, Double(corner.y) - centreY)
            let directionX = (Double(corner.x) - centreX) / diagonal
            let directionY = (Double(corner.y) - centreY) / diagonal
            let found = findMaskBorder(x: Double(corner.x), y: Double(corner.y), normalX: directionX, normalY: directionY, band: band, step: step) { sampleX, sampleY in
                mask.value(x: sampleX / frameWidth, y: sampleY / frameHeight).map { $0 - maskBorderValue }
            } ?? 0
            let reach = max(found, 0) + maskCell
            let edge = findLumaEdge(x: Double(corner.x), y: Double(corner.y), normalX: directionX, normalY: directionY, from: -band, to: reach, luma: luma, shouldPreferOutermost: true)
            let offset = min(max(edge ?? found, -band), reach)
            return CGPoint(x: Double(corner.x) + directionX * offset, y: Double(corner.y) + directionY * offset)
        }
        var outline: [CGPoint] = []
        outline.reserveCapacity(4 * outlinePointsPerSide)
        for side in 0..<4 {
            let a = bentCorners[side]
            let b = bentCorners[(side + 1) % 4]
            let length = getDistance(a, b)
            var normalX = Double(b.y - a.y) / length
            var normalY = -Double(b.x - a.x) / length
            if normalX * (Double(a.x + b.x) / 2 - centreX) + normalY * (Double(a.y + b.y) / 2 - centreY) < 0 {
                normalX = -normalX
                normalY = -normalY
            }
            guard var offsets = bendSide(a: a, b: b, normalX: normalX, normalY: normalY, band: band, step: step, mask: mask, frameWidth: frameWidth, frameHeight: frameHeight) else {
                return nil
            }
            var isOnPaper = [Bool](repeating: false, count: outlinePointsPerSide)
            for point in 1..<outlinePointsPerSide {
                let t = Double(point) / Double(outlinePointsPerSide)
                let x = Double(a.x) + Double(b.x - a.x) * t
                let y = Double(a.y) + Double(b.y - a.y) * t
                edgeLooks += 1
                // Vision's mask often stops on the flat part of a crumpled receipt, so the search reaches past it. The strongest
                // step wins, not the outermost: on the side the receipt casts its shadow, the outermost lay in the shadow.
                let reach = max(offsets[point] + lumaSearch, band * outwardSearchShare)
                if let edge = findLumaEdge(x: x, y: y, normalX: normalX, normalY: normalY, from: offsets[point] - lumaSearch, to: reach, luma: luma) {
                    offsets[point] = min(max(edge, -band), band)
                    edgeHits += 1
                }
                // Paper the mask stopped short of, like a strip below a fold, is still paper-bright. A shadow is darker, so it
                // can't pull the point onto the table.
                if let paperEdge = findPaperBoundary(x: x, y: y, normalX: normalX, normalY: normalY, limit: band * outwardSearchShare, luma: luma), paperEdge > offsets[point] {
                    offsets[point] = paperEdge
                    isOnPaper[point] = true
                }
            }
            // A point far from the median of the five around it caught something that isn't the paper, like a fold's glint
            // past the edge. Points confirmed over paper stay: next to a corner, a curled flap is only a point or two wide.
            let refined = offsets
            for point in 1..<outlinePointsPerSide where !isOnPaper[point] {
                var window: [Double] = []
                for neighbor in (point - 2)...(point + 2) {
                    window.append(neighbor <= 0 || neighbor >= outlinePointsPerSide ? 0 : refined[neighbor])
                }
                let neighborMedian = window.sorted()[2]
                if abs(refined[point] - neighborMedian) > maskCell {
                    offsets[point] = neighborMedian
                }
            }
            let filtered = offsets
            for point in 1..<outlinePointsPerSide {
                let next = point + 1 < outlinePointsPerSide ? filtered[point + 1] : 0
                offsets[point] = (filtered[point - 1] + 2 * filtered[point] + next) / 4
            }
            for point in 0..<outlinePointsPerSide {
                let t = Double(point) / Double(outlinePointsPerSide)
                outline.append(CGPoint(
                    x: Double(a.x) + Double(b.x - a.x) * t + normalX * offsets[point],
                    y: Double(a.y) + Double(b.y - a.y) * t + normalY * offsets[point]
                ))
            }
        }
        let isInsideFrame = outline.allSatisfy { $0.x >= 0 && $0.y >= 0 && Double($0.x) <= frameWidth && Double($0.y) <= frameHeight }
        guard isInsideFrame, !isSelfIntersecting(outline) else {
            return nil
        }
        guard Double(edgeHits) >= minEdgeHitShare * Double(edgeLooks) else {
            return nil
        }
        return outline.map { CGPoint(x: Double($0.x) / frameWidth, y: Double($0.y) / frameHeight) }
    }

    private static func bendSide(
        a: CGPoint,
        b: CGPoint,
        normalX: Double,
        normalY: Double,
        band: Double,
        step: Double,
        mask: MaskReader,
        frameWidth: Double,
        frameHeight: Double
    ) -> [Double]? {
        let straight = [Double](repeating: 0, count: outlinePointsPerSide)
        var found = [Double?](repeating: nil, count: outlinePointsPerSide)
        for point in 1..<outlinePointsPerSide {
            let t = Double(point) / Double(outlinePointsPerSide)
            let x = Double(a.x) + Double(b.x - a.x) * t
            let y = Double(a.y) + Double(b.y - a.y) * t
            found[point] = findMaskBorder(x: x, y: y, normalX: normalX, normalY: normalY, band: band, step: step) { sampleX, sampleY in
                mask.value(x: sampleX / frameWidth, y: sampleY / frameHeight).map { $0 - maskBorderValue }
            }
        }
        let foundOffsets = found.compactMap { $0 }.sorted()
        let pointsBetweenCorners = outlinePointsPerSide - 1
        guard foundOffsets.count * 2 > pointsBetweenCorners else {
            return nil
        }
        // Unlike Android, the whole side keeps its push: these sides were already straightened onto the paper's edge, so a
        // push shared by the whole side is the paper, not the mask's own error.
        let median = foundOffsets[foundOffsets.count / 2]
        var offsets = straight
        for point in 1..<outlinePointsPerSide {
            offsets[point] = found[point] ?? median
        }
        return offsets
    }

    private static func findMaskBorder(
        x: Double,
        y: Double,
        normalX: Double,
        normalY: Double,
        band: Double,
        step: Double,
        valueAt: (Double, Double) -> Double?
    ) -> Double? {
        let stepsPerSide = max(1, Int((band / step).rounded(.up)))
        var nearest: Double?
        var previousDistance = 0.0
        var previousValue = 0.0
        for index in 0...(2 * stepsPerSide) {
            let distance = -band + Double(index) * band / Double(stepsPerSide)
            guard let value = valueAt(x + normalX * distance, y + normalY * distance) else {
                return nil
            }
            if index > 0 && previousValue > 0 && value <= 0 {
                let crossing = previousDistance + (distance - previousDistance) * previousValue / (previousValue - value)
                if nearest.map({ abs(crossing) < abs($0) }) ?? true {
                    nearest = crossing
                }
            }
            previousDistance = distance
            previousValue = value
        }
        return nearest
    }

    private static func findLumaEdge(
        x: Double,
        y: Double,
        normalX: Double,
        normalY: Double,
        from: Double,
        to: Double,
        luma: LumaReader,
        shouldPreferOutermost: Bool = false
    ) -> Double? {
        var best: Double?
        var bestContrast = minEdgeContrast
        var outermost: Double?
        var outermostContrast = 0.0
        var distance = from
        while distance <= to {
            let inside = luma.value(x: x + normalX * (distance - edgeProbe), y: y + normalY * (distance - edgeProbe))
            let outside = luma.value(x: x + normalX * (distance + edgeProbe), y: y + normalY * (distance + edgeProbe))
            let contrast = inside - outside
            if contrast > bestContrast {
                bestContrast = contrast
                best = distance
            }
            if contrast >= minEdgeContrast {
                outermost = distance
                outermostContrast = contrast
            }
            distance += 1
        }
        if shouldPreferOutermost, let outermost, outermostContrast >= outermostEdgeShare * bestContrast {
            return outermost
        }
        return best
    }

    // The paper spot reaching furthest along the corner's bisector. A walk along the line from the receipt's centre missed
    // the tip on a long receipt, where that line runs steeply.
    private static func findPaperTip(corner: CGPoint, previous: CGPoint, next: CGPoint, radius: Double, luma: LumaReader) -> CGPoint? {
        let toPreviousLength = getDistance(corner, previous)
        let toNextLength = getDistance(corner, next)
        guard toPreviousLength > 0, toNextLength > 0, radius >= 1 else {
            return nil
        }
        var outwardX = -(Double(previous.x - corner.x) / toPreviousLength + Double(next.x - corner.x) / toNextLength)
        var outwardY = -(Double(previous.y - corner.y) / toPreviousLength + Double(next.y - corner.y) / toNextLength)
        let outwardLength = hypot(outwardX, outwardY)
        guard outwardLength > 1e-6 else {
            return nil
        }
        outwardX /= outwardLength
        outwardY /= outwardLength
        let x = Double(corner.x)
        let y = Double(corner.y)
        let read = { (offsetX: Double, offsetY: Double) in luma.value(x: x + offsetX, y: y + offsetY) }
        let insideSamples = [0.3, 0.45, 0.6, 0.75, 0.9].map { read(-outwardX * radius * $0, -outwardY * radius * $0) }.sorted()
        let paper = insideSamples[insideSamples.count - 2]
        let outsideSamples = [1.6, 1.8, 2.0].map { read(outwardX * radius * $0, outwardY * radius * $0) }.sorted()
        let background = outsideSamples[1]
        guard paper - background >= minTipContrast else {
            return nil
        }
        let threshold = background + tipPaperShare * (paper - background)
        let steps = Int(radius.rounded(.up))
        var best: (x: Double, y: Double, reach: Double)?
        for row in -steps...steps {
            for column in -steps...steps {
                let offsetX = Double(column)
                let offsetY = Double(row)
                guard offsetX * offsetX + offsetY * offsetY <= radius * radius else {
                    continue
                }
                let reach = offsetX * outwardX + offsetY * outwardY
                if let best, reach <= best.reach {
                    continue
                }
                guard read(offsetX, offsetY) >= threshold,
                      read(offsetX - outwardX * tipBackingPixels / 4, offsetY - outwardY * tipBackingPixels / 4) >= threshold,
                      read(offsetX - outwardX * tipBackingPixels / 2, offsetY - outwardY * tipBackingPixels / 2) >= threshold,
                      read(offsetX - outwardX * tipBackingPixels, offsetY - outwardY * tipBackingPixels) >= threshold
                else {
                    continue
                }
                best = (offsetX, offsetY, reach)
            }
        }
        return best.map { CGPoint(x: x + $0.x, y: y + $0.y) }
    }

    private static func findPaperBoundary(x: Double, y: Double, normalX: Double, normalY: Double, limit: Double, luma: LumaReader) -> Double? {
        let read = { (distance: Double) in luma.value(x: x + normalX * distance, y: y + normalY * distance) }
        let insideSamples = [0.5, 0.75, 1.0, 1.25, 1.5].map { read(-limit * $0) }.sorted()
        let paper = insideSamples[insideSamples.count - 2]
        let outsideSamples = [1.6, 1.8, 2.0].map { read(limit * $0) }.sorted()
        let background = outsideSamples[1]
        guard paper - background >= minTipContrast else {
            return nil
        }
        let threshold = background + tipPaperShare * (paper - background)
        var distance = limit
        while distance >= -limit {
            if read(distance) >= threshold, read(distance - tipBackingPixels / 4) >= threshold, read(distance - tipBackingPixels / 2) >= threshold, read(distance - tipBackingPixels) >= threshold {
                return distance
            }
            distance -= 1
        }
        return nil
    }

    private static func getDistance(_ a: CGPoint, _ b: CGPoint) -> Double {
        return hypot(Double(b.x - a.x), Double(b.y - a.y))
    }

    private static func isSelfIntersecting(_ points: [CGPoint]) -> Bool {
        let count = points.count
        for first in 0..<count {
            for second in (first + 2)..<max(first + 2, count) {
                if first == 0 && second == count - 1 {
                    continue
                }
                if doSegmentsCross(points[first], points[(first + 1) % count], points[second], points[(second + 1) % count]) {
                    return true
                }
            }
        }
        return false
    }

    private static func doSegmentsCross(_ a: CGPoint, _ b: CGPoint, _ c: CGPoint, _ d: CGPoint) -> Bool {
        return computeTurn(c, d, a) * computeTurn(c, d, b) < 0 && computeTurn(a, b, c) * computeTurn(a, b, d) < 0
    }

    private static func computeTurn(_ from: CGPoint, _ to: CGPoint, _ point: CGPoint) -> Double {
        return Double((to.x - from.x) * (point.y - from.y) - (to.y - from.y) * (point.x - from.x))
    }
}

/**
 * Reads Vision's document mask in place. Its formats aren't documented, so only the one-channel 8-bit and 32-bit float
 * buffers are read; any other format gives no outline and the four straight lines are drawn.
 */
private struct MaskReader {
    let width: Int
    let height: Int
    private let base: UnsafeRawPointer
    private let bytesPerRow: Int
    private let isFloat: Bool

    static func read<Result>(_ pixelBuffer: CVPixelBuffer, _ body: (MaskReader) -> Result?) -> Result? {
        let format = CVPixelBufferGetPixelFormatType(pixelBuffer)
        guard format == kCVPixelFormatType_OneComponent8 || format == kCVPixelFormatType_OneComponent32Float else {
            return nil
        }
        CVPixelBufferLockBaseAddress(pixelBuffer, .readOnly)
        defer {
            CVPixelBufferUnlockBaseAddress(pixelBuffer, .readOnly)
        }
        guard let base = CVPixelBufferGetBaseAddress(pixelBuffer) else {
            return nil
        }
        let reader = MaskReader(
            width: CVPixelBufferGetWidth(pixelBuffer),
            height: CVPixelBufferGetHeight(pixelBuffer),
            base: UnsafeRawPointer(base),
            bytesPerRow: CVPixelBufferGetBytesPerRow(pixelBuffer),
            isFloat: format == kCVPixelFormatType_OneComponent32Float
        )
        return body(reader)
    }

    private func pixel(column: Int, row: Int) -> Double {
        let rowStart = base.advanced(by: row * bytesPerRow)
        if isFloat {
            return Double(rowStart.load(fromByteOffset: column * MemoryLayout<Float32>.size, as: Float32.self))
        }
        return Double(rowStart.load(fromByteOffset: column, as: UInt8.self)) / 255
    }

    func value(x: Double, y: Double) -> Double? {
        let maskX = x * Double(width) - 0.5
        let maskY = y * Double(height) - 0.5
        let left = Int(maskX.rounded(.down))
        let top = Int(maskY.rounded(.down))
        guard left >= 0, top >= 0, left + 1 < width, top + 1 < height else {
            return nil
        }
        let shareX = maskX - Double(left)
        let shareY = maskY - Double(top)
        let upper = pixel(column: left, row: top) * (1 - shareX) + pixel(column: left + 1, row: top) * shareX
        let lower = pixel(column: left, row: top + 1) * (1 - shareX) + pixel(column: left + 1, row: top + 1) * shareX
        return upper * (1 - shareY) + lower * shareY
    }
}

private struct LumaReader {
    private let width: Int
    private let height: Int
    private let base: UnsafeRawPointer
    private let bytesPerRow: Int
    private let isBGRA: Bool

    private static let redLumaWeight = 0.299
    private static let greenLumaWeight = 0.587
    private static let blueLumaWeight = 0.114

    static func read<Result>(_ pixelBuffer: CVPixelBuffer, _ body: (LumaReader) -> Result?) -> Result? {
        let format = CVPixelBufferGetPixelFormatType(pixelBuffer)
        let isBiPlanar = format == kCVPixelFormatType_420YpCbCr8BiPlanarFullRange || format == kCVPixelFormatType_420YpCbCr8BiPlanarVideoRange
        let isBGRA = format == kCVPixelFormatType_32BGRA
        guard isBiPlanar || isBGRA else {
            return nil
        }
        CVPixelBufferLockBaseAddress(pixelBuffer, .readOnly)
        defer {
            CVPixelBufferUnlockBaseAddress(pixelBuffer, .readOnly)
        }
        let baseAddress = isBiPlanar ? CVPixelBufferGetBaseAddressOfPlane(pixelBuffer, 0) : CVPixelBufferGetBaseAddress(pixelBuffer)
        guard let baseAddress else {
            return nil
        }
        let reader = LumaReader(
            width: isBiPlanar ? CVPixelBufferGetWidthOfPlane(pixelBuffer, 0) : CVPixelBufferGetWidth(pixelBuffer),
            height: isBiPlanar ? CVPixelBufferGetHeightOfPlane(pixelBuffer, 0) : CVPixelBufferGetHeight(pixelBuffer),
            base: UnsafeRawPointer(baseAddress),
            bytesPerRow: isBiPlanar ? CVPixelBufferGetBytesPerRowOfPlane(pixelBuffer, 0) : CVPixelBufferGetBytesPerRow(pixelBuffer),
            isBGRA: isBGRA
        )
        return body(reader)
    }

    func value(x: Double, y: Double) -> Double {
        let column = min(max(Int(x), 0), width - 1)
        let row = min(max(Int(y), 0), height - 1)
        let rowStart = base.advanced(by: row * bytesPerRow)
        if isBGRA {
            let blue = Double(rowStart.load(fromByteOffset: column * 4, as: UInt8.self))
            let green = Double(rowStart.load(fromByteOffset: column * 4 + 1, as: UInt8.self))
            let red = Double(rowStart.load(fromByteOffset: column * 4 + 2, as: UInt8.self))
            return Self.redLumaWeight * red + Self.greenLumaWeight * green + Self.blueLumaWeight * blue
        }
        return Double(rowStart.load(fromByteOffset: column, as: UInt8.self))
    }
}
