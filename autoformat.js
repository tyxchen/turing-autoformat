#!/usr/bin/env nodejs

// Autoformatter for Turing

const fs = require('fs'),
      argv = require('minimist')(process.argv.slice(2), {boolean:true});

var files = argv._;

// Check for flags, and process them
var flags = argv.flags || null;

var format = require('./format.js')(flags);

/**
 * Main procedure
 */
files.forEach(file => {
    fs.readFile(file, 'utf8', (err, data) => {
        var ext = (argv.e || argv.extension) || "";
        var out = (argv.o || argv.out) || file + ext;

        if (err) throw err;

        data = format.format(data);

        if ((argv.e || argv.extension) || (argv.o || argv.out) || (argv.r || argv.replace)) {
            fs.writeFile(out, data, err => {
                if (err) throw err;
                console.log(out + " has been saved");
            });
        } else {
            console.log(data);
        }
    });
});
