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
  // Convert the file URL from a string to an NSURL object
  NSURL *url = [NSURL URLWithString:fileurl];

  NSFileManager *fileManager = [NSFileManager defaultManager];

  // Read the contents of the file at the URL into an NSData object
  NSData *ns = [NSData dataWithContentsOfURL:url];

  // Check if the file is at least 1024 bytes
  if ([ns length] >= 1024) {
    // Define the first four bytes of a PDF file
    uint8_t pdfBytes[] = { 0x25, 0x50, 0x44, 0x46 };

    // Create an NSData object with the PDF bytes
    NSData *pdfHeader = [NSData dataWithBytes:pdfBytes length:4];

    // Check if the first 1024 bytes of the file contain the PDF header
    NSRange range = [ns rangeOfData:pdfHeader options:NSDataSearchAnchored range:NSMakeRange(0, 1024)];

    // If the PDF header is found, call the callback with YES
    if (range.length > 0) {
      callback(@[@YES]);
    }
    // If the PDF header is not found, call the callback with NO
    else {
      callback(@[@NO]);
    }
  }
}
@end
