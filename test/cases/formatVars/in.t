% @var SentenceCase : boolean 'Tis a testing variable
% @var sentenceCaseUnderline : pointer 'Tis another testing variable
var SentenceCase : string := "camelCase is awesome!"
var sentenceCaseUnderline : pointer to Class

var lower_case : boolean := true
var lower_case_again : int := 0

put lower_case
put lower_case_again

assert SentenceCase ~= sentenceCaseUnderline
