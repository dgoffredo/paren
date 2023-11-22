What are the valid javascript variable names?

From the StackOverflow [answer](https://stackoverflow.com/a/9337047):

> An identifier must start with $, _, or any character in the Unicode
> categories “Uppercase letter (Lu)”, “Lowercase letter (Ll)”, “Titlecase
> letter (Lt)”, “Modifier letter (Lm)”, “Other letter (Lo)”, or “Letter number
> (Nl)”.
>
> The rest of the string can contain the same characters, plus any U+200C zero
> width non-joiner characters, U+200D zero width joiner characters, and
> characters in the Unicode categories “Non-spacing mark (Mn)”, “Spacing
> combining mark (Mc)”, “Decimal digit number (Nd)”, or “Connector punctuation
> (Pc)”.

What does the library look like?
```js
const paren = require('paren');

const schema = paren.parse_schema({string: TODO});
const doc = paren.parse_document({file: TODO, schema});
```

Maybe these operations:
```js
define([], function() {

function decode_schema({string}) {}
function decode_document({schema, string}) {}
function encode_schema({schema, ...}) {}
function encode_document({document, ...}) {}

// hmmm...
// function to_json
// function to_yaml

return {
  decode_schema,
  decode_document,
  encode_schema,
  encode_document,
  to_json,
  to_yaml,
});
```

To test implementations, there must be a notion of the "doc" that results from a parse.
```
value  ::=  string | number | true | false | form

form  ::=  tag attributes? child*

tag  ::=  string

string  ::=  value flavor

flavor  ::=  symbol | literal

child  ::=  value

attributes  ::=  {string: value}
```

Imagine operations on a `value`:

- `value_type(value)   ->  "string" | "number" | "boolean" | "form"`
- `string_flavor(string)  ->  "symbol" | "literal"`
- `form_tag(form)  ->  string`
- `form_attribute_count(form)  ->  number`
- `form_has_attribute(form, string)  ->  boolean`
- `form_attribute(form, string)  ->  value`
- `form_child_count(form)  ->  number`
- `form_child(form, number)  ->  value`
- `string_equal(s1, s2)  ->  boolean`
- `number_equal(n1, n2)  ->  boolean`
- `boolean_equal(b1, b2)  ->  boolean`
- `push(value)  ->  value`
- `boolean_negate  ->  boolean`
- `assert`

A test is then a pair of schema and document together with a program in terms
of the above operations.

Schema:
```clojure
(+ person
  (name @string)
  (? age @number))
```

Document:
```clojure
(person
  (name "John"))
(person
  (name "Paul")
  (age 75))
(person
  (name "George"))
(person
  (name "Ringo")
  (age 79))
```

Program:
```
; Concerns:
; - there are three people
; - the first is named "John"
; - ...

- value_type
  push "form"
  string_equal
- form_child_count
  push 3
  number_equal
- push 0
  form_child
  - value_type
    push "form"
    string_equal
  - form_tag
    push "person"
    string_equal
  - push "name"
    - form_has_attribute
    - form_attribute
      push "John"
      string_equal
  - push "age"
    form_has_attribute
    boolean_negate
- push 1
  form_child
  - value_type
    push "form"
    string_equal
  - form_tag
    push "person"
    string_equal
  - push "name"
    form_has_attribute
  - push "name"
    form_attribute
    push "Paul"
    string_equal
  - push "age"
    - form_has_attribute
    - form_attribute
      push 75
      number_equal


```
