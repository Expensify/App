import Intents
import MobileCoreServices
import Social
import UIKit
import UniformTypeIdentifiers
import os
class ShareViewController: UIViewController {
    let APP_GROUP_ID = "group.com.expensify.new"
    let FILES_DIRECTORY_NAME = "sharedFiles"
    enum FileSaveError: String {
        case CouldNotLoad
        case URLError
        case GroupSharedFolderNotFound
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        if let content = extensionContext!.inputItems[0] as? NSExtensionItem {
            saveFileToAppGroup(content: content) {
                (error) in
                guard error == nil else {
                    os_log("Sharing error: \(error!.rawValue)")
                    return
                }
            }
            self.openMainApp()
        }
    }

    private func saveFileToFolder(folder: URL, filename: String, fileData: NSData) -> URL? {
        let filePath = folder.appendingPathComponent(filename)
        do {
            try fileData.write(to: filePath, options: .completeFileProtection)
            return filePath
        }
        catch {
            os_log("Unexpected saveFileToFolder error: \(error).")
            return nil
        }
    }

    private func saveFileToAppGroup(
        content: NSExtensionItem, completion: @escaping (FileSaveError?) -> Void)
    {
        guard
        let groupURL = FileManager.default.containerURL(
            forSecurityApplicationGroupIdentifier: self.APP_GROUP_ID)
        else {
            completion(.GroupSharedFolderNotFound)
            return
        }
        let sharedFileFolder = groupURL.appendingPathComponent(FILES_DIRECTORY_NAME, isDirectory: true)
        setupSharedFolder(folder: sharedFileFolder)
        guard let attachments = content.attachments else {
            completion(.CouldNotLoad)
            return
        }
        processAttachments(attachments, in: sharedFileFolder, completion: completion)
    }

    private func setupSharedFolder(folder: URL) {
        do {
            try FileManager.default.createDirectory(atPath: folder.path, withIntermediateDirectories: true, attributes: nil)
        }
        catch {
            os_log("Failed to create folder: \(folder.path), error: \(error)")
            return
        }
        do {
            let filePaths = try FileManager.default.contentsOfDirectory(atPath: folder.path)
            for filePath in filePaths {
                try FileManager.default.removeItem(atPath: folder.appendingPathComponent(filePath).path)
            }
        }
        catch {
            os_log("Could not clear temp folder: \(error)")
        }
    }

    private func processAttachments(_ attachments: [NSItemProvider], in folder: URL, completion: @escaping (FileSaveError?) -> Void) {
        let group = DispatchGroup()
        for attachment in attachments {
            group.enter()
            loadData(for: attachment, in: folder, group: group) {
                error in
                group.leave()
                if let error = error {
                    completion(error)
                }
            }
        }
    }

    private func loadData(for attachment: NSItemProvider, in folder: URL, group: DispatchGroup, completion: @escaping (FileSaveError?) -> Void) {
        let isURL = attachment.hasItemConformingToTypeIdentifier("public.url") && !attachment.hasItemConformingToTypeIdentifier("public.file-url")
        let typeIdentifier = isURL ? (kUTTypeURL as String) : (kUTTypeData as String)
        attachment.loadItem(forTypeIdentifier: typeIdentifier, options: nil) {
            (data, error) in
            DispatchQueue.main.async {
                guard error == nil else {
                    os_log("Sharing error: \(error!)")
                    completion(.CouldNotLoad)
                    return
                }
                if isURL, let url = data as? URL {
                    self.handleURL(url, folder: folder, completion: completion)
                }
                else {
                    self.handleData(data, folder: folder, completion: completion)
                }
            }
        }
    }

    private func handleURL(_ url: URL, folder: URL, completion: @escaping (FileSaveError?) -> Void) {
        let filename = "text_to_read.txt"
        if let fileData = url.absoluteString.data(using: .utf8) as NSData? {
            if let fileFinalPath = saveFileToFolder(folder: folder, filename: filename, fileData: fileData) {
                completion(nil)
            }
            else {
                completion(.CouldNotLoad)
            }
        }
        else {
            completion(.URLError)
        }
    }

    private func handleData(_ data: Any?, folder: URL, completion: @escaping (FileSaveError?) -> Void) {
        guard let data = data else {
            os_log("Data is nil", type: .error)
            completion(.CouldNotLoad)
            return
        }
        if let dataString = data as? String {
            if !dataString.hasPrefix("file://") {
                let filename = "text_to_read.txt"
                if let fileData = dataString.data(using: .utf8) as NSData? {
                    if let fileFinalPath = self.saveFileToFolder(folder: folder, filename: filename, fileData: fileData) {
                        completion(nil)
                    }
                    else {
                        os_log("Failed to save string data to file", type: .error)
                        completion(.CouldNotLoad)
                    }
                }
                else {
                    os_log("Failed to convert string to NSData", type: .error)
                    completion(.CouldNotLoad)
                }
            }
        }
        else if let url = data as? NSURL, let fileData = NSData(contentsOf: url as URL) {
            guard let filename = url.lastPathComponent else {
                completion(.CouldNotLoad)
                return
            }
            if let fileFinalPath = self.saveFileToFolder(folder: folder, filename: filename, fileData: fileData) {
                completion(nil)
            }
            else {
                os_log("Skipping file %@, failed to save", type: .error, String(describing: filename) as CVarArg) // Safe typecasting
                completion(.CouldNotLoad)
            }
            // Try to get file as UIFile. This is the case when extension is run from screenshot editor.
        }
        else if let file = data as? UIImage, let fileData = file.pngData() as NSData? {
            let filename = "shared_image.png"
            if let fileFinalPath = self.saveFileToFolder(folder: folder, filename: filename, fileData: fileData) {
                completion(nil)
            }
            else {
                os_log("Skipping file %@, failed to save", type: .error, filename as CVarArg)
                completion(.CouldNotLoad)
            }
        }
        else {
            os_log("Received data of unhandled type", type: .error)
            completion(.URLError)
        }
    }

    private func openMainApp() {
        let url = URL(string: "new-expensify://share/root")!
        if launchApp(customURL: url) {
            self.extensionContext!.completeRequest(returningItems: nil, completionHandler: nil)
        }
        else {
            self.extensionContext!.cancelRequest(withError: NSError(domain: "", code: 0, userInfo: nil))
        }
    }

    private func launchApp(customURL: URL?) -> Bool {
        guard let url = customURL else {
            return false
        }
        let selectorOpenURL = sel_registerName("openURL:")
        var responder: UIResponder? = self
        while responder != nil {
            if responder!.responds(to: selectorOpenURL) {
                responder!.perform(selectorOpenURL, with: url)
                return true
            }
            responder = responder!.next
        }
        return false
    }

}
