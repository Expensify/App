import Intents
import MobileCoreServices
import Social
import UIKit
import UniformTypeIdentifiers
import os
class ShareViewController: UIViewController {
    let APP_GROUP_ID = "group.com.expensify.new"
    let FILES_DIRECTORY_NAME = "sharedFiles"
    let READ_FROM_FILE_FILE_NAME = "text_to_read.txt"
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
        if let fileData = url.absoluteString.data(using: .utf8) as NSData? {
            if let fileFinalPath = saveFileToFolder(folder: folder, filename: READ_FROM_FILE_FILE_NAME, fileData: fileData) {
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
            handleStringData(dataString, folder: folder, completion: completion)
        } else if let url = data as? NSURL {
            handleURLData(url, folder: folder, completion: completion)
        } else if let file = data as? UIImage {
            handleImageData(file, folder: folder, completion: completion)
        } else {
            os_log("Received data of unhandled type", type: .error)
            completion(.URLError)
        }
    }

    private func handleStringData(_ dataString: String, folder: URL, completion: @escaping (FileSaveError?) -> Void) {
        if !dataString.hasPrefix("file://") {
            processAndSave(data: dataString.data(using: .utf8), filename: READ_FROM_FILE_FILE_NAME, folder: folder, completion: completion)
        }
    }

  private func handleURLData(_ url: NSURL, folder: URL, completion: @escaping (FileSaveError?) -> Void) {
      guard let filename = url.lastPathComponent else {
          completion(.CouldNotLoad)
          return
      }
      let fileData = NSData(contentsOf: url as URL) as Data?
      processAndSave(data: fileData, filename: filename, folder: folder, completion: completion)
  }

    private func handleImageData(_ image: UIImage, folder: URL, completion: @escaping (FileSaveError?) -> Void) {
        let filename = "shared_image.png"
        processAndSave(data: image.pngData(), filename: filename, folder: folder, completion: completion)
    }

    private func processAndSave(data: Data?, filename: String, folder: URL, completion: @escaping (FileSaveError?) -> Void) {
        guard let fileData = data as NSData? else {
            os_log("Failed to convert data", type: .error)
            completion(.CouldNotLoad)
            return
        }
        if saveFileToFolder(folder: folder, filename: filename, fileData: fileData) != nil {
            completion(nil)
        } else {
            os_log("Failed to save file: %@", type: .error, filename)
            completion(.CouldNotLoad)
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
