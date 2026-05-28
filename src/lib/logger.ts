type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogContext {
  [key: string]: unknown
}

function log(level: LogLevel, namespace: string, message: string, context?: LogContext) {
  const timestamp = new Date().toISOString()
  const entry = {
    timestamp,
    level: level.toUpperCase(),
    namespace,
    message,
    ...(context || {}),
  }

  if (process.env.NODE_ENV === 'development') {
    const color =
      level === 'error' ? '\x1b[31m' :
      level === 'warn' ? '\x1b[33m' :
      level === 'debug' ? '\x1b[36m' : '\x1b[32m'
    // eslint-disable-next-line no-console
    console.log(`${color}[${entry.level}]\x1b[0m ${namespace}: ${message}`, context || '')
  }
}

export const logger = {
  info: (namespace: string, message: string, context?: LogContext) => log('info', namespace, message, context),
  warn: (namespace: string, message: string, context?: LogContext) => log('warn', namespace, message, context),
  error: (namespace: string, message: string, context?: LogContext) => log('error', namespace, message, context),
  debug: (namespace: string, message: string, context?: LogContext) => log('debug', namespace, message, context),
}
