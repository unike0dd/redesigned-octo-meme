import contactRepoWorker from "../../contact/repo-worker.js";

export async function onRequest(context) {
  return contactRepoWorker.fetch(context.request, context.env || {});
}
