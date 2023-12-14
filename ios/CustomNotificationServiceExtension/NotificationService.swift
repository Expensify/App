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
    guard let bestAttemptContent = (request.content.mutableCopy() as? UNMutableNotificationContent) else {
      contentHandler(request.content)
      return
    }
    defer {
      bestAttemptContent.title = "\(bestAttemptContent.title) [modified]"
      contentHandler(bestAttemptContent)
    }
    
    var notificationData: NotificationData
    do {
      notificationData = try parsePayload(notificationContent: bestAttemptContent)
    } catch ExpError.runtimeError(let errorMessage) {
      os_log("[NotificationService] didReceive() - couldn't parse the payload '%@'", log: log, type: .error, errorMessage)
    } catch {
      os_log("[NotificationService] didReceive() - unexpected error while parsing payload", log: log, type: .error)
    }
  }
  
  func parsePayload(notificationContent: UNMutableNotificationContent) throws -> NotificationData  {
    guard let payload = notificationContent.userInfo["payload"] as? NSDictionary else {
      throw ExpError.runtimeError("payload missing")
    }
    
    guard let reportID = payload["reportID"] as? Int64 else {
      throw ExpError.runtimeError("payload.reportID missing")
    }
    
    guard let reportActionID = payload["reportActionID"] as? String else {
      throw ExpError.runtimeError("payload.reportActionID missing")
    }
    
    guard let onyxData = payload["onyxData"] as? NSArray else {
      throw ExpError.runtimeError("payload.onyxData missing" + reportActionID)
    }
    
    guard let reportActionOnyxUpdate = onyxData[1] as? NSDictionary else {
      throw ExpError.runtimeError("payload.onyxData[1] missing" + reportActionID)
    }
    
    guard let reportActionCollection = reportActionOnyxUpdate["value"] as? NSDictionary else {
      throw ExpError.runtimeError("payload.onyxData[1].value (report action onyx update) missing" + reportActionID)
    }
    
    guard let reportAction = reportActionCollection[reportActionID] as? NSDictionary else {
      throw ExpError.runtimeError("payload.onyxData[1].value['\(reportActionID)'] (report action) is missing" + reportActionID)
    }
    
    guard let avatarURL = reportAction["avatar"] as? String else {
      throw ExpError.runtimeError("reportAction.avatar is missing" + reportActionID)
    }
    
    return NotificationData(
      reportID: reportID,
      reportActionID: reportActionID,
      onyxData: onyxData,
      reportOnyxUpdate: reportActionOnyxUpdate,
      avatarURL: avatarURL
    )
  }
  
  override func serviceExtensionTimeWillExpire() {
    // Called just before the extension will be terminated by the system.
    // Use this as an opportunity to deliver your "best attempt" at modified content, otherwise the original push payload will be used.
    if let contentHandler = contentHandler, let bestAttemptContent =  bestAttemptContent {
      contentHandler(bestAttemptContent)
    }
  }
  
}

class NotificationData {
  public var reportID: Int64
  public var reportActionID: String
  public var onyxData: NSArray
  public var reportOnyxUpdate: NSDictionary
  public var avatarURL: String
  
  public init (reportID: Int64, reportActionID: String, onyxData: NSArray, reportOnyxUpdate: NSDictionary, avatarURL: String) {
    self.reportID = reportID
    self.reportActionID = reportActionID
    self.onyxData = onyxData
    self.reportOnyxUpdate = reportOnyxUpdate
    self.avatarURL = avatarURL
  }
}
