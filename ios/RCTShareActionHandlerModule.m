#import <Foundation/Foundation.h>
#import <AVFoundation/AVFoundation.h>
#import "RCTShareActionHandlerModule.h"
#import <React/RCTLog.h>
#import <UniformTypeIdentifiers/UniformTypeIdentifiers.h>

NSString *const ShareExtensionGroupId = @"group.com.expensify.new";
NSString *const ShareExtensionFilesKey = @"sharedFiles";

@implementation RCTShareActionHandlerModule

RCT_EXPORT_MODULE(ShareActionHandler);

RCT_EXPORT_METHOD(processFiles:(RCTResponseSenderBlock)callback) {
    RCTLogInfo(@"Processing share extension files");
    NSArray *fileFinalPaths = [self fileListFromSharedContainer];
    NSArray *processedFiles = [self processFileList:fileFinalPaths];
    callback(@[processedFiles]);
}

- (NSArray *)fileListFromSharedContainer {
    NSUserDefaults *defaults = [[NSUserDefaults alloc] initWithSuiteName:ShareExtensionGroupId];
    NSURL *groupURL = [[NSFileManager defaultManager] containerURLForSecurityApplicationGroupIdentifier:ShareExtensionGroupId];
    if (groupURL == NULL) {
        NSLog(@"Missing app group url");
        return @[];
    }
    NSURL *sharedFilesFolderPathURL = [groupURL URLByAppendingPathComponent:ShareExtensionFilesKey];
    NSString *sharedFilesFolderPath = [sharedFilesFolderPathURL path];
    [defaults removeObjectForKey:ShareExtensionFilesKey];
    [defaults synchronize];
    
    NSError *error = nil;
    NSArray *fileSrcPath = [[NSFileManager defaultManager] contentsOfDirectoryAtPath:sharedFilesFolderPath error:&error];
    if (fileSrcPath.count == 0) {
        NSLog(@"Failed to find files in 'sharedFilesFolderPath' %@", sharedFilesFolderPath);
        return @[];
    }
    
    NSMutableArray *fileFinalPaths = [NSMutableArray array];
    for (NSString *source in fileSrcPath) {
        if (source == NULL) {
            NSLog(@"Invalid file");
            continue;
        }
        NSString *srcFileAbsolutePath = [sharedFilesFolderPath stringByAppendingPathComponent:source];
        [fileFinalPaths addObject:srcFileAbsolutePath];
    }
    
    return fileFinalPaths;
}

- (NSArray *)processFileList:(NSArray *)filePaths {
    NSMutableArray *fileObjectsArray = [[NSMutableArray alloc] init];
    for (NSString *filePath in filePaths) {
        NSDictionary *fileDict = [self processSingleFile:filePath];
        if (fileDict) {
            [fileObjectsArray addObject:fileDict];
        }
    }
    return fileObjectsArray;
}

- (NSDictionary *)processSingleFile:(NSString *)filePath {
    NSString *extension = [filePath pathExtension];
    NSString *fileName = [filePath lastPathComponent];
    NSString *fileContent, *mimeType;
    CGFloat aspectRatio = 1.0;
    BOOL isTextToReadFromFile = [fileName containsString:@"text_to_read"];
    NSDictionary *dict;
    NSError *error;
    
    if (isTextToReadFromFile) {
        fileContent = [NSString stringWithContentsOfFile:filePath encoding:NSUTF8StringEncoding error:&error];
        if (error) {
            NSLog(@"Failed to read file: %@, error: %@", filePath, error);
            return nil;
        }
        mimeType = @"txt";
    } else {
        UTType *type = [UTType typeWithFilenameExtension:extension];
        mimeType = type.preferredMIMEType ?: @"application/octet-stream";
        NSURL *fileURL = [NSURL fileURLWithPath:filePath];
        if ([mimeType hasPrefix:@"video/"]) {
            aspectRatio = [self videoAspectRatio:fileURL];
        } else if ([mimeType hasPrefix:@"image/"]) {
            aspectRatio = [self imageAspectRatio:fileURL];
        }
        fileContent = [@"file://" stringByAppendingString:filePath];
    }
    
    NSString *identifier = [self uniqueIdentifierForFilePath:filePath];
    NSString *timestamp = [NSString stringWithFormat:@"%.0f", ([[NSDate date] timeIntervalSince1970] * 1000)];
    
    dict = @{
        @"id": identifier,
        @"content": fileContent,
        @"mimeType": mimeType,
        @"processedAt": timestamp,
        @"aspectRatio": @(aspectRatio)
    };
    return dict;
}

- (CGFloat)videoAspectRatio:(NSURL *)url {
    AVURLAsset *asset = [AVURLAsset URLAssetWithURL:url options:nil];
    AVAssetTrack *track = [[asset tracksWithMediaType:AVMediaTypeVideo] firstObject];
    if (track) {
        CGSize size = CGSizeApplyAffineTransform(track.naturalSize, track.preferredTransform);
        return size.height != 0 ? fabs(size.width / size.height) : 1;
    }
    return 1;
}

- (CGFloat)imageAspectRatio:(NSURL *)url {
    UIImage *image = [UIImage imageWithData:[NSData dataWithContentsOfURL:url]];
    if (image) {
        return image.size.height != 0 ? image.size.width / image.size.height : 1;
    }
    return 1;
}

- (NSString *)uniqueIdentifierForFilePath:(NSString *)filePath {
    NSTimeInterval timestampInterval = [[NSDate date] timeIntervalSince1970] * 1000;
    NSString *timestamp = [NSString stringWithFormat:@"%.0f", timestampInterval];
    return [NSString stringWithFormat:@"%@_%@", timestamp, filePath];
}

@end
