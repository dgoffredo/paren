(define => {

define('parse', [], function () {
/*
Here is the grammar:

    datum  ::=   STRING
            |    NUMBER
            |    SYMBOL
            |    COMMENT
            |    list

    list   ::=   "(" datum* ")"

Here are the resulting parse tree nodes:

    {string: ...}  // unquoted and unescaped,
                   with a property {flavor: "atString" | "string"}
    {number: ...}  // the _text_ of the number
    {symbol: ...}  // as a string
    {list: ...}    // as an array

Note that whitespace tokens are ignored during parsing.
*/

function parseList(tokens, index) {
    // The idea is to parse (`doParse`) elements until the parser returns
    // `undefined` as its parsed value. This will mean that we've encountered a
    // token for which the parser has no case, which means it's a closing
    // bracket/brace/parenthesis. Then do some error checking to make sure the
    // closing token is as expected, and finally return the array of parsed
    // elements and the following token index.
    const result = [];
    var   parsed, tokenAfter;
    for (;;) {
        [parsed, index] = doParse(tokens, index);
        if (parsed === undefined) {
            break;
        }

        result.push(parsed);
    };

    if (index >= tokens.length) {
        // assert.deepEqual(() => index,() => tokens.length);
        throw Error(`Reached end without expected ")"`);
    }

    tokenAfter = tokens[index];
    if (tokenAfter.text !== ')') {
        throw Error('Mismatched grouping tokens. Expected a closing ' +
                        `")" but found a ${tokenAfter.kind}: ` +
                        tokenAfter.text);
    }

    return [{list: result}, index + 1];
}

function doParse(tokens, index) {
    if (index === tokens.length) {
        return;
    }

    const token = tokens[index];

    switch (token.kind) {
    case 'string': return [{string: token.text, flavor: 'string'}, index + 1];
    case 'atString': return [{string: token.text, flavor: 'atString'}, index + 1];
    case 'number': return [{number: token.text}, index + 1];
    case 'symbol': return [{symbol: token.text}, index + 1];
    case 'openParenthesis': return parseList(tokens, index + 1);
    default:
        return [undefined, index];
    }
}

function parseOne(tokens) {
    tokens = tokens.filter(token => token.kind !== 'whitespace');
    const [parsed, indexAfter] = doParse(tokens, 0);
    return parsed;
}

function parseAll(tokens) {
    tokens = tokens.filter(token => token.kind !== 'whitespace');
    const values = [];
    let index = 0;
    while (index !== tokens.length) {
        const [value, indexAfter] = doParse(tokens, index);
        values.push(value);
        index = indexAfter;
    }
    return values;
}

return {parseOne, parseAll};

});

})(typeof define === 'undefined' ?
    function (name, deps, constructor) {
        module.exports = constructor();
    } : define);
