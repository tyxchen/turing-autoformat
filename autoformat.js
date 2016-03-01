#!/usr/bin/env nodejs

// Autoformatter for Turing

const fs = require('fs'),
      argv = require('minimist')(process.argv.slice(2), {boolean:true});

var files = argv._;

// Check for flags, and process them
var flags = argv.flags || null;

var format = require('./format.js')(flags);

console.log(argv)

/**
 * Main procedure
 */
files.forEach(file => {
    fs.readFile(file, 'utf8', (err, data) => {
        var ext = (argv.e || argv.extension) || "";
        var out = (argv.o || argv.out) || file + ext;

        if (err) throw err;

        data = format.format(data);

        if (argv.s || argv.stdio) {
            console.log(data);
        } else {
            fs.writeFile(out, data, err => {
                if (err) throw err;
                console.log(out + " has been saved");
            });
        }
    });
});
