//
//  ShareViewController.swift
//  RNShareMenu

import Foundation
import os
import MobileCoreServices
import UIKit
import Social
import RNShareMenu



class ShareViewController: UIViewController {
  
  let groupIdentifier:String = "group.com.chat.expensify.chat"
  
  var hostAppId: String?
  var hostAppUrlScheme: String?
  var sharedItems: [Any] = []
  
  override func viewDidLoad() {
    super.viewDidLoad()
    
    
    
    if let hostAppId = Bundle.main.object(forInfoDictionaryKey: HOST_APP_IDENTIFIER_INFO_PLIST_KEY) as? String {
      self.hostAppId = hostAppId
    } else {
      print("Error: \(NO_INFO_PLIST_INDENTIFIER_ERROR)")
    }

    if let hostAppUrlScheme = Bundle.main.object(forInfoDictionaryKey: HOST_URL_SCHEME_INFO_PLIST_KEY) as? String {
      self.hostAppUrlScheme = hostAppUrlScheme
    } else {
      print("Error: \(NO_INFO_PLIST_URL_SCHEME_ERROR)")
    }

    self.didSelectPost()
  }

  func isContentValid() -> Bool {
    // Do validation of contentText and/or NSExtensionContext attachments here
    return true
  }

  func didSelectPost() {
    
    // This is called after the user selects Post. Do the upload of contentText and/or NSExtensionContext attachments.
    guard let items = extensionContext?.inputItems as? [NSExtensionItem] else {
      cancelRequest()
      return
    }

    handlePost(items)
  }

  func configurationItems() -> [Any]! {
      // To add configuration options via table cells at the bottom of the sheet, return an array of SLComposeSheetConfigurationItem here.
      return []
  }

