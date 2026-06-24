import createHeadingSystem from '@components/Overlay/createHeadingSystem';

const {StateContext: PopoverContentStateContext, Title, Description, useRegisteredTitle, useRegisteredDescription} = createHeadingSystem('Popover');

export {PopoverContentStateContext, Title, Description, useRegisteredTitle, useRegisteredDescription};
export type {TitleProps as PopoverTitleProps, DescriptionProps as PopoverDescriptionProps, HeadingState as PopoverContentState} from '@components/Overlay/createHeadingSystem';
