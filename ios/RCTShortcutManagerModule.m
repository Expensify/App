// RCTCalendarModule.m
// iOS doesn't have dynamic shortcuts like Android, so this module contains noop functions to prevent iOS from crashing
#import "RCTShortcutManagerModule.h"

@implementation RCTShortcutManagerModule

RCT_EXPORT_METHOD(removeAllDynamicShortcuts){}

RCT_EXPORT_MODULE(ShortcutManager);

@end
