import { GITHUB_API_URL, GITHUB_RAW_URL, PROJECT } from "../config/config";
import axios from "axios";

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
  }
);

// const getRepositoryUrl = (repository) => {
//   const url = `https://github.com/${PROJECT}/${repository}`;
//   return url;
// };

const parseSimpleYamlContent = (content) => {
  const map = content
    .split("\n")
    .filter((line) => line.includes(": "))
    .map((line) => line.split(": "));

  return map;
};

export default async function getRepoInfos(version: string) {
  const commitId = await getCommitId(version);
  const repoVersionMap = await getRepoKeyVersionMap(commitId);
  const repoNameKeyList = await getRepoNameKeyList(commitId);
  const repoNameVersionMap = repoNameKeyList.map(([imageKey, repoName]) => {
    const repoKey = imageKey.replace("_REPO_NAME", "_IMAGE_TAG");
    return {
      key: repoKey,
      name: repoName,
      version: repoVersionMap[repoKey],
    };
  }, {});
  return repoNameVersionMap;
}

async function getCommitId(version) {
  const url = `${GITHUB_API_URL}/repos/${PROJECT}/dof_app_deploy/tags`;
  const response = await axiosInstance.get(url);
  const tagInfo = response.data.find((tag) => tag.name === version);
  if (tagInfo && tagInfo.commit && tagInfo.commit.sha) {
    return tagInfo.commit.sha;
  }
  throw new Error(`Commit ID not found for version ${version} in ${url}`);
}

async function getRepoKeyVersionMap(commitId) {
  const url = `${GITHUB_RAW_URL}/${PROJECT}/dof_app_deploy/${commitId}/ansible/host_vars/ref-dbc/version.yml`;
  const response = await axiosInstance.get(url);
  const lines = parseSimpleYamlContent(response.data);
  const repoVersionMap = lines.reduce((map, [repoKey, version]) => {
    map[repoKey] = version;
    return map;
  }, {});
  return repoVersionMap; // Missing error handling: what if the response is not as expected?
}

async function getRepoNameKeyList(commitId, omitDofRepo = true) {
  const url = `${GITHUB_RAW_URL}/${PROJECT}/dof_app_deploy/${commitId}/ansible/group_vars/all/git_repos.yml`;
  const response = await axiosInstance.get(url);
  const list = parseSimpleYamlContent(response.data);
  if (omitDofRepo) {
    return list.filter(([imageKey]) => !imageKey.includes("DOF_APP_DEPLOY"));
  }
  return list; // Missing error handling: what if the response is not as expected?
}
