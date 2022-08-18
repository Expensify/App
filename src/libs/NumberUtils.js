import CONST from "../CONST";

/**
 * Generates a random positive 64 bit integer by randomly generating the left half and right half and concatenating them
 * @returns {string} randomly generated 64 bit string
 */
function rand64() {
    // Max 64-bit signed:
    // 9,223,372,036,854,775,807
    // The left part of the max 64-bit number *+1* because we're flooring it
    let left = Math.floor(Math.random() * CONST.MAX_64BIT_LEFT_HALF + 1);
  
    // The right part of the max 64-bit number *+1* for the same reason
    let rest = Math.floor(Math.random() * CONST.MAX_64BIT_RIGHT_HALF + 1);
  
    // If the top is any number but the highest one, we can actually have any value for the rest
    if (left != CONST.MAX_64BIT_LEFT_HALF) {
      rest = Math.floor(Math.random() * 1000000000);
    }
  
    // Pad the right with zeros
    let restString = rest.toString().padStart(9, '0');
  
    return left + restString;
  }
  