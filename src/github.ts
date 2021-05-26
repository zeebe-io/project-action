/**
 * Github module
 *
 * Used to isolate the boundary between the code of this project and the github
 * api. Handy during testing, because we can easily mock this module's functions.
 * Properties are harder to mock, so this module just offers functions to retrieve
 * those properties.
 */

 import * as github from "@actions/github";
 import { WebhookPayload } from "@actions/github/lib/interfaces";
 
 export interface GithubApi {
   setProject(projectId: number, note: string): Promise<{}>;
   getIssueTitle(): Promise<string>;
 }
 
 export class Github implements GithubApi {
   #octokit;
   #context;
 
   constructor(token: string) {
      this.#octokit = github.getOctokit(token);
      this.#context = github.context;
   }
 
   public async setProject(projectId: number, note: string) {
      const issueId = this.#context.issue.number
      console.log(`Assigning project ${projectId} to issue ${issueId}`);
      return this.#octokit.projects.createCard({
        note: note,
        content_id: issueId,
        content_type: 'issue'
      });
   }

   public async getIssueTitle() {
      return this.#octokit.issues.get({
        owner: this.#context.issue.owner,
        repo: this.#context.issue.repo,
        issue_number: this.#context.issue.number
      }).then(response => response.data.title);
   }
}
