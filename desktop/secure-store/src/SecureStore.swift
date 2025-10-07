import Foundation

@objc
public class SecureStore: NSObject {
    // Mock storage dictionary
    private static var mockStorage: [String: String] = [:]

    @objc
    public static func setItem(_ key: String, value: String) {
        print("SecureStore.setItem called with key: \(key), value: \(value)")
        mockStorage[key] = value
        print("SecureStore: Item stored successfully. Current storage: \(mockStorage)")
    }

    @objc
    public static func getItem(_ key: String) -> String? {
        print("SecureStore.getItem called with key: \(key)")
        let value = mockStorage[key]
        print("SecureStore: Retrieved value: \(value ?? "nil")")
        return value
    }

    @objc
    public static func deleteItem(_ key: String) {
        print("SecureStore.deleteItem called with key: \(key)")
        mockStorage.removeValue(forKey: key)
        print("SecureStore: Item deleted. Current storage: \(mockStorage)")
    }
}
