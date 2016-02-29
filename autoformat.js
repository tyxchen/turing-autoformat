#!/usr/bin/env nodejs

// Autoformatter for Turing

const fs = require('fs'),
      argv = require('minimist')(process.argv.slice(2)),
      format = require('./format.js');

var files = argv._;


/**
 * Main procedure
 */
files.forEach(name => {
    fs.readFile(name, 'utf8', (err, data) => {
        var ext = (argv.e || argv.extension) || "";

        if (err) throw err;

        data = format.format(data);

        fs.writeFile(name + ext, data, err => {
            if (err) throw err;
            console.log(name + ext + " has been saved")
        });
    });
});
