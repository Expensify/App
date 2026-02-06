//
//  RCTStartupTimer.m
//  NewExpensify
//
//  Created by Marc Glasser on 7/21/21.
//

#import "RCTStartupTimer.h"

@implementation RCTStartupTimer

static FIRTrace *trace = nil;

+ (void)start {
  #if DEBUG
    // We don't want to record this on debug since it will skew the metrics we collect
    NSLog(@"[StartupTimer] Metric tracing disabled in DEBUG");
  #else
    trace = [FIRPerformance startTraceWithName:@"js_loaded"];
  #endif
}

RCT_EXPORT_METHOD(stop)
{
  if (trace) {
    [trace stop];
  }
}

// To export a module named StartupTimer
RCT_EXPORT_MODULE(StartupTimer);

@end
