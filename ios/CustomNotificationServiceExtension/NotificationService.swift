//
//  NotificationService.swift
//  CustomNotificationServiceExtension
//
//  Created by Andrew Rosiclair on 12/8/23.
//

import AirshipServiceExtension
import os.log

class NotificationService: UANotificationServiceExtension {
  
  var contentHandler: ((UNNotificationContent) -> Void)?
  var bestAttemptContent: UNMutableNotificationContent?
  let log = OSLog(subsystem: Bundle.main.bundleIdentifier ?? "com.expensify.chat.dev.CustomNotificationServiceExtension", category: "NotificationService")
  
  override func didReceive(_ request: UNNotificationRequest, withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void) {
    os_log("[NotificationService] didReceive() - received notification", log: log)
    
    self.contentHandler = contentHandler
    bestAttemptContent = (request.content.mutableCopy() as? UNMutableNotificationContent)
    
    if let bestAttemptContent = bestAttemptContent {
      // Modify the notification content here...
      bestAttemptContent.title = "\(bestAttemptContent.title) [modified]"
      
      guard let payload = bestAttemptContent.userInfo["payload"] as? NSDictionary else {
        os_log("[NotificationService] didReceive() - no payload in this notification", log: log, type: .error)
        return
      }
      
      guard let reportID = payload["reportID"] as? String else {
        os_log("[NotificationService] didReceive() - no reportID in this notification", log: log, type: .error)
        return
      }
      
      guard let onyxData = payload["onyxData"] as? NSArray else {
        os_log("[NotificationService] didReceive() - no onyxData in this notification", log: log, type: .error)
        return
      }
      
      contentHandler(bestAttemptContent)
    }
  }
  
  override func serviceExtensionTimeWillExpire() {
    // Called just before the extension will be terminated by the system.
    // Use this as an opportunity to deliver your "best attempt" at modified content, otherwise the original push payload will be used.
    if let contentHandler = contentHandler, let bestAttemptContent =  bestAttemptContent {
      contentHandler(bestAttemptContent)
    }
  }
  
}
