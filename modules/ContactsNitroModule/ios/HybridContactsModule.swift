import NitroModules
import Contacts
import Foundation

final class HybridContactsModule: HybridContactsModuleSpec {
    public var hybridContext = margelo.nitro.HybridContext()
    public var memorySize: Int { MemoryLayout<HybridContactsModule>.size }
    
  
    func getAll() -> Void {
        print("nitro getAll")
    }
}