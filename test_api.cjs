const https = require('https');

const data = JSON.stringify({
    userId: "0f5a52e5-d8de-4269-9095-9612920a16af",
    problemId: "two-sum",
    status: "solved"
});

const options = {
    hostname: 'algobox-ai.vercel.app',
    port: 443,
    path: '/api/go/progress',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    console.log(`StatusCode: ${res.statusCode}`);
    let body = ''; // Fix: removed type annotation

    res.on('data', (d) => {
        body += d;
        process.stdout.write(d);
    });

    res.on('end', () => {
        console.log('\n\n--- Response Body ---');
        console.log(body);
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.write(data);
req.end();
