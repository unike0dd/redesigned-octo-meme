import contactIntakeWorker from "../../contact/intake-worker.js";

export function onRequest(context) {
  return contactIntakeWorker.fetch(context.request, context.env || {});
}
