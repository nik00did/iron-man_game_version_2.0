export {}

declare global {
    namespace jest {
        function unstable_mockModule(
            moduleName: string,
            factory?: () => unknown,
            options?: { virtual?: boolean },
        ): void
    }
}
