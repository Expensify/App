//
//  RCTCheckPDFDocument.m
//  NewExpensify
//
//  Created by Jakub Butkiewicz on 04/04/2024.
//

#import <Foundation/Foundation.h>
#import "RCTCheckPDFDocument.h"

@implementation RCTCheckPDFDocument

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(checkPdf:(NSString *)fileurl callback: (RCTResponseSenderBlock)callback)
{
  NSURL *url = [NSURL URLWithString:fileurl];
  NSFileManager *fileManager = [NSFileManager defaultManager];
  NSData *ns = [NSData dataWithContentsOfURL:url];
      if ([ns length] >= 1024) {
          uint8_t pdfBytes[] = { 0x25, 0x50, 0x44, 0x46 };
          NSData *pdfHeader = [NSData dataWithBytes:pdfBytes length:4];
          NSRange range = [ns rangeOfData:pdfHeader options:NSDataSearchAnchored range:NSMakeRange(0, 1024)];
          if (range.length > 0) {
            callback(@[@YES]);
          }
          else {
            callback(@[@NO]);
          }
      }
}
@end
