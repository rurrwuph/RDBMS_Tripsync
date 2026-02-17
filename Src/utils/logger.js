const fs = require('fs');
const path = require('path');

// Log file path
const logFile = path.join(process.cwd(), 'server.log');

// Clear log file on startup (optional, user might want to persist, but for "cleaning" first time this might be good)
// fs.writeFileSync(logFile, ''); 

const logStream = fs.createWriteStream(logFile, { flags: 'a' });

// Store original console methods
const originalLog = console.log;
const originalError = console.error;

// Patterns to exclude from file redirection (keep in console)
const CONSOLE_ONLY_PATTERNS = [
    'TripSync Backend active on port',
    'Connected to Neon PostgreSQL at'
];

function formatMessage(args) {
    const timestamp = new Date().toISOString();
    const message = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
    ).join(' ');
    return `[${timestamp}] ${message}\n`;
}

// Override console.log
console.log = function (...args) {
    const message = args.join(' ');
    const shouldShowInConsole = CONSOLE_ONLY_PATTERNS.some(pattern => message.includes(pattern));

    if (shouldShowInConsole) {
        originalLog.apply(console, args);
    } else {
        logStream.write(formatMessage(args));
    }
};

// Override console.error
console.error = function (...args) {
    const message = formatMessage(args);
    logStream.write(`[ERROR] ${message}`);
};

module.exports = {
    originalLog,
    originalError
};
