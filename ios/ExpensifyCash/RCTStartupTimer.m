//
//  RCTStartupTimer.m
//  ExpensifyCash
//
//  Created by Marc Glasser on 7/21/21.
//

#import "RCTStartupTimer.h"

@implementation RCTStartupTimer

static FIRTrace *trace = nil;

+ (void)start {
    trace = [FIRPerformance startTraceWithName:@"js_loaded"];
}

RCT_EXPORT_METHOD(stop)
{
  [trace stop];
}

// To export a module named StartupTimer
RCT_EXPORT_MODULE(StartupTimer);

@end
