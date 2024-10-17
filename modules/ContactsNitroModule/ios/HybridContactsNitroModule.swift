import NitroModules
import Contacts
import Foundation

final class HybridContactsNitroModule: HybridContactsNitroModuleSpec {
    public var hybridContext = margelo.nitro.HybridContext()
    public var memorySize: Int { MemoryLayout<HybridContactsNitroModule>.size }
    
  
    func getAll() -> Void {
        print("nitro getAll")
    }
}