//
//  RCTCheckPDFDocument.m
//  NewExpensify
//
//  Created by Jakub Butkiewicz on 04/04/2024.
//

#import <Foundation/Foundation.h>
#import "RCTCheckPDFDocument.h"
#import <CoreGraphics/CoreGraphics.h>

@implementation RCTCheckPDFDocument

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(checkPdf:(NSString *)fileurl callback: (RCTResponseSenderBlock)callback)
{
  NSString *path = [[NSBundle mainBundle] pathForResource:@"booking" ofType:@"pdf"];//Path of your PDF
  
  NSData *data = [[NSFileManager defaultManager] contentsAtPath:path];
  
  CGDataProviderRef provider = CGDataProviderCreateWithCFData((__bridge CFDataRef)data);
  
  CGPDFDocumentRef document = CGPDFDocumentCreateWithProvider(provider);
  

  if (document == nil) {
      NSLog(@"The PDF is corrupted");//Can't be opened
  }
  CGDataProviderRelease(provider);
  CGPDFDocumentRelease(document);
}
@end
