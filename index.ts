import getRepoInfos from "./lib/getRepoInfos";
import loadSboms from "./lib/loadSboms";
import MergedSbom from "./lib/MergedSbom";

const run = async () => {
  try {
    const repoInfo = await getRepoInfos("32.50.0");
    console.log(repoInfo);
    const sboms = await loadSboms(repoInfo);
    const mergedSbom = new MergedSbom(sboms);
    console.log(mergedSbom.getList());
  } catch (error) {
    console.error("Error running the SBOM processor", error); // Consider handling the error more robustly
  }
};

run();
