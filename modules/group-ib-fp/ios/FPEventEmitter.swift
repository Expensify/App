import Foundation
import GIBMobileSdk

@objc(FPEventEmitter)
class FPEventEmitter: RCTEventEmitter, GIBSessionListener {
    static var shared: FPEventEmitter?

    override init() {
        super.init()
        FPEventEmitter.shared = self
        GIBMobileSDK.setSessionListener(self)
    }

    override static func requiresMainQueueSetup() -> Bool {
        return true
    }

    override func supportedEvents() -> [String]! {
        return [Constants.onSessionOpened, Constants.onReceiveSession]
    }

    func sessionDidOpen(withID sessionId: String) {
        DispatchQueue.main.async { [weak self] in
            self?.sendEvent(withName: Constants.onSessionOpened, body: sessionId)
        }
    }
    
    func sessionDidGetId(_ sessionId: String) {
        DispatchQueue.main.async { [weak self] in
            self?.sendEvent(withName: Constants.onReceiveSession, body: sessionId)
        }
    }
}

private extension FPEventEmitter {
    enum Constants {
        static let onSessionOpened = "onSessionOpened"
        static let onReceiveSession = "onReceiveSession"
    }
}