// Enhanced Service Worker with Professional Notification System - SPAM-OPTIMIZED
const CACHE_NAME = 'studyforexams-v8';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icon-192.png'
];

// Install, Activate, and Fetch listeners
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(urlsToCache)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(names => Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => e.respondWith(fetch(e.request).catch(() => caches.match(e.request))));

// Live Timer State
let timerInterval = null;
let timeLeftInWorker = 0;
let timerModeInWorker = 'work';
let isTimerPausedInWorker = false;

// ANTI-SPAM: Professional notification update function
function updateLiveNotification() {
  const mins = Math.floor(timeLeftInWorker / 60).toString().padStart(2, '0');
  const secs = (timeLeftInWorker % 60).toString().padStart(2, '0');
  
  const sessionTypes = {
    work: 'Focus Session',
    shortBreak: 'Short Break',
    longBreak: 'Long Break'
  };
  
  const title = isTimerPausedInWorker 
    ? `Paused - ${sessionTypes[timerModeInWorker]}` 
    : `${sessionTypes[timerModeInWorker]} - ${mins}:${secs}`;
  
  self.registration.showNotification(title, {
    body: 'Session in progress',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'pomodoro-live-timer',
    silent: true,
    renotify: false,
    requireInteraction: false,
    timestamp: Date.now(),
    actions: [
      { 
        action: 'pause-resume', 
        title: isTimerPausedInWorker ? 'Resume' : 'Pause'
      },
      { 
        action: 'stop', 
        title: 'Stop'
      }
    ],
    data: {
      type: 'live-timer',
      mode: timerModeInWorker,
      timeLeft: timeLeftInWorker,
      legitimate: true
    }
  });
}

// Enhanced message listener
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  if (type === 'START_TIMER') {
    timeLeftInWorker = payload.timeLeft;
    timerModeInWorker = payload.mode;
    isTimerPausedInWorker = false;
    
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
      if (!isTimerPausedInWorker) {
        timeLeftInWorker -= 1;
        updateLiveNotification();

        if (timeLeftInWorker <= 0) {
          clearInterval(timerInterval);
          timerInterval = null;
          
          self.registration.getNotifications({ tag: 'pomodoro-live-timer' }).then(notifications => {
            notifications.forEach(notification => notification.close());
          });
          
          self.clients.matchAll().then(clients => {
            clients.forEach(client => client.postMessage({ 
              type: 'TIMER_COMPLETE',
              mode: timerModeInWorker 
            }));
          });
          
          showCompletionNotification(timerModeInWorker);
        }
      }
    }, 1000);

    updateLiveNotification();
  }

  if (type === 'PAUSE_RESUME_TIMER') {
    isTimerPausedInWorker = !isTimerPausedInWorker;
    updateLiveNotification();
  }

  if (type === 'STOP_TIMER') {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
    isTimerPausedInWorker = false;
    self.registration.getNotifications({ tag: 'pomodoro-live-timer' }).then(notifications => {
      notifications.forEach(notification => notification.close());
    });
  }

  // --- ADD THIS NEW BLOCK ---
  // This handles the 'Reset All' button from the main app.
  // It performs a complete shutdown of the timer and closes the widget.
  if (type === 'CLOSE_WIDGET') {
    // 1. Stop the countdown interval immediately.
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    // 2. Reset the internal state of the worker.
    isTimerPausedInWorker = false;
    timeLeftInWorker = 0;

    // 3. Find the notification "widget" by its tag and explicitly close it. This is the most important step.
    self.registration.getNotifications({ tag: 'pomodoro-live-timer' }).then(notifications => {
      notifications.forEach(notification => notification.close());
    });
  }
  // --- END OF NEW BLOCK ---

  if (type === 'TRIGGER_CONFETTI') {
    self.clients.matchAll().then(clients => {
      clients.forEach(client => client.postMessage({ type: 'SHOW_CONFETTI' }));
    });
  }
});

// ANTI-SPAM: Professional completion notification
function showCompletionNotification(mode) {
  const completionMessages = {
    work: {
      title: 'Focus Session Complete',
      body: 'Great work! Time for a break.',
      actions: [
        { action: 'start-break', title: 'Start Break' },
        { action: 'view-progress', title: 'View Progress' }
      ]
    },
    shortBreak: {
      title: 'Break Complete',
      body: 'Ready for your next focus session?',
      actions: [
        { action: 'start-work', title: 'Start Focus' },
        { action: 'extend-break', title: 'Extend Break' }
      ]
    },
    longBreak: {
      title: 'Long Break Complete',
      body: 'Refreshed and ready for productive work!',
      actions: [
        { action: 'start-work', title: 'Start Focus' },
        { action: 'view-stats', title: 'View Stats' }
      ]
    }
  };

  const config = completionMessages[mode];
  
  self.registration.showNotification(config.title, {
    body: config.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: `completion-${mode}`,
    requireInteraction: true,
    timestamp: Date.now(),
    actions: config.actions,
    data: {
      type: 'completion',
      mode: mode,
      timestamp: Date.now(),
      legitimate: true
    }
  });
}

// Enhanced notification click handler
self.addEventListener('notificationclick', (event) => {
  const action = event.action;
  const data = event.notification.data;
  
  event.notification.close();
  
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      if (action === 'pause-resume' || action === 'stop') {
        client.postMessage({ type: 'LIVE_TIMER_ACTION', action: action });
      } else if (action === 'start-break' || action === 'start-work') {
        client.postMessage({ type: 'COMPLETION_ACTION', action: action });
      } else if (action === 'view-progress') {
        client.postMessage({ type: 'NAVIGATE', path: '/progress' });
      } else if (action === 'extend-break') {
        client.postMessage({ type: 'EXTEND_BREAK' });
      } else if (action === 'view-stats') {
        client.postMessage({ type: 'NAVIGATE', path: '/progress' });
      }
    });
  });

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});