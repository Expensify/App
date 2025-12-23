import GIBMobileSdk

@objc(ModuleFhpIos)
class ModuleFhpIos: NSObject {
    enum ModuleFhpIosError: Error {
        case logUrlError
        case targetUrlError
        case capabilityIdNotExist
    }
    
    @objc(enableCapability:responseHandler:)
    func enableCapability(capabilityId: Int, responseHandler: @escaping RCTResponseSenderBlock) {
        DispatchQueue.main.async {
            guard let capability = Capability(rawValue: capabilityId) else {
                responseHandler([ModuleFhpIosError.capabilityIdNotExist, false])
                return
            }
            let status = GIBMobileSDK.enable(capability)
            responseHandler([NSNull(), status])
        }
    }
    
    @objc(disableCapability:responseHandler:)
    func disableCapability(capabilityId: Int, responseHandler: @escaping RCTResponseSenderBlock) {
        DispatchQueue.main.async {
            guard let capability = Capability(rawValue: capabilityId) else {
                responseHandler([ModuleFhpIosError.capabilityIdNotExist, false])
                return
            }
            let status = GIBMobileSDK.disableCapability(capability)
            responseHandler([NSNull(), status])
        }
    }
    
    @objc(setLogURL:errorHandler:)
    func setLogURL(logURL: String, errorHandler: @escaping RCTResponseSenderBlock) {
        DispatchQueue.main.async {
            guard let url = URL(string: logURL) else {
                errorHandler([ModuleFhpIosError.logUrlError.localizedDescription])
                return
            }
            do {
                try GIBMobileSDK.setLogURL(url)
            } catch {
                errorHandler([error.localizedDescription])
            }
        }
    }
    
    @objc(setTargetURL:errorHandler:)
    func setTargetURL(targetURL: String, errorHandler: @escaping RCTResponseSenderBlock) {
        DispatchQueue.main.async {
            guard let url = URL(string: targetURL) else {
                errorHandler([ModuleFhpIosError.targetUrlError.localizedDescription])
                return
            }
            GIBMobileSDK.setTargetURL(url)
        }
    }
    
    @objc(setCustomerId:errorHandler:)
    func setCustomerId(id: String, errorHandler: @escaping RCTResponseSenderBlock) {
        DispatchQueue.main.async {
            GIBMobileSDK.setCustomerID(id)
        }
    }
    
    @objc(run:)
    func run(errorHandler: @escaping RCTResponseSenderBlock) {
        DispatchQueue.main.async {
            do {
                try GIBMobileSDK.run()
            } catch {
                errorHandler([error.localizedDescription])
            }
        }
    }
    
    @objc(stop:)
    func stop(errorHandler: @escaping RCTResponseSenderBlock) {
        DispatchQueue.main.async {
            GIBMobileSDK.stop()
        }
    }
    
    @objc(enableDebugLogs)
    func enableDebugLogs() {
        DispatchQueue.main.async {
            GIBMobileSDK.enableDebugLogs()
        }
    }
    
    @objc(setPublicKeyForPinning:errorHandler:)
    func setPublicKeyForPinning(publicKey: String, errorHandler: @escaping RCTResponseSenderBlock) {
        DispatchQueue.main.async {
            GIBMobileSDK.setPublicKeyForPinning(publicKey)
        }
    }
    
    @objc(setPublicKeysForPinning:errorHandler:)
    func setPublicKeysForPinning(publicKeys: [String], errorHandler: @escaping RCTResponseSenderBlock) {
        DispatchQueue.main.async {
            GIBMobileSDK.setPublicKeysForPinning(publicKeys)
        }
    }
    
    @objc(setUserAgent:errorHandler:)
    func setUserAgent(userAgent: String, errorHandler: @escaping RCTResponseSenderBlock) {
        DispatchQueue.main.async {
            GIBMobileSDK.setUserAgent(userAgent)
        }
    }
    
    @objc(setSharedKeychainIdentifier:)
    func setSharedKeychainIdentifier(identifier: String) {
        DispatchQueue.main.async {
            GIBMobileSDK.setSharedKeychainIdentifier(identifier)
        }
    }
    
    @objc(setKeepAliveTimeout:errorHandler:)
    func setKeepAliveTimeout(sec: Int32, errorHandler: @escaping RCTResponseSenderBlock) {
        DispatchQueue.main.async {
            GIBMobileSDK.setKeepAliveTimeout(sec)
        }
    }
    
    @objc(setHeaderValue:forKey:errorHandler:)
    func setHeaderValue(value: String, key: String, errorHandler: @escaping RCTResponseSenderBlock) {
        DispatchQueue.main.async {
            GIBMobileSDK.setHeaderValue(value, forKey: key)
        }
    }
    
    @objc(setLogin:errorHandler:)
    func setLogin(login: String, errorHandler: @escaping RCTResponseSenderBlock) {
        DispatchQueue.main.async {
            do {
                try GIBMobileSDK.setLogin(login)
            } catch {
                errorHandler([error.localizedDescription])
            }
        }
    }
    
    @objc(setSessionId:errorHandler:)
    func setSessionId(sessionId: String, errorHandler: @escaping RCTResponseSenderBlock) {
        DispatchQueue.main.async {
            do {
                try GIBMobileSDK.setSessionId(sessionId)
            } catch {
                errorHandler([error.localizedDescription])
            }
        }
    }
    
    @objc(setCustomEvent:errorHandler:)
    func setCustomEvent(event: String, errorHandler: @escaping RCTResponseSenderBlock) {
        DispatchQueue.main.async {
            do {
                try GIBMobileSDK.setCustomEvent(event)
            } catch {
                errorHandler([error.localizedDescription])
            }
        }
    }
    
    @objc(setAttributeTitle:withValue:andFormat:isSendOnce:errorHandler:)
    func setAttributeTitle(title: String, value: String, format: Int, isSendOnce: Bool, errorHandler: @escaping RCTResponseSenderBlock) {
        DispatchQueue.main.async {
            let attribute = GIBAttribute(title: GIBAttributeTitleKey(rawValue: title), value: value, andFormat: GIBAttributeFormat(rawValue: format), isSendOnce: isSendOnce)
            do {
                try GIBMobileSDK.setAttribute(attribute)
            } catch {
                errorHandler([error.localizedDescription])
            }
        }
    }

    @objc(getCookies:)
    func getCookies(cookiesHandler: @escaping RCTResponseSenderBlock) {
        DispatchQueue.main.async {
            let cookies = GIBMobileSDK.getCookies();
            cookiesHandler([cookies])
        }
    }

    @objc(changeBehaviorExtendedData:)
    func changeBehaviorExtendedData(isExtendedData: Bool) {
        DispatchQueue.main.async {
            BehaviorManager.isExtendedData = isExtendedData
        }
    }

    @objc(setPubKey:errorHandler:)
    func setPubKey(publicKey: String, errorHandler: @escaping RCTResponseSenderBlock) {
        DispatchQueue.main.async {
            do {
                try GIBMobileSDK.setPubKey(publicKey)
            } catch {
                errorHandler([error.localizedDescription])
            }
        }
    }
}
