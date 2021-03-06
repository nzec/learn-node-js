const https = require('https');
const fs = require('fs');
const cheerio = require('cheerio')
const dl = require('download-file-with-progressbar');
const chalk = require('chalk');
var progress = require('progress');

var handleErrors = (err) => {
    process.stdout.write('\r\x1b[K');
    console.log(chalk.keyword('red')('Error : ' + err.message));
}

var redirectLinkFinder = (url) => {
    process.stdout.write(chalk.keyword('cyan')('Obtaining URL.'));
    https.get(url, (resp) => {
        let data = '';

        resp.on('data', (chunk) => {
            data += chunk;
        });

        resp.on('end', () => {
            const $ = cheerio.load(data);
            var url = $('a').attr('href');
            process.stdout.write('\r\x1b[K');
            process.stdout.write(chalk.keyword('cyan')('URL Obtained')  + ' : ' +  chalk.keyword('gray')(url) + '\n');
            downloadFile(url);
        });
    }).on("error", (err) => {
        handleErrors(err);
    });
}

var downloadFile = (url) => {
    process.stdout.write(chalk.keyword('cyan')('Downloading. \n'));
    var dank = 0;
    var option = {
        filename: 'chromium-sync.exe',
        dir: './',
        onDone: (info) => {
            console.log('\n' + chalk.keyword('cyan')('Downloading Complete.'));
        },
        onError: (err) => {
            handleErrors(err);
        },
        onProgress: (curr, total) => {
            if (curr !== total) {
                var bar = new progress('[:bar] ' + chalk.keyword('green')(':percent') + chalk.keyword('yellow')(`  ${(curr / 1048576).toFixed(2)} MB`) + chalk.keyword('gray')(` / ${(total / 1048576).toFixed(2)} MB`), {
                    complete: chalk.bgKeyword('white').keyword('black')(' '),
                    incomplete: chalk.keyword('gray')('-'),
                    width: 50,
                    total: total / 1048576
                });
                dank = curr - dank;
                bar.tick(curr / 1048576);
            }
            // deletes the previous line
            // process.stdout.write('\r\x1b[K');
            // 1048576 is the number of bytes in a megabyte.
            // process.stdout.write('Progress: ' + `${(curr / total * 100).toFixed(2)} %` + `${(curr / 1048576).toFixed(2)} MB / ${(total / 1048576).toFixed(2)} MB`);
        },
    }
    var dd = dl(url, option);
};

var type = 1;

if(process.argv[2] === "--old" || process.argv[2] === "-o") {
    type = 0;
} else if(process.argv[2] === "--help" || process.argv[2] === "-h" || process.argv[2] !== undefined) {
    console.log(chalk.keyword('cyan')("usage: ") +"npm start [-h] [-o]\n");
    console.log(chalk.keyword('cyan')("Options:"));
    console.log("\t" + chalk.keyword('gray')("-h, --help") + "                 shows the help menu");
    console.log("\t" + chalk.keyword('gray')("-o, --old") + "                  downloads the 32-bit version of Chromium")
    return 0;
}

process.stdout.write('\r\x1b[K');
process.stdout.write(chalk.keyword('cyan')('Finding Package.'));

var options = {
    host: 'api.github.com',
    path: '/repos/henrypp/chromium/releases',
    headers: {'User-Agent': 'Mozilla/5.0'}
};

https.get(options, (resp) => {
    let data = '';

    resp.on('data', (chunk) => {
        data += chunk;
    });

    resp.on('end', () => {
        var url = JSON.parse(data)[type].assets[0].browser_download_url;
        process.stdout.write('\r\x1b[K');
        process.stdout.write(chalk.keyword('cyan')(`Package Found`) + ' : ' + chalk.keyword('gray')(url) + '\n');
        redirectLinkFinder(url);
    });

}).on("error", (err) => {
    handleErrors(err);
});