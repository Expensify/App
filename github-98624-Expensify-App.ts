// lib/AttachmentUtils.ts
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

/**
 * Safely copies a file to the local cache directory
 * Handles cases where the source file might not exist or paths are invalid
 */
export async function copyFileToCache(sourceUri: string, fileName: string): Promise<string> {
  try {
    // Ensure source file exists before attempting copy
    const sourceInfo = await FileSystem.getInfoAsync(sourceUri);
    if (!sourceInfo.exists) {
      throw new Error(`Source file does not exist: ${sourceUri}`);
    }

    // Generate destination path in cache directory
    const destinationUri = `${FileSystem.cacheDirectory}${fileName}`;
    
    // Copy the file to cache
    const result = await FileSystem.copyAsync({
      from: sourceUri,
      to: destinationUri,
    });
    
    return result.uri;
  } catch (error) {
    // Log the error for debugging
    console.error('Failed to copy file to cache:', error);
    
    // For Android, try to handle content URIs differently
    if (Platform.OS === 'android' && sourceUri.startsWith('content://')) {
      try {
        // Use content resolver to get file descriptor and copy
        const destinationUri = `${FileSystem.cacheDirectory}${fileName}`;
        const result = await FileSystem.copyAsync({
          from: sourceUri,
          to: destinationUri,
        });
        return result.uri;
      } catch (copyError) {
        console.error('Failed to copy content URI:', copyError);
        throw new Error(`ENOENT: Cannot copy attachment to cache: ${copyError}`);
      }
    }
    
    throw new Error(`ENOENT: Cannot copy attachment to cache: ${error}`);
  }
}

/**
 * Gets the file info and ensures the file exists
 */
export async function getFileInfo(uri: string): Promise<FileSystem.FileInfo> {
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists) {
    throw new Error(`File does not exist: ${uri}`);
  }
  return info;
}