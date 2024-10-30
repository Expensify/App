
#import <Foundation/Foundation.h>
#import "RCTShareActionHandlerModule.h"
#import <React/RCTLog.h>
#import <UniformTypeIdentifiers/UniformTypeIdentifiers.h>

NSString *const ShareExtensionGroupIdentifier = @"group.com.expensify.new";
NSString *const ShareExtensionFilesKey = @"sharedFiles";

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

  NSURL *sharedFilesFolderPathURL = [groupURL URLByAppendingPathComponent:ShareExtensionFilesKey];
  NSString *sharedFilesFolderPath = [sharedFilesFolderPathURL path];

  [defaults setObject:NULL forKey:ShareExtensionFilesKey];
  [defaults synchronize];

  NSError *error = nil;
  NSArray *fileSrcPath = [[NSFileManager defaultManager] contentsOfDirectoryAtPath:sharedFilesFolderPath error:&error];
  NSLog(@"handleShareAction fileSrcPath %@", fileSrcPath);
  if (fileSrcPath.count == 0) {
      NSLog(@"handleShareAction Failed to find files in 'sharedFilesFolderPath' %@", sharedFilesFolderPath);
      return;
  }

  NSLog(@"handleShareAction shared %lu files", fileSrcPath.count);

  NSMutableArray *fileFinalPaths = [NSMutableArray array];

  for (NSString *source in fileSrcPath) {
    if (source == NULL) {
        NSLog(@"handleShareAction Invalid file");
        continue;
    }
    NSString *srcFileAbsolutePath = [sharedFilesFolderPath stringByAppendingPathComponent:source];
    [fileFinalPaths addObject:srcFileAbsolutePath];
  }
  
  NSMutableArray *fileObjectsArray = [[NSMutableArray alloc] init];

  for (NSString *filePath in fileFinalPaths) {
      NSString *extension = [filePath pathExtension];
      NSString *fileName = [filePath lastPathComponent];

      // Check if filename contains "text_to_read"
      if ([fileName containsString:@"text_to_read"]) {
          NSError *fileError = nil;
          NSString *fileContent = [NSString stringWithContentsOfFile:filePath encoding:NSUTF8StringEncoding error:&fileError];
          if (fileError) {
              NSLog(@"Failed to read file: %@, error: %@", filePath, fileError);
              continue;
          }

          NSTimeInterval timestampInterval = [[NSDate date] timeIntervalSince1970] * 1000;
          NSString *timestamp = [NSString stringWithFormat:@"%.0f", timestampInterval];
          NSString *identifier = [NSString stringWithFormat:@"%@_%@", (unsigned long)timestamp, filePath];

          NSDictionary *dict = @{
              @"id" : identifier,
              @"content" : fileContent,
              @"mimeType" : @"txt",
              @"processedAt" : timestamp
          };

          [fileObjectsArray addObject:dict];
          continue;
      }

      UTType *type = [UTType typeWithFilenameExtension:extension conformingToType:UTTypeData];
      NSString *mimeType = type.preferredMIMEType ? : @"application/octet-stream";
      
      NSTimeInterval timestampInterval = [[NSDate date] timeIntervalSince1970] * 1000;
      NSString *timestamp = [NSString stringWithFormat:@"%.0f", timestampInterval];
      NSString *identifier = [NSString stringWithFormat:@"%@_%@", (unsigned long)timestamp, filePath];
      
      CGFloat aspectRatio = 1.0;
      UIImage *image = [UIImage imageWithContentsOfFile:filePath];
      if (image) {
          CGFloat width = image.size.width;
          CGFloat height = image.size.height;
          
          if (height != 0) {
              aspectRatio = width / height;
          }
      } else {
          NSLog(@"Failed to load image from path: %@", filePath);
      }

    NSDictionary *dict = @{
        @"id" : identifier,
        @"content" : filePath,
        @"mimeType" : mimeType,
        @"processedAt" : timestamp,
        @"aspectRatio" : @(aspectRatio)
    };

    [fileObjectsArray addObject:dict];
    }

    callback(@[fileObjectsArray]);
}

@end