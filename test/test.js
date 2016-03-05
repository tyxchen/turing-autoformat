#!/usr/bin/env nodejs

"use strict";

const fs = require('fs'),
      chalk = require('chalk'),
      expect = require('unexpected'),
      format = require('../format.js')();

// Custom assertion for Unexpected

expect.addAssertion('<string> to format into <string> <string>', (expect, subject, testcase, object) => {
    var formatted = format[testcase].call(this, subject).split('\n'),
        expected = object.split('\n');

    expect.subjectOutput = function (output) {
        output.text('\n' + subject.substr(0, 80) + '...\n');
    }
    expect.argsOutput = function (output) {
        output.text('\n' + object.substr(0, 80) +'...\n\nusing ').appendInspected(testcase);
    }

    for (let i=0; i<formatted.length; i++) {
        expect(formatted[i] , '[not] to equal', expected[i]);
    }
});

describe('TuringAutoformat', function () {
    fs.readdir('test/cases/', function (err, files) {
        if (err) throw err;

        files.forEach(function (file) {
            var input, output;

            input = fs.readFileSync('test/cases/' + file + '/in.t', 'utf8');
            output = fs.readFileSync('test/cases/' + file + '/out.t', 'utf8');

            describe(file, function () {
                it('should format correctly', function () {
                    expect(input, 'to format into', file, output);
                });
            });
        });
    });
});

describe('test', function () {
    it('should do something', function () {
        expect(1, 'to equal', 1);
    });
});
