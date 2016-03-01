module.exports = (passedFlags) => {

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
        data = data.replace(/function (.+?)(?=[\s:\(].*(?=boolean))/g, (m, name) => {
            // Replace only if function name does not start with `is_` already
            if (name.slice(0, 3) !== "is_") {
                // Add function name to list of functions used
                funcs.push(name)

                // Add converted name to list of converted function names
                replaced.push("is_" + name);
            }

            return "function " + name;
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
        data = data.replace(/const ([a-zA-Z0-9_]+)/g, (m, name) => {
            // Add constant name to list of constants used
            consts.push(name);

            // Convert from camelCase to UPPER_CASE
            name = name.replace(/([a-z])(?=[A-Z0-9])/g, "$1_").toUpperCase();

            // Add converted name to list of converted constants
            replaced.push(name);

            return "const " + name;
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
        data = data.replace(/var ([a-zA-Z0-9_]+)([\s:]*.*)(:=)?/g, (m, name, type) => {
            // Replace only if the type is not a pointer (which in turn means the declaration is nil)
            if (type.indexOf("pointer") === -1) {
                // Add variable name to list of variables used
                vars.push(name);

                // Convert from SentenceCase to camelCase
                name = name[0].toLowerCase() + name.substr(1);
                // or to lower_case
                // name = name.replace(/([a-z])(?=[A-Z0-9])/g, "$1_").toLowerCase();

                // Add converted name to list of converted variables
                replaced.push(name);
            }

            return "var " + name + type;
        });

        data = __formatSubsequentUses(vars, replaced, data);

        return data;
    };

    /**
     * Fix incorrect placement of comments
     */
    var formatComments = (data) => {
        return data.replace(/([ \t]*)(.+)%(.+)/g, (m, indentation, statement, comment) => {
            // Checks if the number of unescaped quotes before the % sign is odd
            // If it is, the % sign is in a string and we don't do any modifications
            if ((statement.match(/[^\\]"/g) || []).length % 2 || (statement.match(/[^\\]'/g) || []).length % 2)
                return m;

            return indentation + "%" + comment + "\n" + indentation + statement;
        });
    };

    /**
     * Wrapper for all formatting functions
     */
    var format = (data) => {
        data = formatComments(data);
        data = formatConsts(data);
        data = formatVars(data);
        data = formatBoolFuncs(data);
        return data;
    };

    return {
        formatComments,
        formatVars,
        formatConsts,
        formatBoolFuncs,
        format
    };
};
