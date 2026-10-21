const auth = require(process.env.APPDATA + '/npm/node_modules/firebase-tools/lib/auth.js');
(async () => {
  const token = await auth.getAccessToken(auth.getGlobalDefaultAccount().tokens.refresh_token,
    ['https://www.googleapis.com/auth/cloud-platform']);
  const results = [];
  for (const path of ['rooms/room-06', 'active_sessions/room-06', 'tributes/U9PUPs2ZrGdBZtC73GZ9']) {
    const response = await fetch('https://firestore.googleapis.com/v1/projects/memorial-cloud-5da8e/databases/memorialcloud/documents/' + path,
      { headers: { Authorization: 'Bearer ' + token.access_token } });
    const data = await response.json();
    results.push({ status: response.status, data });
    console.log(JSON.stringify({ path, status: response.status, fields: Object.fromEntries(
      Object.entries(data.fields || {}).filter(([key]) => ['roomId', 'tributeId', 'activeTributeId', 'preparedTributeId', 'status'].includes(key))) }));
  }
  if (process.argv.includes('--repair-stale-reference') && results[0].status === 200 &&
      results[2].status === 404 && results[0].data.fields.preparedTributeId?.stringValue === 'U9PUPs2ZrGdBZtC73GZ9') {
    const url = 'https://firestore.googleapis.com/v1/projects/memorial-cloud-5da8e/databases/memorialcloud/documents/rooms/room-06?updateMask.fieldPaths=preparedTributeId&currentDocument.updateTime=' + encodeURIComponent(results[0].data.updateTime);
    const response = await fetch(url, { method: 'PATCH', headers: { Authorization: 'Bearer ' + token.access_token, 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: { preparedTributeId: { nullValue: null } } }) });
    if (!response.ok) throw new Error('Repair failed: HTTP ' + response.status);
    console.log('Cleared stale preparedTributeId for room-06.');
  }
})().catch(error => { console.error(error.message); process.exit(1); });
