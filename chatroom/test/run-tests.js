async function runAll() {
  try {
    console.log('Running storage unit tests...');
    const storageTest = require('./storage.test');
    await storageTest();

    console.log('Running smoke tests (requires server at http://localhost:3000)...');
    const smoke = require('./smoke.test');
    await smoke();

    console.log('Running socket.io integration tests (requires server at http://localhost:3000)...');
    const socketTest = require('./socket.test');
    await socketTest();

    console.log('\nAll tests passed');
    process.exit(0);
  } catch (err) {
    console.error('\nTests failed:', err && err.stack ? err.stack : err);
    process.exit(2);
  }
}

runAll();
