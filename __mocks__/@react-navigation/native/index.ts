import {useIsFocused as realUseIsFocused, useTheme as realUseTheme} from '@react-navigation/native';

// We only want these mocked for storybook, not jest
const useIsFocused: typeof realUseIsFocused = process.env.NODE_ENV === 'test' ? realUseIsFocused : () => true;

const useTheme = process.env.NODE_ENV === 'test' ? realUseTheme : () => ({});

export * from '@react-navigation/core';
export {useIsFocused, useTheme};
