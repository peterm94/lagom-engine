#!/usr/bin/env node
import path from "path";
import fs from "fs-extra";
import prompts from "prompts";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
    const { projectName } = await prompts({
        type: "text",
        name: "projectName",
        message: "Project name",
        initial: "my-lagom-game",
    });

    const target = path.resolve(process.cwd(), projectName);
    const template = path.resolve(__dirname, "../template");
    const engineVersionPath = path.resolve(__dirname, "lagom-engine.version.txt");

    const lagomVersion = await fs.readFile(engineVersionPath, "utf8");

    await fs.copy(template, target);

    // Update package.json name, lagom-engine version and remove the project package manager.
    const pkgPath = path.join(target, "package.json");
    const pkg = JSON.parse(await fs.readFile(pkgPath, "utf8"));
    pkg.name = projectName;
    pkg.dependencies["lagom-engine"] = lagomVersion.trim();
    delete pkg["packageManager"];
    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 4));

    console.log(`\nCreated ${projectName}`);
}

main();
