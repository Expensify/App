//
//  OriginImageRequestHandler.mm
//  NewExpensify
//
//  Created by ntdiary on 2022/8/8.
//
//  Use this handler to parse images uri returned by react-native-image-picker
//  instead of the default `RCTImageLoader.mm`
//  See https://github.com/facebook/react-native/issues/33760#issuecomment-1196562161

#import <Foundation/Foundation.h>
#import <ReactCommon/RCTTurboModule.h>

#import <MobileCoreServices/MobileCoreServices.h>
#import <React/RCTUtils.h>

#import "OriginImageRequestHandler.h"

@interface OriginImageRequestHandler() <RCTTurboModule>

@end

@implementation OriginImageRequestHandler
{
  NSOperationQueue *_fileQueue;
}

RCT_EXPORT_MODULE()

- (void)invalidate
{
  [_fileQueue cancelAllOperations];
  _fileQueue = nil;
}

/**
 * Only used for parsing the png/jpg image in the application home directory
 */
- (BOOL)canHandleRequest:(NSURLRequest *)request
{
  return [request.URL.scheme caseInsensitiveCompare:@"file"] == NSOrderedSame
  && RCTIsLocalAssetURL(request.URL)
  && !RCTIsBundleAssetURL(request.URL);
}


/**
 * Send a network request and call the delegate with the response data.
 */
- (NSOperation *)sendRequest:(NSURLRequest *)request
                withDelegate:(id<RCTURLRequestDelegate>)delegate
{
  // Lazy setup
  if (!_fileQueue) {
    _fileQueue = [NSOperationQueue new];
    _fileQueue.maxConcurrentOperationCount = 4;
  }

  __weak __block NSBlockOperation *weakOp;
  __block NSBlockOperation *op = [NSBlockOperation blockOperationWithBlock:^{

    // Get content length
    NSError *error = nil;
    NSFileManager *fileManager = [NSFileManager new];
    NSDictionary<NSString *, id> *fileAttributes = [fileManager attributesOfItemAtPath:request.URL.path error:&error];
    if (!fileAttributes) {
      [delegate URLRequest:weakOp didCompleteWithError:error];
      return;
    }

    // Get mime type
    NSString *fileExtension = [request.URL pathExtension];
    NSString *UTI = (__bridge_transfer NSString *)UTTypeCreatePreferredIdentifierForTag(
      kUTTagClassFilenameExtension, (__bridge CFStringRef)fileExtension, NULL);
    NSString *contentType = (__bridge_transfer NSString *)UTTypeCopyPreferredTagWithClass(
      (__bridge CFStringRef)UTI, kUTTagClassMIMEType);

    // Send response
    NSURLResponse *response = [[NSURLResponse alloc] initWithURL:request.URL
                                                        MIMEType:contentType
                                           expectedContentLength:[fileAttributes[NSFileSize] ?: @-1 integerValue]
                                                textEncodingName:nil];

    [delegate URLRequest:weakOp didReceiveResponse:response];

    // Load data
    NSData *data = [NSData dataWithContentsOfURL:request.URL
                                         options:NSDataReadingMappedIfSafe
                                           error:&error];
    if (data) {
      [delegate URLRequest:weakOp didReceiveData:data];
    }
    [delegate URLRequest:weakOp didCompleteWithError:error];
  }];

  weakOp = op;
  [_fileQueue addOperation:op];
  return op;
}

/**
 * Cancel the request
 */
- (void)cancelRequest:(NSOperation *)op
{
  [op cancel];
}

/**
 * Should return nullptr. This method may be used later to support C++ TurboModules.
 * See https://reactnative.dev/docs/new-architecture-app-modules-ios
 */
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return nullptr;
}

/**
 * Should have higher priority than RCTImageLoader.mm
 */
- (float)handlerPriority
{
  return 4;
}

@end

Class OriginImageRequestHandlerCls(void) {
  return OriginImageRequestHandler.class;
}
