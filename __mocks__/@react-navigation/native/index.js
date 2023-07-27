import {useIsFocused as realUseIsFocused} from '@react-navigation/native';

const useIsFocused = process.env.NODE_ENV === 'test' ? realUseIsFocused : () => true;

export * from '@react-navigation/core';
export * from '@react-navigation/native';
export {useIsFocused};