  func handlePost(_ items: [NSExtensionItem], extraData: [String:Any]? = nil) {
    DispatchQueue.global().async {
      print("HANDLE POST")
      guard self.hostAppId != nil else {
        self.exit(withError: NO_INFO_PLIST_INDENTIFIER_ERROR)
        return
      }
      guard let userDefaults = UserDefaults(suiteName: self.groupIdentifier) else {
        self.exit(withError: NO_APP_GROUP_ERROR)
        return
      }

      if let data = extraData {
        self.storeExtraData(data)
      } else {
        self.removeExtraData()
      }

      let semaphore = DispatchSemaphore(value: 0)

      for item in items {
        guard let attachments = item.attachments else {
          self.cancelRequest()
          return
        }

        for provider in attachments {
          if provider.isText {
            self.storeText(withProvider: provider, semaphore)
          } else if provider.isURL {
            self.storeUrl(withProvider: provider, semaphore)
          } else {
            self.storeFile(withProvider: provider, semaphore)
          }

          semaphore.wait()
        }
      }

      userDefaults.set(self.sharedItems,
                       forKey: USER_DEFAULTS_KEY)
      userDefaults.synchronize()


      
      if let message = userDefaults.object(forKey: USER_DEFAULTS_KEY) {
        print("UserDefaults object for key \(USER_DEFAULTS_KEY): \(message)")
      }

      DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
        self.openHostApp()
      }

    }
  }

  func storeExtraData(_ data: [String:Any]) {
    guard self.hostAppId != nil else {
      print("Error: \(NO_INFO_PLIST_INDENTIFIER_ERROR)")
      return
    }
    guard let userDefaults = UserDefaults(suiteName: self.groupIdentifier) else {
      print("Error: \(NO_APP_GROUP_ERROR)")
      return
    }
    userDefaults.set(data, forKey: USER_DEFAULTS_EXTRA_DATA_KEY)
    userDefaults.synchronize()
  }

  func removeExtraData() {
    guard self.hostAppId != nil else {
      print("Error: \(NO_INFO_PLIST_INDENTIFIER_ERROR)")
      return
    }
    guard let userDefaults = UserDefaults(suiteName: self.groupIdentifier) else {
      print("Error: \(NO_APP_GROUP_ERROR)")
      return
    }
    userDefaults.removeObject(forKey: USER_DEFAULTS_EXTRA_DATA_KEY)
    userDefaults.synchronize()
  }

  func storeText(withProvider provider: NSItemProvider, _ semaphore: DispatchSemaphore) {
    provider.loadItem(forTypeIdentifier: kUTTypeText as String, options: nil) { (data, error) in
      guard (error == nil) else {
        self.exit(withError: error.debugDescription)
        return
      }
      guard let text = data as? String else {
        self.exit(withError: COULD_NOT_FIND_STRING_ERROR)
        return
      }

      self.sharedItems.append([DATA_KEY: text, MIME_TYPE_KEY: "text/plain"])
      semaphore.signal()
    }
  }

  func storeUrl(withProvider provider: NSItemProvider, _ semaphore: DispatchSemaphore) {
    provider.loadItem(forTypeIdentifier: kUTTypeURL as String, options: nil) { (data, error) in
      guard (error == nil) else {
        self.exit(withError: error.debugDescription)
        return
      }
      guard let url = data as? URL else {
        self.exit(withError: COULD_NOT_FIND_URL_ERROR)
        return
      }

      self.sharedItems.append([DATA_KEY: url.absoluteString, MIME_TYPE_KEY: "text/plain"])
      semaphore.signal()
    }
  }

  func storeFile(withProvider provider: NSItemProvider, _ semaphore: DispatchSemaphore) {
    provider.loadItem(forTypeIdentifier: kUTTypeData as String, options: nil) { (data, error) in
      guard (error == nil) else {
        self.exit(withError: error.debugDescription)
        return
      }
      guard let url = data as? URL else {
        self.exit(withError: COULD_NOT_FIND_IMG_ERROR)
        return
      }
      guard self.hostAppId != nil else {
        self.exit(withError: NO_INFO_PLIST_INDENTIFIER_ERROR)
        return
      }
      guard let groupFileManagerContainer = FileManager.default
        .containerURL(forSecurityApplicationGroupIdentifier: self.groupIdentifier)
      else {
        self.exit(withError: NO_APP_GROUP_ERROR)
        return
      }

      let mimeType = url.extractMimeType()
      let filePath = groupFileManagerContainer
        .appendingPathComponent(url.lastPathComponent)

      guard self.moveFileToDisk(from: url, to: filePath) else {
        self.exit(withError: COULD_NOT_SAVE_FILE_ERROR)
        return
      }

      self.sharedItems.append([DATA_KEY: filePath.absoluteString, MIME_TYPE_KEY: mimeType])
      semaphore.signal()
    }
  }

  func moveFileToDisk(from srcUrl: URL, to destUrl: URL) -> Bool {
    do {
      if FileManager.default.fileExists(atPath: destUrl.path) {
        try FileManager.default.removeItem(at: destUrl)
      }
      try FileManager.default.copyItem(at: srcUrl, to: destUrl)
    } catch (let error) {
      print("Could not save file from \(srcUrl) to \(destUrl): \(error)")
      return false
    }

    return true
  }

  func exit(withError error: String) {
    print("Error: \(error)")
    cancelRequest()
  }

  internal func openHostApp() {
    guard let urlScheme = self.hostAppUrlScheme else {
      exit(withError: NO_INFO_PLIST_URL_SCHEME_ERROR)
      return
    }

    let url = URL(string: urlScheme.contains("://") ? urlScheme : "\(urlScheme)://")
    let selectorOpenURL = sel_registerName("openURL:")
    var responder: UIResponder? = self

    while responder != nil {
      if responder?.responds(to: selectorOpenURL) == true {
        responder?.perform(selectorOpenURL, with: url)
      }
      responder = responder!.next
    }

    completeRequest()
  }

  func completeRequest() {
    // Inform the host that we're done, so it un-blocks its UI. Note: Alternatively you could call super's -didSelectPost, which will similarly complete the extension context.
    extensionContext!.completeRequest(returningItems: [], completionHandler: nil)
  }

  func cancelRequest() {
    extensionContext!.cancelRequest(withError: NSError())
  }

}
