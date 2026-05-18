/**
 * GUARDIAN SECURITY SYSTEM
 * Protects the frontend from casual inspection and unauthorized code access.
 */

export const initializeGuardian = () => {
  if (typeof window === 'undefined') return;

  // 1. Disable Right-Click Context Menu
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  // 2. Disable Common Developer Tools Shortcuts
  document.addEventListener('keydown', (e) => {
    // F12
    if (e.key === 'F12') {
      e.preventDefault();
    }
    // Ctrl+Shift+I (Windows/Linux) or Cmd+Option+I (Mac)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
      e.preventDefault();
    }
    // Ctrl+Shift+J (Console)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
      e.preventDefault();
    }
    // Ctrl+U (View Source)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) {
      e.preventDefault();
    }
    // Ctrl+S (Save Page)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'S' || e.key === 's')) {
      e.preventDefault();
    }
  });

  // 3. Detect Console Opening (Basic deterrent)
  let devtools = function() {};
  devtools.toString = function() {
    return 'Guardian: Access Restricted';
  }

  console.log('%c STOP! ', 'color: red; font-size: 40px; font-weight: bold; -webkit-text-stroke: 1px black;');
  console.log('%cThis is a secure area. Unauthorized inspection is prohibited.', 'font-size: 18px;');
};
