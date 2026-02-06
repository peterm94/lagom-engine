/**
 * Copy the template module into this one for distribution.
 * Also store the current lagom-engine version in a file so it can be subbed in to the package.json at template
 * creation.
 */
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const enginePkgPath = path.resolve(__dirname, "../../lagom-engine/package.json");
const output = path.resolve(__dirname, "../bin/lagom-engine.version.txt");
const templateSrc = path.resolve(__dirname, "../../lagom-game-template");
const templateDir = path.resolve(__dirname, "../template");
const enginePkg = JSON.parse(fs.readFileSync(enginePkgPath, "utf8"));

// Don't copy this lol
const excluded = path.resolve(templateSrc, "node_modules");

// Copy the template repo
fs.remove(templateDir)
fs.copySync(templateSrc, templateDir, { filter: (src) => !src.startsWith(excluded) });

// Write the version to a file
fs.writeFileSync(output, enginePkg.version);

console.log("Prepared create-lagom-game for packaging.", enginePkg.version);
