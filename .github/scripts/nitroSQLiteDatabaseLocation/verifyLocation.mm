#import <Foundation/Foundation.h>
#import <TargetConditionals.h>
#include <cstdio>

// Execute the iOS branch on the existing macOS CI runner. NitroSQLite's macOS
// default can differ from iOS and must not conceal a broken iOS plist setting.
#undef TARGET_OS_OSX
#define TARGET_OS_OSX 0
#import NITRO_SQLITE_ONLOAD_PATH

using margelo::nitro::rnnitrosqlite::HybridNitroSQLite;

int main() {
  @autoreleasepool {
    // Given the host plist, when the installed native library runs +load.
    NSString *expectedDirectory = NSSearchPathForDirectoriesInDomains(NSApplicationSupportDirectory, NSUserDomainMask, YES).firstObject;
    NSString *actualDirectory = [NSString stringWithUTF8String:HybridNitroSQLite::docPath.c_str()];
    // Then its database directory must remain Application Support.
    if (actualDirectory == nil || ![actualDirectory.stringByResolvingSymlinksInPath isEqualToString:expectedDirectory.stringByResolvingSymlinksInPath]) {
      fprintf(stderr, "NitroSQLite selected %s instead of Application Support. Check the installed dependency and the host plist.\n",
              HybridNitroSQLite::docPath.c_str());
      return 1;
    }

    puts("Native database location is Application Support.");
    return 0;
  }
}
