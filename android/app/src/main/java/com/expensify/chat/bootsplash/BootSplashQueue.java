package com.expensify.chat.bootsplash;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import java.util.Vector;

/**
 * Represents a first-in-first-out (FIFO) thread safe queue of objects.
 * Its source code is based on Java internal <code>Stack</code>.
 */
public class BootSplashQueue<T> extends Vector<T> {

  @Nullable
  public synchronized T shift() {
    if (size() == 0) {
      return null;
    }

    T item = elementAt(0);
    removeElementAt(0);

    return item;
  }

  public void push(@NonNull T item) {
    addElement(item);
  }
}
