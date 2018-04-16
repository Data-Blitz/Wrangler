var s3TailStream = require('s3-tail-stream'),
    moment = require('moment');

// Search for log files older than 14 days
var fromDate = moment().subtract(300, 'days').toDate();

var opts = {
    // S3 credentials
    auth: {
        accessKeyId: 'AKIAJPN334ZN4YSK4OGQ',
        secretAccessKey: '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',
        region: 'us-east-1'
    },
    query: {
        // S3 bucket name
        Bucket: 'bpf-dev-data-lake-raw',
        // Object prefix (eg. folder prefix)
        // log files older than 14 days
        from: fromDate
    },
    // keep polling after 60 seconds for new files that match criteria
    retry: 60*1000
};
s3TailStream(opts)
    .pipe(process.stdout);