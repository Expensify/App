import CoreVideo
import Foundation
import NitroModules
import Vision

// VisionCamera NativeBuffer pointers carry a +1 retain that the JS caller releases, so the buffer is only borrowed here.
final class HybridDocumentDetectorModule: HybridDocumentDetectorModuleSpec {
    private let sequenceHandler = VNSequenceRequestHandler()
    private let request = VNDetectDocumentSegmentationRequest()

    public var memorySize: Int { MemoryLayout<HybridDocumentDetectorModule>.size }

    var isSupported: Bool { true }

    func detect(pixelBuffer: UInt64) throws -> DetectedDocument? {
        guard let rawPointer = UnsafeRawPointer(bitPattern: UInt(pixelBuffer)) else {
            return nil
        }
        let buffer = Unmanaged<CVPixelBuffer>.fromOpaque(rawPointer).takeUnretainedValue()

        // AVFoundation's device-point conversion expects the raw buffer's (sensor) orientation, which `.up` keeps.
        try sequenceHandler.perform([request], on: buffer, orientation: .up)
        guard let document = request.results?.first else {
            return nil
        }

        // Vision's normalized origin is bottom-left; flip y so corners match the buffer's top-left origin.
        let corners = [document.topLeft, document.topRight, document.bottomRight, document.bottomLeft].map {
            DocumentCorner(x: Double($0.x), y: Double(1 - $0.y))
        }
        return DetectedDocument(corners: corners, confidence: Double(document.confidence))
    }

    func detectYuv(frame: YuvFrame) throws -> DetectedDocument? {
        return nil
    }
}
