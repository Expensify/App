## Proposal

### Please re-state the problem that we are trying to solve in this issue.
The "reason" text for a hold request is duplicated when using the "Copy to clipboard" functionality. Instead of copying the intended text once, it pastes it twice for example, "7" is pasted as "77".
### What is the root cause of that problem?
The duplication issue arises from how the clipboard functionality concatenates all text elements in the message array when copying the hold request reason. Since the hold reason is included twice in the array (once as part of a structured message and once as the reason itself), it results in the reason being duplicated upon pasting.


### What changes do you think we should make in order to solve the problem?
<!-- DO NOT POST CODE DIFFS -->

To address this issue, we should modify the clipboard copying functionality to recognize the specific context of a hold request. This involves checking if the action being copied is a hold request and, if so, ensuring that only the unique parts of the message are concatenated for the clipboard. This could be achieved by implementing a check to identify duplicate strings within the message array or by adjusting the logic to only copy the first occurrence of the hold reason text.


### What alternative solutions did you explore? (Optional)
One alternative solution is  to adjust the backend logic to ensure that the reason text is only included once in the message array for hold requests. 

<!---

