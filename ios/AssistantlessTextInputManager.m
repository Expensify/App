#import "AssistantlessTextInputManager.h"
#import <UIKit/UIKit.h>

@interface AssistantlessTextInput : UITextField
@end

@implementation AssistantlessTextInput
// Customize any UITextField behavior here if needed
// Override this method to replace the keyboard with an empty input view
- (UIView *)inputView {
  // Return an empty UIView to suppress the keyboard
  return [[UIView alloc] initWithFrame:CGRectZero];
}
@end

@implementation AssistantlessTextInputManager

RCT_EXPORT_MODULE(AssistantlessTextInput)

// Create and return the UITextField view
- (UIView *)view {
  AssistantlessTextInput *textField = [[AssistantlessTextInput alloc] init];
  textField.borderStyle = UITextBorderStyleRoundedRect; // Add a border for visibility
  // Disable the shortcuts bar on iPads
  if (@available(iOS 9.0, *)) {
    textField.inputAssistantItem.leadingBarButtonGroups = @[];
    textField.inputAssistantItem.trailingBarButtonGroups = @[];
  }

  return textField;
}

// Optional: You can expose any additional properties or methods for the text field here
// Export the 'placeholder' prop to React Native
RCT_EXPORT_VIEW_PROPERTY(placeholder, NSString)

// Export the 'text' prop to React Native
RCT_EXPORT_VIEW_PROPERTY(text, NSString)

@end
