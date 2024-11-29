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

    let content = extensionContext!.inputItems[0] as! NSExtensionItem

    // TODO: Remove when app group setup is done
    self.openMainApp()

    os_log("ShareViewController.viewDidAppear content: \(content)")
    saveFileToAppGroup(content: content) { (error) in
      guard error == nil else {
        os_log("Sharing error TUTAJ2: \(error!.rawValue)")
        return
      }
      self.openMainApp()
    }

  }

  func saveFileToFolder(folder: URL, filename: String, fileData: NSData) -> URL? {
    let filePath = folder.appendingPathComponent(filename)
    do {
      try fileData.write(to: filePath, options: .completeFileProtection)
      os_log("TEST SAVE PATH: \(filePath).")
      return filePath
    } catch {
      os_log("Unexpected saveFileToFolder error: \(error).")
      return nil
    }
  }

  private func saveFileToAppGroup(
    content: NSExtensionItem, completion: @escaping (FileSaveError?) -> Void
  ) {
    guard
      let groupURL = FileManager.default.containerURL(
        forSecurityApplicationGroupIdentifier: self.APP_GROUP_ID)
    else {
      completion(.GroupSharedFolderNotFound)
      os_log("ShareViewController.saveFileToAppGroup failed to get group shared folder")
      return
    }
    let sharedFileFolder = groupURL.appendingPathComponent(FILES_DIRECTORY_NAME, isDirectory: true)

    // Try to create folder to share files if it doesn't exist
    do {
      try FileManager.default.createDirectory(
        atPath: sharedFileFolder.path, withIntermediateDirectories: true, attributes: nil)
    } catch {
      os_log("Failed to create folder: \(sharedFileFolder.path), error: \(error)")
      return
    }

    os_log("sharedFileFolder.path \(sharedFileFolder.path)")
    // Clear any file that was in the folder (in case it already existed)
    do {
      let filePaths = try FileManager.default.contentsOfDirectory(atPath: sharedFileFolder.path)
      for filePath in filePaths {
        try FileManager.default.removeItem(
          atPath: sharedFileFolder.appendingPathComponent(filePath).path)
      }
    } catch {
      os_log("Could not clear temp folder: \(error)")
      return
    }

    // Process shared files and put them in the shared folder
    var filePaths = [String]()
    let group = DispatchGroup()

    guard let attachments = content.attachments else {
      completion(.CouldNotLoad)
      os_log("ShareViewController.saveFileToAppGroup Could not load")
      return
    }

    for attachment in attachments {
      let isURL = attachment.hasItemConformingToTypeIdentifier("public.url") && !attachment.hasItemConformingToTypeIdentifier("com.adobe.pdf")
      os_log("ShareViewController.saveFileToAppGroup isURL: \(isURL)")
      group.enter()
      if isURL {
        os_log("Loading URL item")
      attachment.loadItem(forTypeIdentifier: kUTTypeURL as String, options: nil) {
        (data, error) in
        guard error == nil else {
          DispatchQueue.main.async {
            os_log("Sharing error TUTAJ: \(error)")
            completion(.CouldNotLoad)
            group.leave()
          }
          os_log("OPUSZCZAM")
          return
        }
        if let url = data as? URL {
          let urlString = url.absoluteString
          let filename = "text_to_read.txt"
          if let fileData = urlString.data(using: .utf8) as NSData? {
            if let fileFinalPath = self.saveFileToFolder(
              folder: sharedFileFolder, filename: filename, fileData: fileData)
            {
              os_log("URL saved successfully at path: %@", fileFinalPath.path)
              filePaths.append(fileFinalPath.path)
            } else {
              os_log("Failed to save URL string", type: .error)
            }
          } else {
            os_log("Failed to convert URL string to NSData", type: .error)
          }
        } else {
          os_log("Data is not a URL or could not be converted to a String", type: .error)
          completion(.URLError)
        }
        group.leave()
          }
      }
       else {

        // Handle case where the item is not a URL
        attachment.loadItem(forTypeIdentifier: kUTTypeData as String, options: nil, completionHandler: { (data, error) in
            guard error == nil else {
              DispatchQueue.main.async {
                completion(.CouldNotLoad)
                group.leave()
              }
              os_log("OPUSZCZAM")
              return
            }

            os_log("ShareViewController %@", data as! CVarArg)
            if let dataString = data as? String {
              if !dataString.hasPrefix("file://") {
                let filename = "text_to_read.txt"
                let fileData = dataString.data(using: .utf8)! as NSData
                if let fileFinalPath = self.saveFileToFolder(folder: sharedFileFolder, filename: filename, fileData: fileData) {
                  os_log("Saving string data to file TEST PATH \(fileFinalPath.path)")
                  filePaths.append(fileFinalPath.path)
                } else {
                  os_log("Failed to save string data to file")
                }
                group.leave()
                return
              }
            } 
            else{

              // Try to get file as URL. Usually the case when extension is run from photos or messaging app.
              if let url = data as? NSURL, let fileData = NSData(contentsOf: url as URL) {
                // Add filename to path
                guard let filename = url.lastPathComponent else {
                  // Provide some filename?
                  os_log("Skipping file, no filename.")
                  group.leave()
                  return
                }
                os_log("handleShareAction FILE NAME \(filename)")
                if let fileFinalPath = self.saveFileToFolder(folder: sharedFileFolder, filename: filename, fileData: fileData) {
                  os_log("handleShareAction Saving file TEST PATH \(fileFinalPath.path)")
                  filePaths.append(fileFinalPath.path)
                  os_log("handleShareAction Saving file \(fileFinalPath.path)")
                } else {
                  os_log("handleShareAction Skipping file \(String(describing: filename)), failed to save")
                }
                group.leave()
                // Try to get file as UIFile. This is the case when extension is run from screenshot editor.
              } else if let file = data as? UIImage, let fileData = file.pngData() as NSData? {
                let filename = "file_name_\(filePaths.count).png"
                if let fileFinalPath = self.saveFileToFolder(folder: sharedFileFolder, filename: filename, fileData: fileData) {
                  os_log("handleShareAction Saving file TEST PATH \(fileFinalPath.path)")
                  filePaths.append(fileFinalPath.path)
                } else {
                  os_log("Skipping file \(String(describing: filename)), failed to save")
                }
                group.leave()
              } else {
                DispatchQueue.main.async {
                  completion(.URLError)
                  group.leave()
                }
                return
              }
            }

          })
      }
    }
  }

  private func openMainApp() {
    let url = URL(string: "new-expensify://share/root")!
    if launchApp(customURL: url) {
      self.extensionContext!.completeRequest(returningItems: nil, completionHandler: nil)
    } else {
      self.extensionContext!.cancelRequest(withError: NSError(domain: "", code: 0, userInfo: nil))
    }
  }

  private func launchApp(customURL: URL?) -> Bool {
    guard let url = customURL else { return false }
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
