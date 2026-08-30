// Assuming this is in a React Native component file like CommentComposer.js
// The issue likely stems from not properly resetting the composer state after saving an edit

import React, { useState, useEffect } from 'react';
import { TextInput, Button } from 'react-native';

const CommentComposer = ({ initialComment, onSave, isEditing }) => {
  const [comment, setComment] = useState(initialComment || '');
  
  // Reset comment when editing mode changes or initial comment changes
  useEffect(() => {
    if (!isEditing) {
      setComment('');
    } else if (initialComment) {
      setComment(initialComment);
    }
  }, [isEditing, initialComment]);

  const handleSave = () => {
    if (comment.trim()) {
      onSave(comment);
      // Clear the composer after successful save
      setComment('');
    }
  };

  return (
    <React.Fragment>
      <TextInput
        value={comment}
        onChangeText={setComment}
        placeholder="Add a comment..."
        style={{ borderWidth: 1, padding: 8 }}
      />
      <Button title="Save" onPress={handleSave} disabled={!comment.trim()} />
    </React.Fragment>
  );
};

export default CommentComposer;