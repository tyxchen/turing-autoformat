# turing-autoformat

[![Circle CI](https://circleci.com/gh/tyxchen/turing-autoformat/tree/master.svg?style=svg)](https://circleci.com/gh/tyxchen/turing-autoformat/tree/master)

Autoformatter for the Turing language. This is not a linter.

Currently supports renaming constants, variables and boolean functions, as well as formatting "misplaced" comments.

Requires NodeJS >= 4.0.0

# Usage

    node[js] autoformat.js [files] [options] [flags]

# Options

|Name|Argument type|Description|
|----|-------------|-----------|
|`--extension=`,`-e `|string|File extension to use for each of the outputted files|
|`--out=`, `-o `|string|File to output formatted content to|
|`--replace`, `-r`|boolean|Replace the contents of the original file|

# Flags

|Name|Description|
|----|-----------|
|`--flags.lowerCaseVariables`|Format variables as `lower_case` instead of `camelCase`|
|`--flags.sentenceCasePointers`|Format pointers as `SentenceCase` instead of `camelCase`. If used with `--flags.lowerCaseVariables`, this flag will not have any effect|

# Why make this?

My teacher takes off marks for not following the (unofficial) [Turing Style Guideline](http://wiki.compsci.ca/index.php?title=Turing_Style_Guideline) to the letter. Well, guess what? This class is way too boring, and Turing too horrible a language, for me to learn anything. Thus, I shall use this project to learn how to use NodeJS.

## But...why NodeJS?

Ruby is too slow, and I'm too lazy to install Python on this partition, so NodeJS it is.
