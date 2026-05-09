import contactRepoWorker from "../../contact/repo-worker.js";

export function onRequest(context) {
  return contactRepoWorker.fetch(context.request, context.env, context);
}
