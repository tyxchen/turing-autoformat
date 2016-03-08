function isZero (i : int) : boolean
    result i = 0
end isZero

function is_can_be_int (s : string) : boolean
    result strintok (s)
end is_can_be_int

function isCanBeReal (s : string) : boolean
    result strrealtok (s)
end isCanBeReal

function is_an_int (s : string) : boolean
    result strinok (s)
end is_an_int

function isAReal (s : string) : boolean
    result strrealok (s)
end isAReal
