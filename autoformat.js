#!/usr/bin/env nodejs

// Autoformatter for Turing

const fs = require('fs'),
      argv = require('minimist')(process.argv.slice(2));

var files = argv._;

/**
 * Functions
 */

/**
 * Helper function to format subsequent uses of a word
 *
 * @param source Array of values to be replaced
 * @param replacement Array of values to use for the replacements
 * @param data Data to be modified
 */
var __formatSubsequentUses = (source, replacement, data) => {
    source.forEach((cur, i) => {
        // unformattedRegex: Matches unformatted uses of the iterated name
        // fpStringRegex: Matches false positive uses of the formatted name in strings
        // fpOpenRegex: Matches false positive uses of the formatted name in open expressions
        //              e.g. single-line comments
        var unformattedRegex = new RegExp(cur, 'g');
        var fpStringRegex = new RegExp('(["\'].*)' + replacement[i] + '(?=.*?["\'])', 'g');

        data = data.replace(unformattedRegex, replacement[i]);
        // Fix any accidental formatting
        data = data.replace(fpStringRegex, (m, sub) => sub + cur);
    });

    return data;
};

/**
 * Automatically prepend `is_` to boolean functions
 *
 * (.+) - Matches the function name
 * (?=[\s:\(] - Matches the ending delimiter for the function name. Whitespace, colon (define type),
 *               or left bracket (define arguments)
 * (?=boolean)) - Matches only functions that return a boolean type
 */
var formatBoolFuncs = (data) => {
    var funcs = [],
        replaced = [];

    // Format function declarations
    data = data.replace(/function (.+?)(?=[\s:\(].*(?=boolean))/g, (m, sub) => {
        // Add function name to list of functions used
        funcs.push(sub)

        // Add converted name to list of converted function names
        replaced.push("is_" + sub);

        return "function " + sub;
    });

    data = __formatSubsequentUses(funcs, replaced, data);

    return data;
};

/**
 * Format constants from camelCase to UPPER_CASE
 */
var formatConsts = (data) => {
    var consts = [],
        replaced = [];

    // Format const declarations
    data = data.replace(/const ([a-zA-Z0-9_]+)/g , (m, sub) => {
        // Add constant name to list of constants used
        consts.push(sub);

        // Convert from camelCase to UPPER_CASE
        sub = sub.replace(/([a-z])(?=[A-Z0-9])/g, "$1_").toUpperCase();

        // Add converted name to list of converted constants
        replaced.push(sub);

        return "const " + sub;
    });

    data = __formatSubsequentUses(consts, replaced, data);

    return data;
};

/**
 * Format variables to camelCase (or lower_case)
 */
var formatVars = (data) => {
    var vars = [],
        replaced = [];

    // Format var declarations that are not pointers to objects
    // ([a-zA-Z0-9_]+) - variable name
    // ([\s:]*.*) - variable type (optional)
    // (:=)? - variable declaration (optional)
    data = data.replace(/var ([a-zA-Z0-9_]+)([\s:]*.*)(:=)?/g , (m, sub, type) => {
        // Replace only if the type is not a pointer (which in turn means the declaration is nil)
        if (type.indexOf("pointer") === -1) {
            // Add variable name to list of variables used
            vars.push(sub);

            // Convert from SentenceCase to camelCase
            sub = sub[0].toLowerCase() + sub.substr(1);
            // or to lower_case
            // sub = sub.replace(/([a-z])(?=[A-Z0-9])/g, "$1_").toLowerCase();

            // Add converted name to list of converted variables
            replaced.push(sub);
        }

        return "var " + sub + type;
    });

    data = __formatSubsequentUses(vars, replaced, data);

    return data;
};

/**
 * Main procedure
 */
files.forEach(name => {
    fs.readFile(name, 'utf8', (err, data) => {
        var ext = (argv.e || argv.extension) || "";

        if (err) throw err;

        data = formatConsts(data);
        data = formatVars(data);
        data = formatBoolFuncs(data);

        fs.writeFile(name + ext, data, err => {
            if (err) throw err;
            console.log(name + ext + " has been saved")
        });
    });
});
