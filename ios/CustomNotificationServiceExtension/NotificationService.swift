//
//  NotificationService.swift
//  CustomNotificationServiceExtension
//
//  Created by Andrew Rosiclair on 12/8/23.
//

import AirshipServiceExtension

class NotificationService: UANotificationServiceExtension {
  
  var contentHandler: ((UNNotificationContent) -> Void)?
  var bestAttemptContent: UNMutableNotificationContent?
  
  override func didReceive(_ request: UNNotificationRequest, withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void) {
    self.contentHandler = contentHandler
    bestAttemptContent = (request.content.mutableCopy() as? UNMutableNotificationContent)
    
    if let bestAttemptContent = bestAttemptContent {
      // Modify the notification content here...
      bestAttemptContent.title = "\(bestAttemptContent.title) [modified]"
      
      guard let payload = bestAttemptContent.userInfo["payload"] as? NSDictionary else {
        print("[NotificationService] didReceive() - no payload in this notification")
        return
      }
      
      guard let reportID = payload["reportID"] as? String else {
        print("[NotificationService] didReceive() - no reportID in this notification")
        return
      }
      
      guard let onyxData = payload["onyxData"] as? NSArray else {
        print("[NotificationService] didReceive() - no onyxData in this notification")
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
