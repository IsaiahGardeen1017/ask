export async function windows_getPath(envScope: "User" | "Machine"): Promise<string | null> {
    const command = `[Environment]::GetEnvironmentVariable("PATH", "${envScope}")`;
    const p = new Deno.Command("powershell.exe", {
        args: ["-Command", command],
        stdout: "piped",
        stderr: "piped",
    });
    const { code, stdout, stderr } = await p.output();
    if (code !== 0) {
        return null;
    }
    return new TextDecoder().decode(stdout).trim();
}

export async function windows_setPath(
    newPathValue: string,
    envScope: "User" | "Machine",
): Promise<boolean> {
    const command = `[Environment]::SetEnvironmentVariable("PATH", "${newPathValue}", "${envScope}")`;
    const p = new Deno.Command("powershell.exe", {
        args: ["-Command", command],
        stdout: "piped",
        stderr: "piped",
    });
    const { code, stdout, stderr } = await p.output();
    if (code !== 0) {
        return false;
    }
    return true;
}

export async function windows_addPathEntry(
    entryToAdd: string,
    envScope: "User" | "Machine",
): Promise<boolean> {
    const currentPath = await windows_getPath(envScope);
    if (currentPath === null) {
        return false;
    }
    const pathSegments = currentPath.split(";").filter(Boolean); // Filter out empty strings
    if (pathSegments.includes(entryToAdd)) {
        return true;
    }
    const newPath = `${currentPath};${entryToAdd}`;
    const success = await windows_setPath(newPath, envScope);
    return success;
}

export async function windows_removePathEntry(
    entryToRemove: string,
    envScope: "User" | "Machine",
): Promise<boolean> {
    const currentPath = await windows_getPath(envScope);
    if (currentPath === null) {
        return false;
    }
    const pathSegments = currentPath.split(";").filter(Boolean); // Filter out empty strings
    const updatedPathSegments = pathSegments.filter((p) => p !== entryToRemove);

    if (pathSegments.length === updatedPathSegments.length) {
        return true;
    }
    const newPath = updatedPathSegments.join(";");
    const success = await windows_setPath(newPath, envScope);
    return success;

}