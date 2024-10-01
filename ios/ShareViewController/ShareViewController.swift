import UIKit
import Social
import MobileCoreServices
import UniformTypeIdentifiers
import Intents
import os

class ShareViewController: UIViewController {
  let APP_GROUP_ID = "group.com.expensify.new"
  let FILES_DIRECTORY_NAME = "sharedImages"

  enum ImageSaveError: String {
      case IncorrectType
      case CouldNotLoad
      case URLError
      case GroupSharedFolderNotFound
  }
  
  override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        
    let content = extensionContext!.inputItems[0] as! NSExtensionItem
    let contentType = UTType.image.identifier

    // TODO: Remove when app group setup is done
    self.openMainApp()
    
    os_log("ShareViewController.viewDidAppear contentType: \(contentType)")
    os_log("ShareViewController.viewDidAppear content: \(content)")
    saveImageToAppGroup(content: content, contentType: contentType) { (error) in
        guard error == nil else {
            os_log("Sharing error: \(error!.rawValue)")
            self.extensionContext!.cancelRequest(withError: NSError(domain: "", code: 0, userInfo: nil))
            return
        }
        self.openMainApp()
    }

    }

    func saveImageToFolder(folder: URL, filename: String, imageData: NSData) -> URL? {
        let filePath = folder.appendingPathComponent(filename)
        do {
            try imageData.write(to: filePath, options: .completeFileProtection)
            os_log("TEST SAVE PATH: \(filePath).")
            return filePath
        } catch {
            os_log("Unexpected saveImageToFolder error: \(error).")
            return nil
        }
    }


    private func saveImageToAppGroup(content: NSExtensionItem, contentType: String, completion: @escaping (ImageSaveError?) -> Void) {
      guard let groupURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: self.APP_GROUP_ID) else {
          completion(.GroupSharedFolderNotFound)
          os_log("ShareViewController.saveImageToAppGroup failed to get group shared folder")
          return
      }
      let sharedImageFolder = groupURL.appendingPathComponent(FILES_DIRECTORY_NAME, isDirectory: true)

      // Try to create folder to share images if it doesn't exist
      do {
          try FileManager.default.createDirectory(atPath: sharedImageFolder.path, withIntermediateDirectories: true, attributes: nil)
      } catch {
          os_log("Failed to create folder: \(sharedImageFolder.path), error: \(error)")
          return
      }

      os_log("sharedImageFolder.path \(sharedImageFolder.path)")
      // Clear any image that was in the folder (in case it already existed)
      do {
          let filePaths = try FileManager.default.contentsOfDirectory(atPath: sharedImageFolder.path)
          for filePath in filePaths {
              try FileManager.default.removeItem(atPath: sharedImageFolder.appendingPathComponent(filePath).path)
          }
      } catch {
          os_log("Could not clear temp folder: \(error)")
          return
      }

      // Process shared images and put them in the shared folder
      var imagePaths = [String]()
      let group = DispatchGroup()

      guard let attachments = content.attachments else {
          completion(.CouldNotLoad)
          os_log("ShareViewController.saveImageToAppGroup Could not load")
          return
      }

      // This is ran : NSItemProvider: NSItemProviderfor each image that is selected.
      for attatchment in attachments {
          group.enter()

          guard attatchment.hasItemConformingToTypeIdentifier(contentType) else {
              completion(.IncorrectType)
              group.leave()
              continue
          }
          attatchment.loadItem(forTypeIdentifier: contentType, options: nil, completionHandler: { (data, error) in
              guard error == nil else {
                  DispatchQueue.main.async {
                      os_log("Sharing error: \(error)")
                      completion(.CouldNotLoad)
                      group.leave()
                  }
                  return
              }

              // Try to get image as URL. Usually the case when extension is run from photos or messaging app.
              if let url = data as? NSURL, let imageData = NSData(contentsOf: url as URL) {
                  // Add filename to path
                 guard let filename = url.lastPathComponent else {
                      // Provide some filename?
                      os_log("Skipping image, no filename.")
                      group.leave()
                      return
                  }
                  os_log("handleShareAction FILE NAME \(filename)")
                  if let imageFinalPath = self.saveImageToFolder(folder: sharedImageFolder, filename: filename, imageData: imageData) {
                      imagePaths.append(imageFinalPath.path)
                      os_log("handleShareAction Saving image \(imageFinalPath.path)")
                  } else {
                      os_log("handleShareAction Skipping image \(String(describing: filename)), failed to save")
                  }
                  group.leave()
                  // Try to get image as UIImage. This is the case when extension is run from screenshot editor.
              } else if let image = data as? UIImage, let imageData = image.pngData() as NSData? {
                  let filename = "image_name_\(imagePaths.count).png"
                  if let imageFinalPath = self.saveImageToFolder(folder: sharedImageFolder, filename: filename, imageData: imageData) {
                      imagePaths.append(imageFinalPath.path)
                  } else {
                      os_log("Skipping image \(String(describing: filename)), failed to save")
                  }
                  group.leave()
              } else {
                  DispatchQueue.main.async {
                      completion(.URLError)
                      group.leave()
                  }
                  return
              }

          })
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