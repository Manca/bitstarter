#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var restler = require('restler');

var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://glacial-stream-4542.herokuapp.com/";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var cheerioURL = function(url) {
  var buff;
  restler.get(url).on("complete", function(result) {
//	console.log(result.toString());
//	return cheerio.load(result.toString());
      buff = new Buffer(result,'ascii');
      console.log("SAD IMA:!!!: " + buff.toString());
   });
//console.log(buff.toString());
}; 

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var checkURL = function(url, checksfile) {
    restler.get(url).on("complete", function(result) {
	$ = cheerio.load(result.toString());
	var checks = loadChecks(checksfile).sort();
	var out = {};
	for (var ii in checks) {
	    var present = $(checks[ii]).length > 0;
	    out[checks[ii]] = present;
	}
    return out;
    });

};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url  <url>', 'URL from the web')
        .parse(process.argv);

    var checkJson;
    var outJson;

    if (program.url != null) {
	restler.get(program.url).on("complete", function(result) {
	$ = cheerio.load(result.toString());
	var checks = loadChecks(program.checks).sort();
	var out = {};
	for (var ii in checks) {
	    var present = $(checks[ii]).length > 0;
	    out[checks[ii]] = present;
	}

	checkJson = out;
        outJson = JSON.stringify(checkJson, null, 4);
	console.log(outJson);
    });

    }
    else if (program.file != null) {
       checkJson = checkHtmlFile(program.file, program.checks);
       outJson = JSON.stringify(checkJson, null, 4);
       console.log(outJson);
    }

    
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
