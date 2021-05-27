import * as core from "@actions/core";
import { Github, ProjectInput } from "./github";
import { Project } from "./project";

/**
 * Called from the action.yml.
 */
async function run(): Promise<void> {
  const token = process.env["GITHUB_TOKEN"];
  if (!token || token === "") {
    core.setFailed(
      `No Github token provided; please specify a GITHUB_TOKEN environment variable`
    );
    return;
  }

  const projectId = process.env["PROJECT_ID"];
  const required = !(projectId && projectId !== "");
  const projectType = core.getInput("project_type", { required: required });
  const projectOwner = core.getInput("project_owner", { required: required });
  const projectName = core.getInput("project_name", { required: required });

  const projectRepoRequired = required && projectType === "repo";
  const projectRepo = core.getInput("project_repo", {
    required: projectRepoRequired,
  });

  const hub = new Github(token);
  const input = new ProjectInput(
    projectType,
    projectOwner,
    projectRepo,
    projectName,
    projectId
  );
  const project = new Project(input, hub);

  return project.run();
}

// this would be executed on import in a test file
run();
