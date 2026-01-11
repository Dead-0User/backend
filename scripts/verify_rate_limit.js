const http = require('http');

const limit = 110;
const rateLimitMax = 100;
let completed = 0;
let success = 0;
let rateLimited = 0;
let errors = 0;

console.log(`Starting ${limit} requests to http://localhost:5000/api/health ...`);

function makeRequest() {
    const req = http.request('http://localhost:5000/api/health', (res) => {
        if (res.statusCode === 200) success++;
        if (res.statusCode === 429) rateLimited++;

        // consume response to free up socket
        res.resume();

        completed++;
        checkDone();
    });

    req.on('error', (e) => {
        console.error(`Request error: ${e.message}`);
        errors++;
        completed++;
        checkDone();
    });

    req.end();
}

function checkDone() {
    if (completed === limit) {
        console.log(`Completed ${limit} requests.`);
        console.log(`Success (200): ${success}`);
        console.log(`Rate Limited (429): ${rateLimited}`);
        console.log(`Errors: ${errors}`);

        if (success <= rateLimitMax && rateLimited > 0) {
            console.log('✅ Rate limiting verification PASSED');
            // We expect exactly 100 successes if no other traffic, but <= 100 is key.
        } else {
            console.log('❌ Rate limiting verification FAILED (Note: Server must be running with rate limiting enabled)');
        }
    }
}

// Fire them off
for (let i = 0; i < limit; i++) {
    makeRequest();
}
