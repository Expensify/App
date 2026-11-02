import AVFoundation
import Foundation
import NitroModules
import UIKit
import UniformTypeIdentifiers

/** Processes files persisted by the share extension without exposing storage serialization to JS. */
final class HybridShareActionHandler: HybridShareActionHandlerSpec {
    public var memorySize: Int { MemoryLayout<HybridShareActionHandler>.size }

    func processFiles() throws -> Promise<[SharedFile]> {
        Promise.async {
            // Older hybrid hosts have no configuration key and use the production app group.
            let appGroup = Bundle.main.object(forInfoDictionaryKey: "ShareExtensionAppGroup") as? String ?? "group.com.expensify"
            let fileManager = FileManager.default
            guard let container = fileManager.containerURL(forSecurityApplicationGroupIdentifier: appGroup) else {
                throw self.shareError("Shared app group is unavailable")
            }
            let folder = container.appendingPathComponent("sharedFiles", isDirectory: true)
            UserDefaults(suiteName: appGroup)?.removeObject(forKey: "sharedFiles")

            let files: [URL]
            do {
                files = try fileManager.contentsOfDirectory(at: folder, includingPropertiesForKeys: [.isRegularFileKey])
            } catch let error as NSError where error.domain == NSCocoaErrorDomain && error.code == NSFileReadNoSuchFileError {
                return []
            }

            var processedFiles: [SharedFile] = []
            var firstProcessingError: Error?

            for file in files {
                do {
                    processedFiles.append(try self.processFile(file))
                } catch {
                    firstProcessingError = firstProcessingError ?? error
                    NSLog("Failed to process shared file at %@: %@", file.path, error.localizedDescription)
                }
            }

            if processedFiles.isEmpty, let firstProcessingError {
                throw firstProcessingError
            }

            return processedFiles
        }
    }

    private func processFile(_ url: URL) throws -> SharedFile {
        let attributes = try url.resourceValues(forKeys: [.isRegularFileKey])
        guard attributes.isRegularFile == true else {
            throw shareError("Shared attachment is not a regular file")
        }
        let timestamp = String(format: "%.0f", Date().timeIntervalSince1970 * 1000)
        let isText = url.lastPathComponent.contains("text_to_read")
        let mimeType = isText ? "txt" : UTType(filenameExtension: url.pathExtension)?.preferredMIMEType ?? "application/octet-stream"
        let content = isText ? try String(contentsOf: url, encoding: .utf8) : url.absoluteString
        var aspectRatio: Double?

        if mimeType.hasPrefix("image/"), let image = UIImage(contentsOfFile: url.path), image.size.height > 0 {
            aspectRatio = Double(image.size.width / image.size.height)
        } else if mimeType.hasPrefix("video/") {
            let asset = AVURLAsset(url: url)
            if let track = asset.tracks(withMediaType: .video).first {
                let size = track.naturalSize.applying(track.preferredTransform)
                if size.height != 0 {
                    aspectRatio = Double(abs(size.width / size.height))
                }
            }
        }

        return SharedFile(id: "\(timestamp)_\(url.path)", content: content, mimeType: mimeType, processedAt: timestamp, aspectRatio: aspectRatio)
    }

    private func shareError(_ message: String) -> NSError {
        NSError(domain: "ShareActionHandler", code: 1, userInfo: [NSLocalizedDescriptionKey: message])
    }
}
