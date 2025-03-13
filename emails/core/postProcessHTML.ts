/**
 * This file is responsible for post-processing HTML produced by react-native-web
 * and our notification code to improve compatibility with email clients.
 */
import declassify from 'declassify';
import juice from 'juice';

export default function postProcessHTML(html: string): string {
    const htmlWithInlinedStyles = juice(html);
    const htmlWithUnusedClassesRemoved = declassify.process(htmlWithInlinedStyles);
    return htmlWithUnusedClassesRemoved;
}
