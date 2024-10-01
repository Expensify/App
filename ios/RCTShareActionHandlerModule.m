//
//  RCTShareActionHandlerModule.m
//  NewExpensify
//
//  Created by Bartek Krasoń on 28/08/2024.
//

#import <Foundation/Foundation.h>
#import "RCTShareActionHandlerModule.h"
#import <React/RCTLog.h>

NSString *const ShareExtensionGroupIdentifier = @"group.com.expensify.new";
NSString *const ShareExtensionFilesKey = @"sharedImages";
NSString *const ShareImageFileExtension = @".jpg";

@implementation RCTShareActionHandlerModule

RCT_EXPORT_MODULE(RCTShareActionHandlerModule);

RCT_EXPORT_METHOD(processFiles:(RCTResponseSenderBlock)callback)
{
  RCTLogInfo(@"Processing share extension files");
  NSUserDefaults *defaults = [[NSUserDefaults alloc] initWithSuiteName:ShareExtensionGroupIdentifier];

  NSURL *groupURL = [[NSFileManager defaultManager] containerURLForSecurityApplicationGroupIdentifier:ShareExtensionGroupIdentifier];

  if (groupURL == NULL) {
      NSLog(@"handleShareExtension Missing app group url");
      return;
  }

  NSURL *sharedImagesFolderPathURL = [groupURL URLByAppendingPathComponent:ShareExtensionFilesKey];
  NSString *sharedImagesFolderPath = [sharedImagesFolderPathURL path];

  // Set default to NULL so it is not used when app is launched regularly.
  [defaults setObject:NULL forKey:ShareExtensionFilesKey];
  [defaults synchronize];

  // Get image file names
  NSError *error = nil;
  NSArray *imageSrcPath = [[NSFileManager defaultManager] contentsOfDirectoryAtPath:sharedImagesFolderPath error:&error];

  if (imageSrcPath.count == 0) {
      NSLog(@"handleShareAction Failed to find images in 'sharedImagesFolderPath' %@", sharedImagesFolderPath);
      return;
  }


  NSLog(@"handleShareAction shared %lu images", imageSrcPath.count);

  NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
  NSString *documentsDirectory = [paths objectAtIndex:0];
  NSMutableArray *imageFinalPaths = [NSMutableArray array];

  for (int i = 0; i < imageSrcPath.count; i++) {
    if (imageSrcPath[i] == NULL) {
      NSLog(@"handleShareAction Invalid image in position %d, imageSrcPath[i] is nil", i);
      continue;
    }
    NSLog(@"handleShareAction Valid image in position %d", i);
    NSString *srcImageAbsolutePath = [sharedImagesFolderPath stringByAppendingPathComponent:imageSrcPath[i]];
  
    // Save image to sharedImagesFolderPath.
    NSString *imageName = [NSString stringWithFormat:@"%@%@", [[NSUUID UUID] UUIDString], ShareImageFileExtension];
    NSString *path = [sharedImagesFolderPath stringByAppendingPathComponent:imageName];
    NSLog(@"handleShareAction Native module target path %@", srcImageAbsolutePath);
  
    // Add the file URI to imageFinalPaths
    [imageFinalPaths addObject:srcImageAbsolutePath];
  }
  
//   // Delete shared image folder
//   if (![[NSFileManager defaultManager] removeItemAtPath:sharedImagesFolderPath error:&error]) {
//       NSLog(@"Failed to delete shared image folder: %@, error: %@", sharedImagesFolderPath, error);
//   }

  NSLog(@"handleShareAction TEST THREE %@", imageFinalPaths);

  callback(@[imageFinalPaths]);
}

@end