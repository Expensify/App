import AVFoundation
import Foundation
import NitroModules
import UIKit
import UniformTypeIdentifiers

/// Reads what the share extension saved to the app group container. The standalone app and HybridApp share this implementation.
final class HybridShareActionHandler: HybridShareActionHandlerSpec {
    /// Each host's Info.plist names the app group that its share extension writes to.
    private static let appGroupInfoPlistKey = "ShareExtensionAppGroup"

    /// Used when the host's Info.plist names no app group. HybridApp's share extension writes to this group.
    private static let defaultAppGroup = "group.com.expensify"

    private static let sharedFilesDirectoryName = "sharedFiles"

    /// The share extension saves shared text and URLs to a file with this name.
    private static let sharedTextFileName = "text_to_read.txt"

    private static let sharedTextMimeType = "txt"
    private static let defaultMimeType = "application/octet-stream"
    private static let defaultAspectRatio = 1.0

    public var memorySize: Int { MemoryLayout<HybridShareActionHandler>.size }

    func processFiles() throws -> Promise<[SharedFile]> {
        Promise.async {
            var sharedFiles: [SharedFile] = []
            var firstError: Error?
            for fileURL in try Self.getSharedFileURLs() {
                do {
                    sharedFiles.append(try await Self.makeSharedFile(at: fileURL))
                } catch {
                    NSLog("[ShareActionHandler] Skipping shared file %@: %@", fileURL.path, String(describing: error))
                    firstError = firstError ?? error
                }
            }
            if sharedFiles.isEmpty, let firstError {
                throw firstError
            }
            return sharedFiles
        }
    }

    private static func getSharedFileURLs() throws -> [URL] {
        let appGroup = Bundle.main.object(forInfoDictionaryKey: appGroupInfoPlistKey) as? String ?? defaultAppGroup
        guard let containerURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroup) else {
            throw RuntimeError.error(withMessage: "The app group \(appGroup) is not available")
        }
        let directoryURL = containerURL.appendingPathComponent(sharedFilesDirectoryName, isDirectory: true)

        // Nothing is skipped because shared images sit in a directory of their own and shared file names can start with a dot.
        guard let enumerator = FileManager.default.enumerator(at: directoryURL, includingPropertiesForKeys: [.isRegularFileKey], options: []) else {
            return []
        }
        return enumerator.compactMap { $0 as? URL }.filter { (try? $0.resourceValues(forKeys: [.isRegularFileKey]).isRegularFile) == true }
    }

    private static func makeSharedFile(at fileURL: URL) async throws -> SharedFile {
        let processedAt = String(format: "%.0f", Date().timeIntervalSince1970 * 1000)
        let id = "\(processedAt)_\(fileURL.path)"

        if fileURL.lastPathComponent == sharedTextFileName {
            let text = try String(contentsOf: fileURL, encoding: .utf8)
            return SharedFile(id: id, content: text, mimeType: sharedTextMimeType, processedAt: processedAt, aspectRatio: defaultAspectRatio)
        }

        let mimeType = UTType(filenameExtension: fileURL.pathExtension)?.preferredMIMEType ?? defaultMimeType
        let aspectRatio = await getAspectRatio(of: fileURL, mimeType: mimeType)
        return SharedFile(id: id, content: fileURL.absoluteString, mimeType: mimeType, processedAt: processedAt, aspectRatio: aspectRatio)
    }

    private static func getAspectRatio(of fileURL: URL, mimeType: String) async -> Double {
        let size: CGSize?
        if mimeType.hasPrefix("image/") {
            size = UIImage(contentsOfFile: fileURL.path)?.size
        } else if mimeType.hasPrefix("video/") {
            size = try? await getVideoSize(at: fileURL)
        } else {
            size = nil
        }

        guard let size, size.width > 0, size.height > 0 else {
            return defaultAspectRatio
        }
        return Double(size.width / size.height)
    }

    private static func getVideoSize(at fileURL: URL) async throws -> CGSize? {
        guard let track = try await AVURLAsset(url: fileURL).loadTracks(withMediaType: .video).first else {
            return nil
        }
        let (naturalSize, preferredTransform) = try await track.load(.naturalSize, .preferredTransform)

        // Videos recorded in portrait are stored in landscape with a transform that rotates them, and the rotation can make either side negative.
        let displaySize = naturalSize.applying(preferredTransform)
        return CGSize(width: abs(displaySize.width), height: abs(displaySize.height))
    }
}
