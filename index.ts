import getRepoInfos from "./lib/getRepoInfos";
import loadSboms from "./lib/loadSboms";
import MergedSbom from "./lib/MergedSbom";
import writeSbom from "./lib/writeSbom";

const RELEASE_VERSION = process.env.RELEASE_VERSION;

const run = async () => {
  if (!RELEASE_VERSION) {
    console.error("RELEASE_VERSION is required");
    return;
  }

  try {
    info("=== 1. Fetching repository information ===");
    const repoInfo = await getRepoInfos(RELEASE_VERSION);

    info("=== 2. Loading SBOMs ===");
    const sboms = await loadSboms(repoInfo);

    info("=== 3. Generating merged SBOM ===");
    const mergedSbom = new MergedSbom(sboms);

    info("=== 4. Writing merged SBOM ===");
    writeSbom(RELEASE_VERSION, mergedSbom);
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
