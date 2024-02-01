/**
 * This hook to detech input or text area focus on browser on native doesn't support DOM so default return false
 */
export default function useTackInputFocus(): boolean {
    return false;
}
