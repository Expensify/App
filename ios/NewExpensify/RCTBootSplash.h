#import <React/RCTBridgeModule.h>

@interface RCTBootSplash : NSObject <RCTBridgeModule>

+ (void)initWithStoryboard:(NSString * _Nonnull)storyboardName
                  rootView:(UIView * _Nullable)rootView;

@end
