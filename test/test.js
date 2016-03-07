#!/usr/bin/env nodejs

"use strict";

const fs = require('fs'),
    //   chalk = require('chalk'),
      expect = require('unexpected'),
      format = require('../format.js')();

// Custom assertion for Unexpected
// Consists of custom text and a custom diff to make my life looking at line numbers easier
expect.addAssertion('<string> to format into <string> <string>', (expect, subject, expected, testcase) => {
    expect.withError(() => {
        expect.subjectOutput = function (output) {
            output.text('\n' + subject.substr(0, 80) + '...\n');
        }
        expect.argsOutput = function (output) {
            output.text('\n' + expected.substr(0, 80) +'...\n\nusing ').appendInspected(testcase);
        }

        expect(subject, '[not] to equal', expected);
    }, (e) => {
        expect.fail({
            // Creates a diff that prepends line numbers to output
            diff (output, diff) {
                // diffArr is an array of each line of the diff
                // repeat is a string function that repeats str n times
                var diffArr = diff(subject, expected).toString('ansi').split('\n'),
                    repeat = (str, n) => new Array(n+1).join(str);

                // Line numbers are 1-indexed, so $line follows this convention
                for (let line=1; line<=diffArr.length; line++) {
                    // get digit lengths
                    let lenD = (diffArr.length).toString().length,
                        lenI = (line).toString().length;

                    diffArr[line-1] = repeat(' ', lenD - lenI + 4) + line + ' | ' + diffArr[line-1];
                }

                return output.text(diffArr.join('\n') + '\n');
            }
        });
    });
});

describe('TuringAutoformat', function () {
    it('works', function () {});

    fs.readdir('test/cases/', function (err, files) {
        if (err) throw err;

        files.forEach(function (file) {
            var input, output;

            input = fs.readFileSync('test/cases/' + file + '/in.t', 'utf8');
            output = fs.readFileSync('test/cases/' + file + '/out.t', 'utf8');

            // Format input with the formatter corresponding to this testcase
            input = format[file].call(this, input);

            describe(file, function () {
                it('should be formatted correctly', function () {
                    expect(input, 'to format into', output, file);
                });
            });
        });
    });
});
