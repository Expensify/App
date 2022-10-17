/**
 * @file
 * Native entry point for Onyx
 * This file is resolved by react-native projects
 */
import Onyx from './lib';

// We resolve pure source for react-native projects and let `metro` bundle it
// We can test small changes directly from the parent project `node_modules/react-native-onyx` source
export * from './lib';
export default Onyx;
