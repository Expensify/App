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
        os_log("viewDidAppear triggered")
        
        if let content = extensionContext!.inputItems[0] as? NSExtensionItem {
            os_log("Received NSExtensionItem: %@", content)
            saveFileToAppGroup(content: content) { error in
                guard error == nil else {
                    os_log("Sharing error: %@", error!.rawValue)
                    return
                }
            }
        }
    }
    
    private func saveFileToFolder(folder: URL, filename: String, fileData: NSData) -> URL? {
        let filePath = folder.appendingPathComponent(filename)
        os_log("Saving file to: %@", filePath.path)
        
        do {
            try fileData.write(to: filePath, options: .completeFileProtection)
            os_log("File saved successfully at: %@", filePath.path)
            return filePath
        } catch {
            os_log("Unexpected saveFileToFolder error: %@", error.localizedDescription)
            return nil
        }
    }
    
    private func saveFileToAppGroup(content: NSExtensionItem, completion: @escaping (FileSaveError?) -> Void) {
        guard let groupURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: self.APP_GROUP_ID) else {
            completion(.GroupSharedFolderNotFound)
            os_log("Group shared folder not found")
            return
        }
        
        let sharedFileFolder = groupURL.appendingPathComponent(FILES_DIRECTORY_NAME, isDirectory: true)
        os_log("Shared file folder: %@", sharedFileFolder.path)
        setupSharedFolder(folder: sharedFileFolder)
        
        guard let attachments = content.attachments else {
            completion(.CouldNotLoad)
            os_log("Could not load attachments")
            return
        }
        
        processAttachments(attachments, in: sharedFileFolder, completion: completion)
    }
    
    private func setupSharedFolder(folder: URL) {
        os_log("Setting up shared folder: %@", folder.path)
        do {
            try FileManager.default.createDirectory(atPath: folder.path, withIntermediateDirectories: true, attributes: nil)
        } catch {
            os_log("Failed to create folder: %@, error: %@", folder.path, error.localizedDescription)
            return
        }
        
        do {
            let filePaths = try FileManager.default.contentsOfDirectory(atPath: folder.path)
            os_log("Clearing folder with contents: %@", filePaths)
            
            for filePath in filePaths {
                try FileManager.default.removeItem(atPath: folder.appendingPathComponent(filePath).path)
            }
        } catch {
            os_log("Could not clear temp folder: %@", error.localizedDescription)
        }
    }
    
    private func processAttachments(_ attachments: [NSItemProvider], in folder: URL, completion: @escaping (FileSaveError?) -> Void) {
        os_log("Processing attachments")
        let group = DispatchGroup()
        
        for attachment in attachments {
            group.enter()
            os_log("Processing attachment")
            loadData(for: attachment, in: folder, group: group) { error in
                group.leave()
                if let error = error {
                    os_log("Error loading attachment: %@", error.rawValue)
                    completion(error)
                }
            }
        }
        
        group.notify(queue: .main) {
            os_log("Finished processing all attachments")
            self.openMainApp()
        }
    }
    
    private func loadData(for attachment: NSItemProvider, in folder: URL, group: DispatchGroup, completion: @escaping (FileSaveError?) -> Void) {
        os_log("Loading data for attachment")
        let isURL = attachment.hasItemConformingToTypeIdentifier("public.url") && !attachment.hasItemConformingToTypeIdentifier("public.file-url")
        let typeIdentifier = isURL ? (kUTTypeURL as String) : (kUTTypeData as String)
        
        attachment.loadItem(forTypeIdentifier: typeIdentifier, options: nil) { (data, error) in
            DispatchQueue.main.async {
                if let error = error {
                    os_log("Sharing error: %@", error.localizedDescription)
                    completion(.CouldNotLoad)
                    return
                }
                
                if isURL, let url = data as? URL {
                    os_log("Handling URL: %@", url.absoluteString)
                    self.handleURL(url, folder: folder, completion: completion)
                } else {
                    os_log("Handling data for attachment")
                    self.handleData(data, folder: folder, completion: completion)
                }
            }
        }
    }
    
    private func handleURL(_ url: URL, folder: URL, completion: @escaping (FileSaveError?) -> Void) {
        os_log("Handling URL: %@", url.absoluteString)
        if let fileData = url.absoluteString.data(using: .utf8) as NSData? {
            if let fileFinalPath = saveFileToFolder(folder: folder, filename: READ_FROM_FILE_FILE_NAME, fileData: fileData) {
                os_log("URL saved to: %@", fileFinalPath.path)
                completion(nil)
            } else {
                os_log("Could not save URL")
                completion(.CouldNotLoad)
            }
        } else {
            os_log("URL error encountered")
            completion(.URLError)
        }
    }
    
    private func handleData(_ data: Any?, folder: URL, completion: @escaping (FileSaveError?) -> Void) {
        os_log("Handling generic data")
        guard let data = data else {
            os_log("Data is nil", type: .error)
            completion(.CouldNotLoad)
            return
        }
        
        if let dataString = data as? String {
            os_log("Handling string data: %@", dataString)
            handleStringData(dataString, folder: folder, completion: completion)
        } else if let url = data as? NSURL {
            os_log("Handling URL data: %@", url)
            handleURLData(url, folder: folder, completion: completion)
        } else if let file = data as? UIImage {
            os_log("Handling image data")
            handleImageData(file, folder: folder, completion: completion)
        } else {
            os_log("Received data of unhandled type", type: .error)
            completion(.URLError)
        }
    }
    
    private func handleStringData(_ dataString: String, folder: URL, completion: @escaping (FileSaveError?) -> Void) {
        os_log("Handling string data without file prefix")
        if !dataString.hasPrefix("file://") {
            processAndSave(data: dataString.data(using: .utf8), filename: READ_FROM_FILE_FILE_NAME, folder: folder, completion: completion)
        }
    }
    
    private func handleURLData(_ url: NSURL, folder: URL, completion: @escaping (FileSaveError?) -> Void) {
        os_log("Handling NSURL data")
        guard let filename = url.lastPathComponent else {
            os_log("Could not get last path component")
            completion(.CouldNotLoad)
            return
        }
        
        let fileData = NSData(contentsOf: url as URL) as Data?
        processAndSave(data: fileData, filename: filename, folder: folder, completion: completion)
    }
    
    private func handleImageData(_ image: UIImage, folder: URL, completion: @escaping (FileSaveError?) -> Void) {
        os_log("Handling image data")
        let filename = "shared_image.png"
        processAndSave(data: image.pngData(), filename: filename, folder: folder, completion: completion)
    }
    
    private func processAndSave(data: Data?, filename: String, folder: URL, completion: @escaping (FileSaveError?) -> Void) {
        os_log("Processing and saving data")
        guard let fileData = data as NSData? else {
            os_log("Failed to convert data", type: .error)
            completion(.CouldNotLoad)
            return
        }
        
        if saveFileToFolder(folder: folder, filename: filename, fileData: fileData) != nil {
            os_log("File saved successfully: %@", filename)
            completion(nil)
        } else {
            os_log("Failed to save file: %@", filename)
            completion(.CouldNotLoad)
        }
    }
    
    private func openMainApp() {
        os_log("Attempting to open main app")
        let url = URL(string: "new-expensify://share/root")!
        
        if launchApp(customURL: url) {
            os_log("Main app opened successfully")
            self.extensionContext!.completeRequest(returningItems: nil, completionHandler: nil)
        } else {
            os_log("Failed to open main app")
            self.extensionContext!.cancelRequest(withError: NSError(domain: "", code: 0, userInfo: nil))
        }
    }
    
    private func launchApp(customURL: URL?) -> Bool {
        os_log("Launching app with custom URL")
        guard let url = customURL else {
            os_log("Invalid custom URL")
            return false
        }
        
        var responder: UIResponder? = self
        while responder != nil {
            if let application = responder as? UIApplication {
                application.open(url, options: [:], completionHandler: nil)
                os_log("Application opened with URL: %@", url.absoluteString)
                return true
            }
            responder = responder?.next
        }
        return false
    }
}
