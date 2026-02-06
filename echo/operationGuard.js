// Operation guard: prevents race conditions in async operations

/**
 * Guard to prevent concurrent operations
 */
class OperationGuard {
    constructor() {
        this.activeOperations = new Map();
    }
    
    /**
     * Check if an operation is already in progress
     */
    isActive(operationId) {
        return this.activeOperations.has(operationId);
    }
    
    /**
     * Start an operation (returns false if already active)
     */
    start(operationId) {
        if (this.isActive(operationId)) {
            return false;
        }
        this.activeOperations.set(operationId, Date.now());
        return true;
    }
    
    /**
     * End an operation
     */
    end(operationId) {
        this.activeOperations.delete(operationId);
    }
    
    /**
     * Execute an operation with guard protection
     */
    async execute(operationId, operation) {
        if (!this.start(operationId)) {
            throw new Error(`Operation "${operationId}" is already in progress`);
        }
        
        try {
            return await operation();
        } finally {
            this.end(operationId);
        }
    }
    
    /**
     * Clear all operations (for cleanup)
     */
    clear() {
        this.activeOperations.clear();
    }
    
    /**
     * Get active operations (for debugging)
     */
    getActive() {
        return Array.from(this.activeOperations.keys());
    }
}

// Global operation guard instance
export const operationGuard = new OperationGuard();

/**
 * Decorator to guard an async function
 */
export function guardOperation(operationId) {
    return function(target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        
        descriptor.value = async function(...args) {
            return operationGuard.execute(operationId, () => originalMethod.apply(this, args));
        };
        
        return descriptor;
    };
}

/**
 * Guard a function call
 */
export function guard(operationId, fn) {
    return operationGuard.execute(operationId, fn);
}
