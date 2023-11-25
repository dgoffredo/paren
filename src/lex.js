// TODO: no
function define(name, deps, constructor) {
    module.exports = constructor();
}
// end TODO

define('lex', [], function () {

const regexes = [
    {string:           /"(?:[^"\\]|\\.)*"/},
    {atString:           /@"(?:[^"\\]|\\.)*"/},
    {openParenthesis:  /\(/},
    {closeParenthesis: /\)/},
    {whitespace:       /\s+/},
    {number:           /-?(?:0|[1-9]\d*)(?:\.\d+)?/},
    {comment:          /;[^\n]*(?:\n|$)/},
    {symbol:           /[^";\d\s()[\]{}][^";\s()[\]{}]*/},
].map(entry => {
    const [kind]  = Object.keys(entry),
          pattern = entry[kind].source;
    return {kind, pattern};
});

// /(foo)|(bar)|(baz)/ etc.
const regex =
    new RegExp(regexes.map(entry => `(${entry.pattern})`).join('|'), 'gu');

// TODO: count line numbers
function rawTokens(input) {
    var matches,
        matchString,
        which,
        previousEnd = 0,
        result = [],
        defined = x => x !== undefined;

    regex.lastIndex = 0;

    while ((matches = regex.exec(input)) !== null) {
        matchString = matches[0];
        which       = Array.from(matches).slice(1).findIndex(defined);
        if (matches.index !== previousEnd) {
            throw Error(`Text from offset ${previousEnd} to ` +
                            `${matches.index} does not form a valid ` +
                            `token. The text is: ` +
                            input.slice(previousEnd, matches.index));
        }

        previousEnd = matches.index + matchString.length;

        result.push({kind: regexes[which].kind, text: matchString});           
    }

    if (previousEnd !== input.length) {
        throw Error(`Text from offset ${previousEnd} until the end ` +
                        'does not match any tokens: '+
                        input.slice(previousEnd, input.length));
    }

    return result;
};

// `destring` escapes all ASCII control characters in its argument string
// (except for \0), and returns the JSON-decoded result.
//
// The idea is that we want to JSON decode the (double-quoted) argument, but we
// also want to tolerate unescaped control characters in the input, i.e.
// allow literal newlines in the input string. So, we first escape any
// unescaped control characters, and then pass the result to `JSON.parse`.
const destring = (function () {
    const escape = input =>
        // \p{Cc} is the unicode character class for ASCII control characters.
        // (Cc is for "C control characters," i.e. from the C programming language,
        // while there is also Cf for "format control characters," which are
        // specific to Unicode and not considered here).
        // The "u" ("unicode") flag is necessary for the \p{...} syntax to act
        // on the input.
        input.replace(/\p{Cc}/gu, char =>
            JSON.stringify(char).slice(1, -1));
    
    return input =>
        JSON.parse(escape(input));
}());

function tokens(input) {
    return rawTokens(input).map(token => {
        if (token.kind === 'string') {
            return {kind: token.kind, text: destring(token.text)};
        } else if (token.kind == 'atString') {
            return {kind: token.kind, text: destring(token.text.slice(1))};
        } else {
            return token;
        }
    });
}

return {tokens};

});
