import NitroModules
import Contacts
import Foundation

final class HybridContactsModule: HybridContactsModuleSpec {
    public var memorySize: Int { MemoryLayout<HybridContactsModule>.size }
    private let contactStore = CNContactStore()
    private let imageDirectory: URL
    private let fieldToKeyDescriptor: [ContactFields: CNKeyDescriptor] = [
        .firstName: CNContactGivenNameKey as CNKeyDescriptor,
        .lastName: CNContactFamilyNameKey as CNKeyDescriptor,
        .phoneNumbers: CNContactPhoneNumbersKey as CNKeyDescriptor,
        .emailAddresses: CNContactEmailAddressesKey as CNKeyDescriptor,
        .imageData: CNContactImageDataKey as CNKeyDescriptor
    ]
    
    override init() {
        imageDirectory = FileManager.default.temporaryDirectory.appendingPathComponent("ContactImages")
        try? FileManager.default.createDirectory(at: imageDirectory, withIntermediateDirectories: true)
        super.init()
    }
    
    func getAll(keys: [ContactFields]) throws -> Promise<[Contact]> {
        Promise.async { [unowned self] in
            let keysSet = Set(keys)
            let keysToFetch = keys.compactMap { self.fieldToKeyDescriptor[$0] }
            guard !keysToFetch.isEmpty else { return [] }
            
            let request = CNContactFetchRequest(keysToFetch: keysToFetch)
            var contacts = [Contact]()
            contacts.reserveCapacity(1000)
            
            try self.contactStore.enumerateContacts(with: request) { contact, _ in
                contacts.append(self.processContact(contact, keysSet: keysSet))
            }
            
            return contacts
        }
    }
    
    // This annotation forces the compiler to inline this function at every call site,
    // eliminating function call overhead for better performance during contact processing
    @inline(__always)
    private func processContact(_ contact: CNContact, keysSet: Set<ContactFields>) -> Contact {
        Contact(
            firstName: keysSet.contains(.firstName) ? contact.givenName : nil,
            lastName: keysSet.contains(.lastName) ? contact.familyName : nil,
            phoneNumbers: keysSet.contains(.phoneNumbers) ? contact.phoneNumbers.map { StringHolder(value: $0.value.stringValue) } : nil,
            emailAddresses: keysSet.contains(.emailAddresses) ? contact.emailAddresses.map { StringHolder(value: $0.value as String) } : nil,
            imageData: keysSet.contains(.imageData) ? getImagePath(for: contact, isThumbnail: false) : nil
        )
    }
    
    // This annotation forces the compiler to inline this function at every call site,
    // eliminating function call overhead for better performance when handling contact images
    @inline(__always)
    private func getImagePath(for contact: CNContact, isThumbnail: Bool) -> String? {
        let imageData = isThumbnail ? contact.thumbnailImageData : contact.imageData
        guard let data = imageData else { return nil }
        
        let fileName = "\(contact.identifier)_\(isThumbnail ? "thumb" : "full").jpg"
        let fileURL = imageDirectory.appendingPathComponent(fileName)
        
        if !FileManager.default.fileExists(atPath: fileURL.path) {
            try? data.write(to: fileURL, options: .atomic)
        }
        
        return fileURL.path
    }
}
