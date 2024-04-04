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

RCT_EXPORT_METHOD(checkPdf:(NSString *)url callback: (RCTResponseSenderBlock)callback)
{
  NSURL *fileURL = [NSURL fileURLWithPath:url];
  CGPDFDocumentRef pdfDocument = CGPDFDocumentCreateWithURL((__bridge CFURLRef)fileURL);
  BOOL isValid = (pdfDocument != NULL);
  if (pdfDocument) {
      CGPDFDocumentRelease(pdfDocument);
      callback(@[@YES]);
  }
  callback(@[@isValid]);
}
@end
