% @var sentenceCase : boolean 'Tis a testing variable
% @var sentenceCaseUnderline : pointer 'Tis another testing variable
var sentenceCase : string := "camelCase is awesome!"
var sentenceCaseUnderline : pointer to Class

var lowerCase : boolean := true
var lowerCaseAgain : int := 0

put lowerCase
put lowerCaseAgain

assert sentenceCase ~= sentenceCaseUnderline
