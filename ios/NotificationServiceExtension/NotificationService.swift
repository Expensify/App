//
//  NotificationService.swift
//  NotificationServiceExtension
//
//  Created by Andrew Rosiclair on 12/8/23.
//

import AirshipServiceExtension
import os.log
import Intents

class NotificationService: UANotificationServiceExtension {
  
  var contentHandler: ((UNNotificationContent) -> Void)?
  var bestAttemptContent: UNMutableNotificationContent?
  let log = OSLog(subsystem: Bundle.main.bundleIdentifier ?? "com.expensify.chat.dev.NotificationServiceExtension", category: "NotificationService")
  
  override func didReceive(_ request: UNNotificationRequest, withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void) {
    os_log("[NotificationService] didReceive() - received notification", log: log)
    
    self.contentHandler = contentHandler
    guard let bestAttemptContent = (request.content.mutableCopy() as? UNMutableNotificationContent) else {
      contentHandler(request.content)
      return
    }
    
    bestAttemptContent.sound = UNNotificationSound(named: UNNotificationSoundName("receive.mp3"))
    
    if #available(iOSApplicationExtension 15.0, *) {
      configureCommunicationNotification(notificationContent: bestAttemptContent, contentHandler: contentHandler)
    } else {
      contentHandler(bestAttemptContent)
    }
  }
  
  /**
   * Parses the notification content and modifies it to be a Communication Notification. More info here: https://developer.apple.com/documentation/usernotifications/implementing_communication_notifications
   */
  @available(iOSApplicationExtension 15.0, *)
  func configureCommunicationNotification(notificationContent: UNMutableNotificationContent, contentHandler: @escaping (UNNotificationContent) -> Void) {
    var notificationData: NotificationData
    do {
      notificationData = try parsePayload(notificationContent: notificationContent)
    } catch ExpError.runtimeError(let errorMessage) {
      os_log("[NotificationService] configureCommunicationNotification() - couldn't parse the payload '%@'", log: log, type: .error, errorMessage)
      contentHandler(notificationContent)
      return
    } catch {
      os_log("[NotificationService] configureCommunicationNotification() - unexpected error while parsing payload", log: log, type: .error)
      contentHandler(notificationContent)
      return
    }
    
    // Create an intent for the incoming communication message
    let intent: INSendMessageIntent = createMessageIntent(notificationData: notificationData)

    // Use the intent to initialize the interaction.
    let interaction = INInteraction(intent: intent, response: nil)


    // Interaction direction is incoming because the user is
    // receiving this message.
    interaction.direction = .incoming


    // Donate the interaction before updating notification content.
    interaction.donate { error in
        if error != nil {
            os_log("[NotificationService] configureCommunicationNotification() - failed to donate the message intent", log: self.log, type: .error)
            contentHandler(notificationContent)
            return
        }
        
        // After donation, update the notification content.
        do {
          // Update notification content before displaying the
          // communication notification.
          let updatedContent = try notificationContent.updating(from: intent)
          
          // Call the content handler with the updated content
          // to display the communication notification.
          contentHandler(updatedContent)
        } catch {
          os_log("[NotificationService] configureCommunicationNotification() - failed to update the notification with send message intent", log: self.log, type: .error)
          contentHandler(notificationContent)
        }
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
      throw ExpError.runtimeError("payload.onyxData[1].value['\(reportActionID)'] (report action) missing" + reportActionID)
    }
    
    guard let avatarURL = reportAction["avatar"] as? String else {
      throw ExpError.runtimeError("reportAction.avatar missing. reportActionID: " + reportActionID)
    }
    
    guard let accountID = reportAction["actorAccountID"] as? Int else {
      throw ExpError.runtimeError("reportAction.actorAccountID missing. reportActionID: " + reportActionID)
    }
    
    guard let person = reportAction["person"] as? NSArray else {
      throw ExpError.runtimeError("reportAction.person missing. reportActionID: " + reportActionID)
    }
    
    guard let personObject = person[0] as? NSDictionary else {
      throw ExpError.runtimeError("reportAction.person[0] missing. reportActionID: " + reportActionID)
    }
    
    guard let userName = personObject["text"] as? String else {
      throw ExpError.runtimeError("reportAction.person[0].text missing. reportActionID: " + reportActionID)
    }
    
    return NotificationData(
      reportID: reportID,
      reportActionID: reportActionID,
      avatarURL: avatarURL,
      accountID: accountID,
      userName: userName,
      title: notificationContent.title,
      messageText: notificationContent.body,
      roomName: payload["roomName"] as? String
    )
  }
  
  @available(iOSApplicationExtension 14.0, *)
  func createMessageIntent(notificationData: NotificationData) -> INSendMessageIntent {
    // Initialize only the sender for a one-to-one message intent.
    let handle = INPersonHandle(value: String(notificationData.accountID), type: .unknown)
    let avatar = fetchINImage(imageURL: notificationData.avatarURL, reportActionID: notificationData.reportActionID)
    let sender = INPerson(personHandle: handle,
                          nameComponents: nil,
                          displayName: notificationData.userName,
                          image: avatar,
                          contactIdentifier: nil,
                          customIdentifier: nil)
    
    // Configure the group/room name if there is one
    var speakableGroupName: INSpeakableString? = nil
    var recipients: [INPerson]? = nil
    if (notificationData.roomName != nil) {
      speakableGroupName = INSpeakableString(spokenPhrase: notificationData.roomName ?? "")
      
      // To add the group name subtitle there must be multiple recipients set. However, we do not have
      // data on the participatns in the room/group chat so we just add a placeholder here. This shouldn't
      // appear anywhere in the UI
      let placeholderPerson = INPerson(personHandle: INPersonHandle(value: "placeholder", type: .unknown),
                                       nameComponents: nil,
                                       displayName: "placeholder",
                                       image: nil,
                                       contactIdentifier: nil,
                                       customIdentifier: nil)
      recipients = [sender, placeholderPerson]
    }

    // Because this communication is incoming, you can infer that the current user is
    // a recipient. Don't include the current user when initializing the intent.
    let intent = INSendMessageIntent(recipients: recipients,
                                     outgoingMessageType: .outgoingMessageText,
                                     content: notificationData.messageText,
                                     speakableGroupName: speakableGroupName,
                                     conversationIdentifier: String(notificationData.reportID),
                                     serviceName: nil,
                                     sender: sender,
                                     attachments: nil)
    
    // If the group name is set, we force the avatar to just be the sender's avatar
    intent.setImage(avatar, forParameterNamed: \.speakableGroupName)
    
    return intent
  }
  
  override func serviceExtensionTimeWillExpire() {
    // Called just before the extension will be terminated by the system.
    // Use this as an opportunity to deliver your "best attempt" at modified content, otherwise the original push payload will be used.
    if let contentHandler = contentHandler, let bestAttemptContent =  bestAttemptContent {
      contentHandler(bestAttemptContent)
    }
  }
  
  func fetchINImage(imageURL: String, reportActionID: String) -> INImage? {
    guard let url = URL(string: imageURL) else {
      return nil
    }
    
    do {
      let data = try Data(contentsOf: url)
      return INImage(imageData: data)
    } catch {
      os_log("[NotificationService] fetchINImage() - failed to fetch avatar. reportActionID: %@", log: self.log, type: .error, reportActionID)
      return nil
    }
  }
}

class NotificationData {
  public var reportID: Int64
  public var reportActionID: String
  public var avatarURL: String
  public var accountID: Int
  public var userName: String
  public var title: String
  public var messageText: String
  public var roomName: String?
  
  public init (reportID: Int64, reportActionID: String, avatarURL: String, accountID: Int, userName: String, title: String, messageText: String, roomName: String?) {
    self.reportID = reportID
    self.reportActionID = reportActionID
    self.avatarURL = avatarURL
    self.accountID = accountID
    self.userName = userName
    self.title = title
    self.messageText = messageText
    self.roomName = roomName
  }
}
