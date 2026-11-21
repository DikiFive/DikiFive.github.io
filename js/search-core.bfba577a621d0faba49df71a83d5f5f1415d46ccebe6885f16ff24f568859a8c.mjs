/**
 * Pure helpers for the search page.
 *
 * The DOM wiring stays in `layouts/_default/search.html`; everything here is
 * free of `document`, so `node --test` can exercise the three failure-prone
 * mechanics: debounce coalescing, stale-query invalidation, and partial result
 * failures.
 */

/**
 * Coalesce rapid calls into one trailing invocation.
 *
 * @param {number} delayMs
 * @param {{ setTimeout: Function, clearTimeout: Function }} [timers] injectable for tests
 */
export function createDebouncer(delayMs, timers = globalThis) {
  let handle = null;
  return {
    schedule(fn) {
      if (handle !== null) timers.clearTimeout(handle);
      handle = timers.setTimeout(() => {
        handle = null;
        fn();
      }, delayMs);
    },
    cancel() {
      if (handle !== null) {
        timers.clearTimeout(handle);
        handle = null;
      }
    },
    get pending() {
      return handle !== null;
    }
  };
}

/**
 * Invalidate in-flight queries by comparing a token captured at request time.
 * Clearing the input calls `invalidate()` so an older response cannot repaint.
 */
export function createQueryGate() {
  let token = 0;
  return {
    begin() {
      token += 1;
      return token;
    },
    isCurrent(value) {
      return value === token;
    },
    invalidate() {
      token += 1;
    }
  };
}

/**
 * Resolve Pagefind hits into result data, dropping individual failures.
 *
 * One broken `hit.data()` must not blank the whole result list, so this is a
 * settled map rather than a `Promise.all`.
 *
 * @param {Array<{ data: () => Promise<unknown> }>} hits
 * @returns {Promise<Array<unknown>>}
 */
export async function settleHits(hits) {
  const settled = await Promise.allSettled(hits.map((hit) => hit.data()));
  return settled
    .filter((entry) => entry.status === "fulfilled" && entry.value)
    .map((entry) => entry.value);
}
