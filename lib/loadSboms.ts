import axios from "axios";
import { RepoInfo } from "../types/types";
import { BomDto } from "./dto/Bom.dto";
import { getRepositoryUrl } from "./helper/repo.helper";

const axiosInstance = axios.create();
axiosInstance.defaults.maxRedirects = 0; // Set to 0 to prevent automatic redirects
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && [301, 302].includes(error.response.status)) {
      const redirectUrl = error.response.headers.location;
      const response = await axiosInstance.get(redirectUrl);
      return response;
    }
    return error;
  },
);

export default async function loadSboms(
  repoInfo: Map<string, RepoInfo>,
): Promise<BomDto[]> {
  const promises = Array.from(repoInfo.values()).map((repo) => {
    return loadSbom(repo.name, repo.version);
  });
  const results = await Promise.allSettled(promises);
  const sboms = processResults(results);
  return sboms;
}

async function loadSbom(
  repository,
  repositoryVersion,
): Promise<BomDto | undefined> {
  const sbomUrl = `${getRepositoryUrl(
    repository,
  )}/releases/download/${repositoryVersion}/dependency-results.sbom.json`;
  const response = await axiosInstance.get(sbomUrl);
  if (response.status !== 200) {
    console.error(
      `Failed to load SBOM for ${repository}@${repositoryVersion} (status: ${response.status})`,
    );
    return;
  }
  const bom = new BomDto({
    repository,
    repositoryVersion,
    ...response.data,
  });
  if (bom) {
    console.info(
      `Loaded SBOM for ${repository}@${repositoryVersion} (containing ${bom?.components?.length ?? "---"} components))`,
    );
  }
  return bom;
}

function processResults(results) {
  const sboms: BomDto[] = [];
  for (const result of results) {
    if (result.status === "rejected") {
      console.warn(result.reason);
    } else {
      if (result.value !== undefined) {
        sboms.push(result.value);
      }
    }
  }
  return sboms;
}
