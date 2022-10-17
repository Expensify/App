//
//  ThreadPool.cpp
//  react-native-quick-sqlite
//
//  Created by Oscar on 13.03.22.
//

#include "ThreadPool.h"

ThreadPool::ThreadPool() : done(false)
{
  // This returns the number of threads supported by the system. If the
  // function can't figure out this information, it returns 0. 0 is not good,
  // so we create at least 1
  auto numberOfThreads = std::thread::hardware_concurrency();
  if (numberOfThreads == 0)
  {
    numberOfThreads = 1;
  }

  for (unsigned i = 0; i < numberOfThreads; ++i)
  {
    // The threads will execute the private member `doWork`. Note that we need
    // to pass a reference to the function (namespaced with the class name) as
    // the first argument, and the current object as second argument
    threads.push_back(std::thread(&ThreadPool::doWork, this));
  }
}

// The destructor joins all the threads so the program can exit gracefully.
// This will be executed if there is any exception (e.g. creating the threads)
ThreadPool::~ThreadPool()
{
  // So threads know it's time to shut down
  done = true;

  // Wake up all the threads, so they can finish and be joined
  workQueueConditionVariable.notify_all();
  for (auto &thread : threads)
  {
    if (thread.joinable())
    {
      thread.join();
    }
  }
}

// This function will be called by the server every time there is a request
// that needs to be processed by the thread pool
void ThreadPool::queueWork(std::function<void(void)> task)
{
  // Grab the mutex
  std::lock_guard<std::mutex> g(workQueueMutex);

  // Push the request to the queue
  workQueue.push(task);

  // Notify one thread that there are requests to process
  workQueueConditionVariable.notify_one();
}

// Function used by the threads to grab work from the queue
void ThreadPool::doWork()
{
  // Loop while the queue is not destructing
  while (!done)
  {
    std::function<void(void)> task;

    // Create a scope, so we don't lock the queue for longer than necessary
    {
      std::unique_lock<std::mutex> g(workQueueMutex);
      workQueueConditionVariable.wait(g, [&]
                                      {
        // Only wake up if there are elements in the queue or the program is
        // shutting down
        return !workQueue.empty() || done; });

      // If we are shutting down exit witout trying to process more work
      if (done)
      {
        break;
      }

      task = workQueue.front();
      workQueue.pop();
    }
    ++busy;
    task();
    --busy;
  }
}

void ThreadPool::waitFinished() {
  std::unique_lock<std::mutex> g(workQueueMutex);
  workQueueConditionVariable.wait(g, [&]{ return workQueue.empty() && (busy == 0); });
}