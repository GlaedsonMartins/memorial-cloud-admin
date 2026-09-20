import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const site = "https://memorial-cloud-5da8e.web.app";
const expected = await readFile(new URL("../.output/public/index.html", import.meta.url), "utf8");
for (const path of ["/", "/login"]) {
  const response = await fetch(`${site}${path}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  assert.equal(response.status, 200, path);
  assert.equal(await response.text(), expected, `${path} must serve the current SPA shell`);
  console.log(`OK ${path}: current application shell`);
}
for (const asset of new Set(
  [...expected.matchAll(/(?:src|href)="(\/assets\/[^" ]+)"/g)].map((match) => match[1]),
)) {
  const response = await fetch(`${site}${asset}`, { signal: AbortSignal.timeout(20_000) });
  assert.equal(response.status, 200, asset);
  assert.match(
    response.headers.get("content-type"),
    asset.endsWith(".css") ? /text\/css/ : /javascript/,
  );
  console.log(`OK ${asset}`);
}
// No production users or session records are created by these probes.
for (const endpoint of ["syncAdminDeviceSession", "endAdminDeviceSession"]) {
  const response = await fetch(
    `https://us-central1-memorial-cloud-5da8e.cloudfunctions.net/${endpoint}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: {} }),
      signal: AbortSignal.timeout(30_000),
    },
  );
  assert.equal(response.status, 401, endpoint);
  assert.equal((await response.json()).error.status, "UNAUTHENTICATED", endpoint);
  console.log(`OK ${endpoint}: rejects unauthenticated calls`);
}
