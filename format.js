var TuringAutoformat = (passedFlags) => {

    var exports = {},
        formatTempl = [];

    var flags = {
        lowerCaseVariables: false,
        sentenceCasePointers: false
    };

    if (passedFlags instanceof Object) {
        for (var flag in passedFlags) {
            var value = passedFlags[flag];

            switch (value) {
            case 1:
            case "1":
            case "true":
                value = true;
                break;
            case 0:
            case "0":
            case "false":
                value = false;
                break;
            }

            flags[flag] = value;
        }
    }

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
            var unformattedRegex = new RegExp('([\( \t\n])' + cur + '([,;\) \t\r\n])', 'g');
            var fpStringRegex = new RegExp('(["\'].*)' + replacement[i] + '(?=.*?["\'])', 'g');

            // data = data.replace(unformattedRegex, replacement[i]);
            data = data.replace(unformattedRegex, "$1" + replacement[i] + "$2");
            // Fix any accidental formatting
            data = data.replace(fpStringRegex, "$1" + cur);
        });

        return data;
    };

    /**
     * Automatically prepend `is[_]` to boolean functions
     */
    exports.formatBoolFuncs = (data) => {
        var funcs = [],
            replaced = [];

        // Format function declarations
        // (.+) - Matches the function name
        // (?=[\s:\(] - Matches the ending delimiter for the function name. Whitespace, colon (define type),
        //              or left bracket (define arguments)
        // .* - Matches the function's arguments and type delimiter
        // (?=boolean)) - Matches only functions that return a boolean type
        data = data.replace(/function (.+?)(?=[\s:\(].*(?=boolean))/g, (m, name) => {
            // Replace only if function name does not start with `is` already
            if (name.slice(0, 2) !== 'is') {
                // Add function name to list of functions used
                funcs.push(name)

                // Check if function name is in camelCase or lower_case. Defaults to latter.
                // Then, add converted name to list of converted function names
                if (name.indexOf('_') !== -1) {
                    replaced.push('is_' + name);
                } else {
                    replaced.push('is' + name[0].toUpperCase() + name.slice(1));
                }
            }

            return "function " + name;
        });

        data = __formatSubsequentUses(funcs, replaced, data);

        return data;
    };

    /**
     * Format constants from camelCase to UPPER_CASE
     */
    exports.formatConsts = (data) => {
        var consts = [],
            replaced = [];

        // Format const declarations
        // ([^@]|^) - ignore Java-style doc comments, but if no preceding char is found (SOF)
        //            use the start-of-line character
        // (\w+) - constant name
        data = data.replace(/([^@]|^)const (\w+)/g, (m, s, name) => {
            // Add constant name to list of constants used
            consts.push(name);

            // Convert from camelCase to UPPER_CASE
            name = name.replace(/([a-z])(?=[A-Z0-9])/g, "$1_").toUpperCase();

            // Add converted name to list of converted constants
            replaced.push(name);

            return s + "const " + name;
        });

        data = __formatSubsequentUses(consts, replaced, data);

        return data;
    };

    /**
     * Format variables to camelCase (or lower_case)
     */
    exports.formatVars = (data) => {
        var vars = [],
            replaced = [];

        // Format var declarations that are not pointers to objects
        // ([^@]|^) - ignore Java-style doc comments, but if no preceding char is found (SOF)
        //            use the start-of-line character
        // (\w+) - variable name
        // ([\s:]*\w+) - variable type (optional)
        data = data.replace(/([^@]|^)var (\w+)([\s:]*\w+)/g, (m, s, name, type) => {
            if (flags.lowerCaseVariables) {
                // Flag set to format variables in lower_case

                // Add variable name to list of variables used
                vars.push(name);

                // Convert to lower_case
                name = name.replace(/([a-z])(?=[A-Z0-9])/g, "$1_").toLowerCase();

                // Add converted name to list of converted variables
                replaced.push(name);
            } else if (type.indexOf("pointer") === -1) {
                // Replace only if the type is not a pointer (which in turn means the declaration is nil)

                // Add variable name to list of variables used
                vars.push(name);

                // Convert from lower_case to camelCase
                name = name.replace(/_+([\w])/g, (m, l) => l.toUpperCase());
                // and from SentenceCase to camelCase
                name = name[0].toLowerCase() + name.slice(1);

                // Add converted name to list of converted variables
                replaced.push(name);
            } else if (flags.sentenceCasePointers) {
                // Editing pointer, flag for SentenceCase pointers set

                // Add variable name to list of variables used
                vars.push(name);

                // Capitalize first letter
                name = name[0].toUpperCase() + name.slice(1);

                // Add converted name to list of converted variables
                replaced.push(name);
            }

            return s + "var " + name + type;
        });

        data = __formatSubsequentUses(vars, replaced, data);

        return data;
    };

    /**
     * Fix incorrect placement of comments
     */
    exports.formatComments = (data) => {
        // Match comment declarations at the end of statements
        // ([ \t]*) - Indentation of the line
        // (.+) - Statement preceding comment
        // %(.+) - The comment itself
        return data.replace(/([ \t]*)(.+)(?:[ \t]]*)%(.+)/g, (m, indentation, statement, comment) => {
            // Checks if the number of unescaped quotes before the % sign is odd
            // If it is, the % sign is in a string and we don't do any modifications
            if ((statement.match(/[^\\]"/g) || []).length % 2 || (statement.match(/[^\\]'/g) || []).length % 2 || statement.trim().length === 0)
                return m;

            return indentation + "%" + comment + "\r\n" + indentation + statement;
        });
    };

    /**
     * Create wrapper for all formatting functions
     */

    for (var f in exports) {
        if (exports.hasOwnProperty(f) && exports[f] !== undefined) {
            formatTempl.push('data=this.' + f + '(data);');
        }
    }

    formatTempl.push('return data;');

    exports.format = new Function('data', formatTempl.join('')).bind(exports);

    return exports;
};

if (typeof window !== "undefined") {
    // browser environment
    window.TuringAutoformat = TuringAutoformat;
} else {
    // NodeJS environment
    module.exports = TuringAutoformat;
}
