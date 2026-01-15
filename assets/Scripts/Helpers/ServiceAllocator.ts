export type Constructor<T = any> = new (...args: any[]) => T;

export class ServiceAllocator {
    private static services = new Map<Constructor<any>, any>();

    /**
     * Registers a service.
     * @param serviceType - The service class constructor.
     * @param serviceInstance - The service instance.
     */
    public static register<T>(serviceType: Constructor<T>, serviceInstance: T): void {
        if (this.services.has(serviceType)) {
            throw new Error(`Service of type ${serviceType.name} is already registered.`);
        }
        this.services.set(serviceType, serviceInstance);
    }

    /**
     * Retrieves a registered service.
     * @param serviceType - The service class constructor.
     * @returns The service instance.
     */
    public static get<T>(serviceType: Constructor<T>): T {
        const service = this.services.get(serviceType);
        if (service === undefined) {
            throw new Error(`Service of type ${serviceType.name} is not registered.`);
        }
        return service as T;
    }

    /**
     * Unregisters a service.
     * @param serviceType - The service class constructor.
     */
    public static unregister<T>(serviceType: Constructor<T>): void {
        if (!this.services.has(serviceType)) {
            throw new Error(`Service of type ${serviceType.name} is not registered.`);
        }
        this.services.delete(serviceType);
    }
}