import { run } from "./index.ts";
const setInput = (name, value) => (process.env[`INPUT_${name.replace(/ /g, "_").toUpperCase()}`] = value);

setInput("filename", "dependencies.sbom.json");
setInput("repos", "hpi-schul-cloud/tldraw-server:999.6.6");

run();
