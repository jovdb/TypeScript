namespace ts.tscWatch {
    describe("unittests:: tsbuildWatch:: watchMode:: persistentResolutions", () => {
        verifyTscWatch({
            scenario: "persistResolutions",
            subScenario: "saves resolution and uses it for new program",
            sys: () => createWatchedSystem([
                {
                    path: `${projectRoot}/src/main.ts`,
                    content: Utils.dedent`
                        import { something } from "./filePresent";
                        import { something2 } from "./fileNotFound";`,
                },
                {
                    path: `${projectRoot}/src/filePresent.ts`,
                    content: `export function something() { return 10; }`,
                },
                {
                    path: `${projectRoot}/tsconfig.json`,
                    content: JSON.stringify({
                        compilerOptions: {
                            module: "amd",
                            composite: true,
                            persistResolutions: true,
                            traceResolution: true,
                        },
                        include: ["src/**/*.ts"]
                    }),
                },
                libFile
            ], { currentDirectory: projectRoot }),
            commandLineArgs: ["--b", ".", "-w", "--extendedDiagnostics"],
            changes: [
                {
                    caption: "Modify main file",
                    change: sys => sys.appendFile(`${projectRoot}/src/main.ts`, `something();`),
                    timeouts: runQueuedTimeoutCallbacks,
                },
                {
                    caption: "Add new module and update main file",
                    change: sys => {
                        sys.writeFile(`${projectRoot}/src/newFile.ts`, "export function foo() { return 20; }");
                        sys.prependFile(`${projectRoot}/src/main.ts`, `import { foo } from "./newFile";`);
                    },
                    timeouts: runQueuedTimeoutCallbacks,
                },
                {
                    caption: "Write file that could not be resolved",
                    change: sys => sys.writeFile(`${projectRoot}/src/fileNotFound.ts`, "export function something2() { return 20; }"),
                    timeouts: sys => {
                        sys.runQueuedTimeoutCallbacks(); // Invalidate resolutions
                        sys.runQueuedTimeoutCallbacks(); // Actual update
                    }
                }
            ]
        });
        verifyTscWatch({
            scenario: "persistResolutions",
            subScenario: "can build after resolutions have been saved in tsbuildinfo file",
            sys: () => {
                const sys = createWatchedSystem([
                    {
                        path: `${projectRoot}/src/main.ts`,
                        content: Utils.dedent`
                        import { something } from "./filePresent";
                        import { something2 } from "./fileNotFound";`,
                    },
                    {
                        path: `${projectRoot}/src/filePresent.ts`,
                        content: `export function something() { return 10; }`,
                    },
                    {
                        path: `${projectRoot}/tsconfig.json`,
                        content: JSON.stringify({
                            compilerOptions: {
                                module: "amd",
                                composite: true,
                                persistResolutions: true,
                                traceResolution: true,
                            },
                            include: ["src/**/*.ts"]
                        }),
                    },
                    libFile
                ], { currentDirectory: projectRoot });
                const exit = sys.exit;
                sys.exit = noop;
                fakes.withTemporaryPatchingForBuildinfoReadWrite(sys, sys => executeCommandLine(sys, noop, ["--b", "."]));
                sys.exit = exit;
                sys.clearOutput();
                return sys;
           },
            commandLineArgs: ["--b", ".", "-w", "--extendedDiagnostics"],
            changes: [
                {
                    caption: "Modify main file",
                    change: sys => sys.appendFile(`${projectRoot}/src/main.ts`, `something();`),
                    timeouts: runQueuedTimeoutCallbacks,
                },
                {
                    caption: "Add new module and update main file",
                    change: sys => {
                        sys.writeFile(`${projectRoot}/src/newFile.ts`, "export function foo() { return 20; }");
                        sys.prependFile(`${projectRoot}/src/main.ts`, `import { foo } from "./newFile";`);
                    },
                    timeouts: runQueuedTimeoutCallbacks,
                },
                {
                    caption: "Write file that could not be resolved",
                    change: sys => sys.writeFile(`${projectRoot}/src/fileNotFound.ts`, "export function something2() { return 20; }"),
                    timeouts: sys => {
                        sys.runQueuedTimeoutCallbacks(); // Invalidate resolutions
                        sys.runQueuedTimeoutCallbacks(); // Actual update
                    }
                }
            ]
        });
        verifyTscWatch({
            scenario: "persistResolutions",
            subScenario: "can build after resolutions are cleaned",
            sys: () => {
                const sys = createWatchedSystem([
                    {
                        path: `${projectRoot}/src/main.ts`,
                        content: Utils.dedent`
                        import { something } from "./filePresent";
                        import { something2 } from "./fileNotFound";`,
                    },
                    {
                        path: `${projectRoot}/src/filePresent.ts`,
                        content: `export function something() { return 10; }`,
                    },
                    {
                        path: `${projectRoot}/tsconfig.json`,
                        content: JSON.stringify({
                            compilerOptions: {
                                module: "amd",
                                composite: true,
                                persistResolutions: true,
                                traceResolution: true,
                            },
                            include: ["src/**/*.ts"]
                        }),
                    },
                    libFile
                ], { currentDirectory: projectRoot });
                const exit = sys.exit;
                sys.exit = noop;
                fakes.withTemporaryPatchingForBuildinfoReadWrite(sys, sys => {
                    executeCommandLine(sys, noop, ["--b", "."]);
                    executeCommandLine(sys, noop, ["--b", ".", "--cleanResolutions"]);
                });
                sys.exit = exit;
                sys.clearOutput();
                return sys;
            },
            commandLineArgs: ["--b", ".", "-w", "--extendedDiagnostics"],
            changes: [
                {
                    caption: "Modify main file",
                    change: sys => sys.appendFile(`${projectRoot}/src/main.ts`, `something();`),
                    timeouts: runQueuedTimeoutCallbacks,
                },
                {
                    caption: "Add new module and update main file",
                    change: sys => {
                        sys.writeFile(`${projectRoot}/src/newFile.ts`, "export function foo() { return 20; }");
                        sys.prependFile(`${projectRoot}/src/main.ts`, `import { foo } from "./newFile";`);
                    },
                    timeouts: runQueuedTimeoutCallbacks,
                },
                {
                    caption: "Write file that could not be resolved",
                    change: sys => sys.writeFile(`${projectRoot}/src/fileNotFound.ts`, "export function something2() { return 20; }"),
                    timeouts: sys => {
                        sys.runQueuedTimeoutCallbacks(); // Invalidate resolutions
                        sys.runQueuedTimeoutCallbacks(); // Actual update
                    }
                }
            ]
        });

        verifyTscWatch({
            scenario: "persistResolutions",
            subScenario: "saves resolution and uses it for new program with outFile",
            sys: () => createWatchedSystem([
                {
                    path: `${projectRoot}/src/main.ts`,
                    content: Utils.dedent`
                        import { something } from "./filePresent";
                        import { something2 } from "./fileNotFound";`,
                },
                {
                    path: `${projectRoot}/src/filePresent.ts`,
                    content: `export function something() { return 10; }`,
                },
                {
                    path: `${projectRoot}/tsconfig.json`,
                    content: JSON.stringify({
                        compilerOptions: {
                            module: "amd",
                            composite: true,
                            persistResolutions: true,
                            traceResolution: true,
                            outFile: "outFile.js"
                        },
                        include: ["src/**/*.ts"]
                    }),
                },
                libFile
            ], { currentDirectory: projectRoot }),
            commandLineArgs: ["--b", ".", "-w", "--extendedDiagnostics"],
            changes: [
                {
                    caption: "Modify main file",
                    change: sys => sys.appendFile(`${projectRoot}/src/main.ts`, `something();`),
                    timeouts: runQueuedTimeoutCallbacks,
                },
                {
                    caption: "Add new module and update main file",
                    change: sys => {
                        sys.writeFile(`${projectRoot}/src/newFile.ts`, "export function foo() { return 20; }");
                        sys.prependFile(`${projectRoot}/src/main.ts`, `import { foo } from "./newFile";`);
                    },
                    timeouts: runQueuedTimeoutCallbacks,
                },
                {
                    caption: "Write file that could not be resolved",
                    change: sys => sys.writeFile(`${projectRoot}/src/fileNotFound.ts`, "export function something2() { return 20; }"),
                    timeouts: sys => {
                        sys.runQueuedTimeoutCallbacks(); // Invalidate resolutions
                        sys.runQueuedTimeoutCallbacks(); // Actual update
                    }
                }
            ]
        });
        verifyTscWatch({
            scenario: "persistResolutions",
            subScenario: "can build after resolutions have been saved in tsbuildinfo file with outFile",
            sys: () => {
                const sys = createWatchedSystem([
                    {
                        path: `${projectRoot}/src/main.ts`,
                        content: Utils.dedent`
                        import { something } from "./filePresent";
                        import { something2 } from "./fileNotFound";`,
                    },
                    {
                        path: `${projectRoot}/src/filePresent.ts`,
                        content: `export function something() { return 10; }`,
                    },
                    {
                        path: `${projectRoot}/tsconfig.json`,
                        content: JSON.stringify({
                            compilerOptions: {
                                module: "amd",
                                composite: true,
                                persistResolutions: true,
                                traceResolution: true,
                                outFile: "outFile.js"
                            },
                            include: ["src/**/*.ts"]
                        }),
                    },
                    libFile
                ], { currentDirectory: projectRoot });
                const exit = sys.exit;
                sys.exit = noop;
                fakes.withTemporaryPatchingForBuildinfoReadWrite(sys, sys => executeCommandLine(sys, noop, ["--b", "."]));
                sys.exit = exit;
                sys.clearOutput();
                return sys;
            },
            commandLineArgs: ["--b", ".", "-w", "--extendedDiagnostics"],
            changes: [
                {
                    caption: "Modify main file",
                    change: sys => sys.appendFile(`${projectRoot}/src/main.ts`, `something();`),
                    timeouts: runQueuedTimeoutCallbacks,
                },
                {
                    caption: "Add new module and update main file",
                    change: sys => {
                        sys.writeFile(`${projectRoot}/src/newFile.ts`, "export function foo() { return 20; }");
                        sys.prependFile(`${projectRoot}/src/main.ts`, `import { foo } from "./newFile";`);
                    },
                    timeouts: runQueuedTimeoutCallbacks,
                },
                {
                    caption: "Write file that could not be resolved",
                    change: sys => sys.writeFile(`${projectRoot}/src/fileNotFound.ts`, "export function something2() { return 20; }"),
                    timeouts: sys => {
                        sys.runQueuedTimeoutCallbacks(); // Invalidate resolutions
                        sys.runQueuedTimeoutCallbacks(); // Actual update
                    }
                }
            ]
        });
        verifyTscWatch({
            scenario: "persistResolutions",
            subScenario: "can build after resolutions are cleaned with outFile",
            sys: () => {
                const sys = createWatchedSystem([
                    {
                        path: `${projectRoot}/src/main.ts`,
                        content: Utils.dedent`
                        import { something } from "./filePresent";
                        import { something2 } from "./fileNotFound";`,
                    },
                    {
                        path: `${projectRoot}/src/filePresent.ts`,
                        content: `export function something() { return 10; }`,
                    },
                    {
                        path: `${projectRoot}/tsconfig.json`,
                        content: JSON.stringify({
                            compilerOptions: {
                                module: "amd",
                                composite: true,
                                persistResolutions: true,
                                traceResolution: true,
                                outFile: "outFile.js"
                            },
                            include: ["src/**/*.ts"]
                        }),
                    },
                    libFile
                ], { currentDirectory: projectRoot });
                const exit = sys.exit;
                sys.exit = noop;
                fakes.withTemporaryPatchingForBuildinfoReadWrite(sys, sys => {
                    executeCommandLine(sys, noop, ["--b", "."]);
                    executeCommandLine(sys, noop, ["--b", ".", "--cleanResolutions"]);
                });
                sys.exit = exit;
                sys.clearOutput();
                return sys;
            },
            commandLineArgs: ["--b", ".", "-w", "--extendedDiagnostics"],
            changes: [
                {
                    caption: "Modify main file",
                    change: sys => sys.appendFile(`${projectRoot}/src/main.ts`, `something();`),
                    timeouts: runQueuedTimeoutCallbacks,
                },
                {
                    caption: "Add new module and update main file",
                    change: sys => {
                        sys.writeFile(`${projectRoot}/src/newFile.ts`, "export function foo() { return 20; }");
                        sys.prependFile(`${projectRoot}/src/main.ts`, `import { foo } from "./newFile";`);
                    },
                    timeouts: runQueuedTimeoutCallbacks,
                },
                {
                    caption: "Write file that could not be resolved",
                    change: sys => sys.writeFile(`${projectRoot}/src/fileNotFound.ts`, "export function something2() { return 20; }"),
                    timeouts: sys => {
                        sys.runQueuedTimeoutCallbacks(); // Invalidate resolutions
                        sys.runQueuedTimeoutCallbacks(); // Actual update
                    }
                }
            ]
        });
    });
}
