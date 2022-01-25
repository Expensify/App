//
//  RCTBootSplash.h
//  NewExpensify
//
//  Created by Mathieu Acthernoene on 07/01/2022.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTRootView.h>

@interface RCTBootSplash : NSObject <RCTBridgeModule>

+ (void)initWithStoryboard:(NSString * _Nonnull)storyboardName
                  rootView:(RCTRootView * _Nullable)rootView;

@end
