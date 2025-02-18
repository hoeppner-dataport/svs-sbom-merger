import { writeFileSync } from "fs";
import loadSboms from "./src/loadSboms";
import MergedSbom from "./src/MergedSbom";
import core from '@actions/core';

const filename = core.getInput('filename') ? core.getInput('filename') : "dependencies.sbom.json";
const reposString = core.getInput('repos');

export const run = async () => {
  try {
    core.info("=== 1. Loading SBOMs ===");
    const repos = reposString !== "" ? reposString.split(";") : ["hpi-schul-cloud/tldraw-server:999.6.6"]
    const sboms = await loadSboms(filename, repos);

    core.info("=== 2. Generating merged SBOM ===");
    const mergedSbom = new MergedSbom(sboms);
    writeFileSync(`svs-sbom.json`, mergedSbom.toString());

    core.setOutput("json", mergedSbom.toString());
  } catch (error) {
    core.error("Error generating merged SBOM", error.message);
    core.error(error);
  }
};

