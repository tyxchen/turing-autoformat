function zero (i : int) : boolean
    result i = 0
end zero

function can_be_int (s : string) : boolean
    result strintok (s)
end can_be_int

function canBeReal (s : string) : boolean
    result strrealtok (s)
end canBeReal

function is_an_int (s : string) : boolean
    result strinok (s)
end is_an_int

function isAReal (s : string) : boolean
    result strrealok (s)
end isAReal
