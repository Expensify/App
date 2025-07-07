"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Log_1 = require("@libs/Log");
var CONST_1 = require("@src/CONST");
// Function to create a new queue
function createQueue(processItem) {
    // Array to hold the elements of the queue
    var elements = [];
    var isProcessing = false;
    // Function to remove an item from the front of the queue
    function dequeue() {
        return elements.shift();
    }
    // Function to check if the queue is empty
    function isEmpty() {
        return elements.length === 0;
    }
    // Function to process the next item in the queue
    function processNext() {
        return new Promise(function (resolve) {
            if (!isEmpty()) {
                var nextItem = dequeue();
                if (nextItem) {
                    processItem(nextItem)
                        .catch(function (error) {
                        var _a;
                        var errorMessage = (_a = error.message) !== null && _a !== void 0 ? _a : CONST_1.default.ERROR.UNKNOWN_ERROR;
                        Log_1.default.hmmm('Queue error:', { errorMessage: errorMessage });
                    })
                        .finally(function () {
                        processNext().then(resolve);
                    });
                }
            }
            else {
                isProcessing = false;
                resolve();
            }
        });
    }
    // Initiates the processing of items in the queue.
    // Continues to dequeue and process items as long as the queue is not empty.
    // Sets the `isProcessing` flag to true at the start and resets it to false once all items have been processed.
    function run() {
        isProcessing = true;
        return processNext();
    }
    // Adds an item to the queue and initiates processing if not already in progress
    function enqueue(item) {
        elements.push(item);
        if (!isProcessing) {
            run();
        }
    }
    // Function to get the item at the front of the queue without removing it
    function peek() {
        return elements.length > 0 ? elements.at(0) : undefined;
    }
    // Function to get the number of items in the queue
    function size() {
        return elements.length;
    }
    // Return an object with the queue operations
    return {
        run: run,
        enqueue: enqueue,
        dequeue: dequeue,
        isEmpty: isEmpty,
        peek: peek,
        size: size,
    };
}
exports.default = createQueue;
