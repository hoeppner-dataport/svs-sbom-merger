import { writeFileSync } from "fs";
import loadSboms from "./src/loadSboms";
import MergedSbom from "./src/MergedSbom";

const filename = "dependencies.sbom.json";
const repos = [
  "hpi-schul-cloud/schulcloud-client:33.2.0",
  "hpi-schul-cloud/tldraw-server:999.6.6",
];

export const run = async () => {
  try {
    info("=== 1. Loading SBOMs ===");
    const sboms = await loadSboms(filename, repos);

    info("=== 2. Generating merged SBOM ===");
    const mergedSbom = new MergedSbom(sboms);
    writeFileSync(`svs-sbom.json`, mergedSbom.toString());
  } catch (error) {
    console.error("Error generating merged SBOM", error.message);
    console.error(error);
  }
};

function info(message: string) {
  console.log("");
  console.log(message);
}

run();
