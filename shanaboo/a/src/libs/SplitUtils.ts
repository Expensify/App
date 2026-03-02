import type {Split} from '@src/types/onyx/Transaction';
import type {Transaction} from '@src/types/onyx';

/**
 * Checks if a split has been manually edited by comparing with default values
 */
function isSplitManuallyEdited(split: Split, defaultAmount: number, defaultPercentage: number): boolean {
    // If amount is different from default, it's been edited
    if (split.amount !== undefined && split.amount !== defaultAmount) {
        return true;
    }
    
    // If percentage is different from default, it's been edited
    if (split.percentage !== undefined && split.percentage !== defaultPercentage) {
        return true;
    }
    
    return false;
}

/**
 * Calculates default split values for even distribution
 */
function calculateDefaultSplitValues(totalAmount: number, totalSplits: number, splitIndex: number): {amount: number; percentage: number} {
    const percentage = Math.floor(100 / totalSplits);
    const remainder = 100 % totalSplits;
    
    // Distribute remainder to last split
    const finalPercentage = splitIndex === totalSplits - 1 ? percentage + remainder : percentage;
    const amount = Math.round((totalAmount * finalPercentage) / 100);
    
    return {
        amount,
        percentage: finalPercentage,
    };
}

/**
 * Adjusts splits to ensure they sum up to the original transaction amount
 * Implements the Classic logic for automatic split adjustment
 */
function adjustSplitsToMatchTotal(splits: Split[], originalTransactionAmount: number, existingSplitTransaction?: Transaction): Split[] {
    if (splits.length === 0) {
        return splits;
    }

    // Create a copy to avoid mutating the original
    const adjustedSplits = [...splits];
    
    // If we're editing existing splits, treat all as manually edited
    if (existingSplitTransaction) {
        return adjustedSplits;
    }

    // Calculate default values for each split
    const defaultValues = splits.map((_, index) => 
        calculateDefaultSplitValues(originalTransactionAmount, splits.length, index)
    );

    // Track which splits have been manually edited
    const manuallyEdited = splits.map((split, index) => 
        isSplitManuallyEdited(split, defaultValues[index].amount, defaultValues[index].percentage)
    );

    // Calculate total of manually edited splits
    let manuallyEditedTotal = 0;
    let manuallyEditedPercentage = 0;
    
    splits.forEach((split, index) => {
        if (manuallyEdited[index]) {
            manuallyEditedTotal += split.amount || 0;
            manuallyEditedPercentage += split.percentage || 0;
        }
    });

    // Calculate remaining amount and percentage for auto-adjusted splits
    const remainingAmount = originalTransactionAmount - manuallyEditedTotal;
    const remainingPercentage = 100 - manuallyEditedPercentage;
    
    // Count auto-adjusted splits
    const autoAdjustedCount = manuallyEdited.filter(edited => !edited).length;
    
    if (autoAdjustedCount === 0) {
        // All splits are manually edited, return as-is
        return adjustedSplits;
    }

    // Calculate new values for auto-adjusted splits
    const autoAdjustedSplits = adjustedSplits.map((split, index) => {
        if (manuallyEdited[index]) {
            // Preserve manually edited values
            return split;
        }

        // Calculate new amount and percentage for this auto-adjusted split
        const newPercentage = Math.floor(remainingPercentage / autoAdjustedCount);
        const remainder = remainingPercentage % autoAdjustedCount;
        
        // Track how many auto-adjusted splits we've processed
        const autoIndex = manuallyEdited.slice(0, index + 1).filter(edited => !edited).length - 1;
        
        let finalPercentage = newPercentage;
        if (autoIndex === autoAdjustedCount - 1) {
            // Last auto-adjusted split gets the remainder
            finalPercentage += remainder;
        }
        
        const newAmount = Math.round((originalTransactionAmount * finalPercentage) / 100);
        
        return {
            ...split,
            amount: newAmount,
            percentage: finalPercentage,
        };
    });

    return autoAdjustedSplits;
}

/**
 * Handles adding a new split to existing splits with automatic redistribution
 */
function addSplitAndRedistribute(existingSplits: Split[], originalTransactionAmount: number): Split[] {
    if (existingSplits.length === 0) {
        return [{
            email: '',
            accountID: -1,
            amount: originalTransactionAmount,
            percentage: 100,
        }];
    }

    // Create new split with default values
    const newSplit = {
        email: '',
        accountID: -1,
        amount: 0,
        percentage: 0,
    };

    const updatedSplits = [...existingSplits, newSplit];
    
    // Apply automatic adjustment logic
    return adjustSplitsToMatchTotal(updatedSplits, originalTransactionAmount);
}

export {
    isSplitManuallyEdited,
    calculateDefaultSplitValues,
    adjustSplitsToMatchTotal,
    addSplitAndRedistribute,
};