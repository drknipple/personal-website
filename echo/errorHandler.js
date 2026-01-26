// Error handling utilities: standardized error handling, user-friendly messages, error recovery

/**
 * Error types for categorization
 */
export const ErrorType = {
    NETWORK: 'network',
    VALIDATION: 'validation',
    PERMISSION: 'permission',
    NOT_FOUND: 'not_found',
    SERVER: 'server',
    UNKNOWN: 'unknown'
};

/**
 * Determine error type from error object
 */
export function getErrorType(error) {
    if (!error) return ErrorType.UNKNOWN;
    
    const message = error.message || error.toString() || '';
    const code = error.code || error.statusCode || error.status;
    
    // Network errors
    if (message.includes('fetch') || message.includes('network') || 
        message.includes('Failed to fetch') || message.includes('NetworkError') ||
        code === 'ECONNREFUSED' || code === 'ETIMEDOUT') {
        return ErrorType.NETWORK;
    }
    
    // Permission errors
    if (message.includes('permission') || message.includes('unauthorized') ||
        message.includes('forbidden') || message.includes('row-level security') ||
        code === 401 || code === 403) {
        return ErrorType.PERMISSION;
    }
    
    // Not found errors
    if (message.includes('not found') || message.includes('does not exist') ||
        code === 404) {
        return ErrorType.NOT_FOUND;
    }
    
    // Server errors
    if (code >= 500 || message.includes('server error') || message.includes('internal error')) {
        return ErrorType.SERVER;
    }
    
    // Validation errors
    if (message.includes('invalid') || message.includes('validation') ||
        code === 400 || code === 422) {
        return ErrorType.VALIDATION;
    }
    
    return ErrorType.UNKNOWN;
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error, context = '') {
    if (!error) return 'An unexpected error occurred.';
    
    const errorType = getErrorType(error);
    const message = error.message || error.toString() || '';
    
    switch (errorType) {
        case ErrorType.NETWORK:
            if (message.includes('proxy') || message.includes('Runway')) {
                return 'Could not connect to the video generation service. Please check that your proxy server is running.';
            }
            if (message.includes('Supabase') || message.includes('bucket')) {
                return 'Could not connect to storage. Please check your internet connection.';
            }
            return 'Network error. Please check your internet connection and try again.';
            
        case ErrorType.PERMISSION:
            if (message.includes('row-level security') || message.includes('bucket')) {
                return 'Permission denied. Please check that storage buckets are public and accessible.';
            }
            return 'You don\'t have permission to perform this action.';
            
        case ErrorType.NOT_FOUND:
            if (message.includes('bucket')) {
                return 'Storage bucket not found. Please verify buckets are created in Supabase.';
            }
            if (message.includes('echo') || message.includes('Echo')) {
                return 'Echo not found. It may have been deleted.';
            }
            return 'The requested item was not found.';
            
        case ErrorType.VALIDATION:
            // Return the original message for validation errors (they're usually user-friendly)
            if (message.includes('file') || message.includes('photo') || message.includes('image')) {
                return message;
            }
            return message || 'Invalid input. Please check your data and try again.';
            
        case ErrorType.SERVER:
            return 'Server error. Please try again in a moment.';
            
        default:
            // For unknown errors, try to extract useful info
            if (message.includes('API key')) {
                return 'API key not configured. Please check your configuration.';
            }
            if (message.includes('timeout')) {
                return 'Operation timed out. Please try again.';
            }
            return message || 'An unexpected error occurred. Please try again.';
    }
}

/**
 * Log error with context
 */
export function logError(error, context = '', additionalInfo = {}) {
    const errorType = getErrorType(error);
    const message = error.message || error.toString() || 'Unknown error';
    
    console.error(`[${context || 'errorHandler'}] ${errorType.toUpperCase()}:`, {
        message,
        error,
        ...additionalInfo
    });
}

/**
 * Handle error with logging and user notification
 */
export function handleError(error, context = '', onNotify = null, additionalInfo = {}) {
    logError(error, context, additionalInfo);
    
    const userMessage = getUserFriendlyMessage(error, context);
    
    if (onNotify && typeof onNotify === 'function') {
        onNotify(userMessage);
    }
    
    return {
        error,
        type: getErrorType(error),
        userMessage,
        context
    };
}

/**
 * Wrap async function with error handling
 */
export function withErrorHandling(fn, context = '', onError = null) {
    return async (...args) => {
        try {
            return await fn(...args);
        } catch (error) {
            const handled = handleError(error, context, onError);
            throw handled.error; // Re-throw original error for caller to handle if needed
        }
    };
}

/**
 * Retry operation with exponential backoff
 */
export async function retryOperation(
    operation,
    maxRetries = 3,
    initialDelay = 1000,
    context = ''
) {
    let lastError;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            const errorType = getErrorType(error);
            
            // Don't retry on validation or permission errors
            if (errorType === ErrorType.VALIDATION || errorType === ErrorType.PERMISSION) {
                throw error;
            }
            
            if (attempt < maxRetries - 1) {
                const delay = initialDelay * Math.pow(2, attempt);
                console.log(`[errorHandler] Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms (${context})`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    throw lastError;
}

/**
 * Check if error is recoverable
 */
export function isRecoverableError(error) {
    const errorType = getErrorType(error);
    return errorType === ErrorType.NETWORK || errorType === ErrorType.SERVER;
}
