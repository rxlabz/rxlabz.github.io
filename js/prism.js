/* http://prismjs.com/download.html?themes=prism-okaidia&languages=markup+css+clike+javascript+dart+git+markdown+php+php-extras+jsx+sass+scss+sql+swift+typescript+wiki&plugins=previewer-base+previewer-color+previewer-easing */
var _self = (typeof window !== 'undefined')
    ? window   // if in browser
    : (
    (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope)
        ? self // if in worker
        : {}   // if in node js
);

/**
 * Prism: Lightweight, robust, elegant syntax highlighting
 * MIT license http://www.opensource.org/licenses/mit-license.php/
 * @author Lea Verou http://lea.verou.me
 */

var Prism = (function(){

// Private helper vars
    var lang = /\blang(?:uage)?-(?!\*)(\w+)\b/i;

    var _ = _self.Prism = {
        util: {
            encode: function (tokens) {
                if (tokens instanceof Token) {
                    return new Token(tokens.type, _.util.encode(tokens.content), tokens.alias);
                } else if (_.util.type(tokens) === 'Array') {
                    return tokens.map(_.util.encode);
                } else {
                    return tokens.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\u00a0/g, ' ');
                }
            },

            type: function (o) {
                return Object.prototype.toString.call(o).match(/\[object (\w+)\]/)[1];
            },

            // Deep clone a language definition (e.g. to extend it)
            clone: function (o) {
                var type = _.util.type(o);

                switch (type) {
                    case 'Object':
                        var clone = {};

                        for (var key in o) {
                            if (o.hasOwnProperty(key)) {
                                clone[key] = _.util.clone(o[key]);
                            }
                        }

                        return clone;

                    case 'Array':
                        // Check for existence for IE8
                        return o.map && o.map(function(v) { return _.util.clone(v); });
                }

                return o;
            }
        },

        languages: {
            extend: function (id, redef) {
                var lang = _.util.clone(_.languages[id]);

                for (var key in redef) {
                    lang[key] = redef[key];
                }

                return lang;
            },

            /**
             * Insert a token before another token in a language literal
             * As this needs to recreate the object (we cannot actually insert before keys in object literals),
             * we cannot just provide an object, we need anobject and a key.
             * @param inside The key (or language id) of the parent
             * @param before The key to insert before. If not provided, the function appends instead.
             * @param insert Object with the key/value pairs to insert
             * @param root The object that contains `inside`. If equal to Prism.languages, it can be omitted.
             */
            insertBefore: function (inside, before, insert, root) {
                root = root || _.languages;
                var grammar = root[inside];

                if (arguments.length == 2) {
                    insert = arguments[1];

                    for (var newToken in insert) {
                        if (insert.hasOwnProperty(newToken)) {
                            grammar[newToken] = insert[newToken];
                        }
                    }

                    return grammar;
                }

                var ret = {};

                for (var token in grammar) {

                    if (grammar.hasOwnProperty(token)) {

                        if (token == before) {

                            for (var newToken in insert) {

                                if (insert.hasOwnProperty(newToken)) {
                                    ret[newToken] = insert[newToken];
                                }
                            }
                        }

                        ret[token] = grammar[token];
                    }
                }

                // Update references in other language definitions
                _.languages.DFS(_.languages, function(key, value) {
                    if (value === root[inside] && key != inside) {
                        this[key] = ret;
                    }
                });

                return root[inside] = ret;
            },

            // Traverse a language definition with Depth First Search
            DFS: function(o, callback, type) {
                for (var i in o) {
                    if (o.hasOwnProperty(i)) {
                        callback.call(o, i, o[i], type || i);

                        if (_.util.type(o[i]) === 'Object') {
                            _.languages.DFS(o[i], callback);
                        }
                        else if (_.util.type(o[i]) === 'Array') {
                            _.languages.DFS(o[i], callback, i);
                        }
                    }
                }
            }
        },
        plugins: {},

        highlightAll: function(async, callback) {
            var elements = document.querySelectorAll('code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code');

            for (var i=0, element; element = elements[i++];) {
                _.highlightElement(element, async === true, callback);
            }
        },

        highlightElement: function(element, async, callback) {
            // Find language
            var language, grammar, parent = element;

            while (parent && !lang.test(parent.className)) {
                parent = parent.parentNode;
            }

            if (parent) {
                language = (parent.className.match(lang) || [,''])[1];
                grammar = _.languages[language];
            }

            // Set language on the element, if not present
            element.className = element.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;

            // Set language on the parent, for styling
            parent = element.parentNode;

            if (/pre/i.test(parent.nodeName)) {
                parent.className = parent.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;
            }

            var code = element.textContent;

            var env = {
                element: element,
                language: language,
                grammar: grammar,
                code: code
            };

            if (!code || !grammar) {
                _.hooks.run('complete', env);
                return;
            }

            _.hooks.run('before-highlight', env);

            if (async && _self.Worker) {
                var worker = new Worker(_.filename);

                worker.onmessage = function(evt) {
                    env.highlightedCode = evt.data;

                    _.hooks.run('before-insert', env);

                    env.element.innerHTML = env.highlightedCode;

                    callback && callback.call(env.element);
                    _.hooks.run('after-highlight', env);
                    _.hooks.run('complete', env);
                };

                worker.postMessage(JSON.stringify({
                    language: env.language,
                    code: env.code,
                    immediateClose: true
                }));
            }
            else {
                env.highlightedCode = _.highlight(env.code, env.grammar, env.language);

                _.hooks.run('before-insert', env);

                env.element.innerHTML = env.highlightedCode;

                callback && callback.call(element);

                _.hooks.run('after-highlight', env);
                _.hooks.run('complete', env);
            }
        },

        highlight: function (text, grammar, language) {
            var tokens = _.tokenize(text, grammar);
            return Token.stringify(_.util.encode(tokens), language);
        },

        tokenize: function(text, grammar, language) {
            var Token = _.Token;

            var strarr = [text];

            var rest = grammar.rest;

            if (rest) {
                for (var token in rest) {
                    grammar[token] = rest[token];
                }

                delete grammar.rest;
            }

            tokenloop: for (var token in grammar) {
                if(!grammar.hasOwnProperty(token) || !grammar[token]) {
                    continue;
                }

                var patterns = grammar[token];
                patterns = (_.util.type(patterns) === "Array") ? patterns : [patterns];

                for (var j = 0; j < patterns.length; ++j) {
                    var pattern = patterns[j],
                        inside = pattern.inside,
                        lookbehind = !!pattern.lookbehind,
                        lookbehindLength = 0,
                        alias = pattern.alias;

                    pattern = pattern.pattern || pattern;

                    for (var i=0; i<strarr.length; i++) { // Don’t cache length as it changes during the loop

                        var str = strarr[i];

                        if (strarr.length > text.length) {
                            // Something went terribly wrong, ABORT, ABORT!
                            break tokenloop;
                        }

                        if (str instanceof Token) {
                            continue;
                        }

                        pattern.lastIndex = 0;

                        var match = pattern.exec(str);

                        if (match) {
                            if(lookbehind) {
                                lookbehindLength = match[1].length;
                            }

                            var from = match.index - 1 + lookbehindLength,
                                match = match[0].slice(lookbehindLength),
                                len = match.length,
                                to = from + len,
                                before = str.slice(0, from + 1),
                                after = str.slice(to + 1);

                            var args = [i, 1];

                            if (before) {
                                args.push(before);
                            }

                            var wrapped = new Token(token, inside? _.tokenize(match, inside) : match, alias);

                            args.push(wrapped);

                            if (after) {
                                args.push(after);
                            }

                            Array.prototype.splice.apply(strarr, args);
                        }
                    }
                }
            }

            return strarr;
        },

        hooks: {
            all: {},

            add: function (name, callback) {
                var hooks = _.hooks.all;

                hooks[name] = hooks[name] || [];

                hooks[name].push(callback);
            },

            run: function (name, env) {
                var callbacks = _.hooks.all[name];

                if (!callbacks || !callbacks.length) {
                    return;
                }

                for (var i=0, callback; callback = callbacks[i++];) {
                    callback(env);
                }
            }
        }
    };

    var Token = _.Token = function(type, content, alias) {
        this.type = type;
        this.content = content;
        this.alias = alias;
    };

    Token.stringify = function(o, language, parent) {
        if (typeof o == 'string') {
            return o;
        }

        if (_.util.type(o) === 'Array') {
            return o.map(function(element) {
                return Token.stringify(element, language, o);
            }).join('');
        }

        var env = {
            type: o.type,
            content: Token.stringify(o.content, language, parent),
            tag: 'span',
            classes: ['token', o.type],
            attributes: {},
            language: language,
            parent: parent
        };

        if (env.type == 'comment') {
            env.attributes['spellcheck'] = 'true';
        }

        if (o.alias) {
            var aliases = _.util.type(o.alias) === 'Array' ? o.alias : [o.alias];
            Array.prototype.push.apply(env.classes, aliases);
        }

        _.hooks.run('wrap', env);

        var attributes = '';

        for (var name in env.attributes) {
            attributes += (attributes ? ' ' : '') + name + '="' + (env.attributes[name] || '') + '"';
        }

        return '<' + env.tag + ' class="' + env.classes.join(' ') + '" ' + attributes + '>' + env.content + '</' + env.tag + '>';

    };

    if (!_self.document) {
        if (!_self.addEventListener) {
            // in Node.js
            return _self.Prism;
        }
        // In worker
        _self.addEventListener('message', function(evt) {
            var message = JSON.parse(evt.data),
                lang = message.language,
                code = message.code,
                immediateClose = message.immediateClose;

            _self.postMessage(_.highlight(code, _.languages[lang], lang));
            if (immediateClose) {
                _self.close();
            }
        }, false);

        return _self.Prism;
    }

// Get current script and highlight
    var script = document.getElementsByTagName('script');

    script = script[script.length - 1];

    if (script) {
        _.filename = script.src;

        if (document.addEventListener && !script.hasAttribute('data-manual')) {
            document.addEventListener('DOMContentLoaded', _.highlightAll);
        }
    }

    return _self.Prism;

})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Prism;
}

// hack for components to work correctly in node.js
if (typeof global !== 'undefined') {
    global.Prism = Prism;
}
;
Prism.languages.markup = {
    'comment': /<!--[\w\W]*?-->/,
    'prolog': /<\?[\w\W]+?\?>/,
    'doctype': /<!DOCTYPE[\w\W]+?>/,
    'cdata': /<!\[CDATA\[[\w\W]*?]]>/i,
    'tag': {
        pattern: /<\/?(?!\d)[^\s>\/=.$<]+(?:\s+[^\s>\/=]+(?:=(?:("|')(?:\\\1|\\?(?!\1)[\w\W])*\1|[^\s'">=]+))?)*\s*\/?>/i,
        inside: {
            'tag': {
                pattern: /^<\/?[^\s>\/]+/i,
                inside: {
                    'punctuation': /^<\/?/,
                    'namespace': /^[^\s>\/:]+:/
                }
            },
            'attr-value': {
                pattern: /=(?:('|")[\w\W]*?(\1)|[^\s>]+)/i,
                inside: {
                    'punctuation': /[=>"']/
                }
            },
            'punctuation': /\/?>/,
            'attr-name': {
                pattern: /[^\s>\/]+/,
                inside: {
                    'namespace': /^[^\s>\/:]+:/
                }
            }

        }
    },
    'entity': /&#?[\da-z]{1,8};/i
};

// Plugin to make entity title show the real entity, idea by Roman Komarov
Prism.hooks.add('wrap', function(env) {

    if (env.type === 'entity') {
        env.attributes['title'] = env.content.replace(/&amp;/, '&');
    }
});

Prism.languages.xml = Prism.languages.markup;
Prism.languages.html = Prism.languages.markup;
Prism.languages.mathml = Prism.languages.markup;
Prism.languages.svg = Prism.languages.markup;

Prism.languages.css = {
    'comment': /\/\*[\w\W]*?\*\//,
    'atrule': {
        pattern: /@[\w-]+?.*?(;|(?=\s*\{))/i,
        inside: {
            'rule': /@[\w-]+/
            // See rest below
        }
    },
    'url': /url\((?:(["'])(\\(?:\r\n|[\w\W])|(?!\1)[^\\\r\n])*\1|.*?)\)/i,
    'selector': /[^\{\}\s][^\{\};]*?(?=\s*\{)/,
    'string': /("|')(\\(?:\r\n|[\w\W])|(?!\1)[^\\\r\n])*\1/,
    'property': /(\b|\B)[\w-]+(?=\s*:)/i,
    'important': /\B!important\b/i,
    'function': /[-a-z0-9]+(?=\()/i,
    'punctuation': /[(){};:]/
};

Prism.languages.css['atrule'].inside.rest = Prism.util.clone(Prism.languages.css);

if (Prism.languages.markup) {
    Prism.languages.insertBefore('markup', 'tag', {
        'style': {
            pattern: /(<style[\w\W]*?>)[\w\W]*?(?=<\/style>)/i,
            lookbehind: true,
            inside: Prism.languages.css,
            alias: 'language-css'
        }
    });

    Prism.languages.insertBefore('inside', 'attr-value', {
        'style-attr': {
            pattern: /\s*style=("|').*?\1/i,
            inside: {
                'attr-name': {
                    pattern: /^\s*style/i,
                    inside: Prism.languages.markup.tag.inside
                },
                'punctuation': /^\s*=\s*['"]|['"]\s*$/,
                'attr-value': {
                    pattern: /.+/i,
                    inside: Prism.languages.css
                }
            },
            alias: 'language-css'
        }
    }, Prism.languages.markup.tag);
};
Prism.languages.clike = {
    'comment': [
        {
            pattern: /(^|[^\\])\/\*[\w\W]*?\*\//,
            lookbehind: true
        },
        {
            pattern: /(^|[^\\:])\/\/.*/,
            lookbehind: true
        }
    ],
    'string': /(["'])(\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
    'class-name': {
        pattern: /((?:\b(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[a-z0-9_\.\\]+/i,
        lookbehind: true,
        inside: {
            punctuation: /(\.|\\)/
        }
    },
    'keyword': /\b(if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,
    'boolean': /\b(true|false)\b/,
    'function': /[a-z0-9_]+(?=\()/i,
    'number': /\b-?(?:0x[\da-f]+|\d*\.?\d+(?:e[+-]?\d+)?)\b/i,
    'operator': /--?|\+\+?|!=?=?|<=?|>=?|==?=?|&&?|\|\|?|\?|\*|\/|~|\^|%/,
    'punctuation': /[{}[\];(),.:]/
};

Prism.languages.javascript = Prism.languages.extend('clike', {
    'keyword': /\b(as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|var|void|while|with|yield)\b/,
    'number': /\b-?(0x[\dA-Fa-f]+|0b[01]+|0o[0-7]+|\d*\.?\d+([Ee][+-]?\d+)?|NaN|Infinity)\b/,
    // Allow for all non-ASCII characters (See http://stackoverflow.com/a/2008444)
    'function': /[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*(?=\()/i
});

Prism.languages.insertBefore('javascript', 'keyword', {
    'regex': {
        pattern: /(^|[^/])\/(?!\/)(\[.+?]|\\.|[^/\\\r\n])+\/[gimyu]{0,5}(?=\s*($|[\r\n,.;})]))/,
        lookbehind: true
    }
});

Prism.languages.insertBefore('javascript', 'class-name', {
    'template-string': {
        pattern: /`(?:\\`|\\?[^`])*`/,
        inside: {
            'interpolation': {
                pattern: /\$\{[^}]+\}/,
                inside: {
                    'interpolation-punctuation': {
                        pattern: /^\$\{|\}$/,
                        alias: 'punctuation'
                    },
                    rest: Prism.languages.javascript
                }
            },
            'string': /[\s\S]+/
        }
    }
});

if (Prism.languages.markup) {
    Prism.languages.insertBefore('markup', 'tag', {
        'script': {
            pattern: /(<script[\w\W]*?>)[\w\W]*?(?=<\/script>)/i,
            lookbehind: true,
            inside: Prism.languages.javascript,
            alias: 'language-javascript'
        }
    });
}

Prism.languages.js = Prism.languages.javascript;
Prism.languages.dart = Prism.languages.extend('clike', {
    'string': [
        /r?("""|''')[\s\S]*?\1/,
        /r?("|')(\\?.)*?\1/
    ],
    'keyword': [
        /\b(?:async|sync|yield)\*/,
        /\b(?:abstract|assert|async|await|break|case|catch|class|const|continue|default|deferred|do|dynamic|else|enum|export|external|extends|factory|final|finally|for|get|if|implements|import|in|library|new|null|operator|part|rethrow|return|set|static|super|switch|this|throw|try|typedef|var|void|while|with|yield)\b/
    ],
    'operator': /\bis!|\b(?:as|is)\b|\+\+|--|&&|\|\||<<=?|>>=?|~(?:\/=?)?|[+\-*\/%&^|=!<>]=?|\?/
});

Prism.languages.insertBefore('dart','function',{
    'metadata': {
        pattern: /@\w+/,
        alias: 'symbol'
    }
});
Prism.languages.git = {
    /*
     * A simple one line comment like in a git status command
     * For instance:
     * $ git status
     * # On branch infinite-scroll
     * # Your branch and 'origin/sharedBranches/frontendTeam/infinite-scroll' have diverged,
     * # and have 1 and 2 different commits each, respectively.
     * nothing to commit (working directory clean)
     */
    'comment': /^#.*/m,

    /*
     * Regexp to match the changed lines in a git diff output. Check the example below.
     */
    'deleted': /^[-–].*/m,
    'inserted': /^\+.*/m,

    /*
     * a string (double and simple quote)
     */
    'string': /("|')(\\?.)*?\1/m,

    /*
     * a git command. It starts with a random prompt finishing by a $, then "git" then some other parameters
     * For instance:
     * $ git add file.txt
     */
    'command': {
        pattern: /^.*\$ git .*$/m,
        inside: {
            /*
             * A git command can contain a parameter starting by a single or a double dash followed by a string
             * For instance:
             * $ git diff --cached
             * $ git log -p
             */
            'parameter': /\s(--|-)\w+/m
        }
    },

    /*
     * Coordinates displayed in a git diff command
     * For instance:
     * $ git diff
     * diff --git file.txt file.txt
     * index 6214953..1d54a52 100644
     * --- file.txt
     * +++ file.txt
     * @@ -1 +1,2 @@
     * -Here's my tetx file
     * +Here's my text file
     * +And this is the second line
     */
    'coord': /^@@.*@@$/m,

    /*
     * Match a "commit [SHA1]" line in a git log output.
     * For instance:
     * $ git log
     * commit a11a14ef7e26f2ca62d4b35eac455ce636d0dc09
     * Author: lgiraudel
     * Date:   Mon Feb 17 11:18:34 2014 +0100
     *
     *     Add of a new line
     */
    'commit_sha1': /^commit \w{40}$/m
};

Prism.languages.markdown = Prism.languages.extend('markup', {});
Prism.languages.insertBefore('markdown', 'prolog', {
    'blockquote': {
        // > ...
        pattern: /^>(?:[\t ]*>)*/m,
        alias: 'punctuation'
    },
    'code': [
        {
            // Prefixed by 4 spaces or 1 tab
            pattern: /^(?: {4}|\t).+/m,
            alias: 'keyword'
        },
        {
            // `code`
            // ``code``
            pattern: /``.+?``|`[^`\n]+`/,
            alias: 'keyword'
        }
    ],
    'title': [
        {
            // title 1
            // =======

            // title 2
            // -------
            pattern: /\w+.*(?:\r?\n|\r)(?:==+|--+)/,
            alias: 'important',
            inside: {
                punctuation: /==+$|--+$/
            }
        },
        {
            // # title 1
            // ###### title 6
            pattern: /(^\s*)#+.+/m,
            lookbehind: true,
            alias: 'important',
            inside: {
                punctuation: /^#+|#+$/
            }
        }
    ],
    'hr': {
        // ***
        // ---
        // * * *
        // -----------
        pattern: /(^\s*)([*-])([\t ]*\2){2,}(?=\s*$)/m,
        lookbehind: true,
        alias: 'punctuation'
    },
    'list': {
        // * item
        // + item
        // - item
        // 1. item
        pattern: /(^\s*)(?:[*+-]|\d+\.)(?=[\t ].)/m,
        lookbehind: true,
        alias: 'punctuation'
    },
    'url-reference': {
        // [id]: http://example.com "Optional title"
        // [id]: http://example.com 'Optional title'
        // [id]: http://example.com (Optional title)
        // [id]: <http://example.com> "Optional title"
        pattern: /!?\[[^\]]+\]:[\t ]+(?:\S+|<(?:\\.|[^>\\])+>)(?:[\t ]+(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\)))?/,
        inside: {
            'variable': {
                pattern: /^(!?\[)[^\]]+/,
                lookbehind: true
            },
            'string': /(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\))$/,
            'punctuation': /^[\[\]!:]|[<>]/
        },
        alias: 'url'
    },
    'bold': {
        // **strong**
        // __strong__

        // Allow only one line break
        pattern: /(^|[^\\])(\*\*|__)(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,
        lookbehind: true,
        inside: {
            'punctuation': /^\*\*|^__|\*\*$|__$/
        }
    },
    'italic': {
        // *em*
        // _em_

        // Allow only one line break
        pattern: /(^|[^\\])([*_])(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,
        lookbehind: true,
        inside: {
            'punctuation': /^[*_]|[*_]$/
        }
    },
    'url': {
        // [example](http://example.com "Optional title")
        // [example] [id]
        pattern: /!?\[[^\]]+\](?:\([^\s)]+(?:[\t ]+"(?:\\.|[^"\\])*")?\)| ?\[[^\]\n]*\])/,
        inside: {
            'variable': {
                pattern: /(!?\[)[^\]]+(?=\]$)/,
                lookbehind: true
            },
            'string': {
                pattern: /"(?:\\.|[^"\\])*"(?=\)$)/
            }
        }
    }
});

Prism.languages.markdown['bold'].inside['url'] = Prism.util.clone(Prism.languages.markdown['url']);
Prism.languages.markdown['italic'].inside['url'] = Prism.util.clone(Prism.languages.markdown['url']);
Prism.languages.markdown['bold'].inside['italic'] = Prism.util.clone(Prism.languages.markdown['italic']);
Prism.languages.markdown['italic'].inside['bold'] = Prism.util.clone(Prism.languages.markdown['bold']);
/**
 * Original by Aaron Harun: http://aahacreative.com/2012/07/31/php-syntax-highlighting-prism/
 * Modified by Miles Johnson: http://milesj.me
 *
 * Supports the following:
 * 		- Extends clike syntax
 * 		- Support for PHP 5.3+ (namespaces, traits, generators, etc)
 * 		- Smarter constant and function matching
 *
 * Adds the following new token classes:
 * 		constant, delimiter, variable, function, package
 */

Prism.languages.php = Prism.languages.extend('clike', {
    'keyword': /\b(and|or|xor|array|as|break|case|cfunction|class|const|continue|declare|default|die|do|else|elseif|enddeclare|endfor|endforeach|endif|endswitch|endwhile|extends|for|foreach|function|include|include_once|global|if|new|return|static|switch|use|require|require_once|var|while|abstract|interface|public|implements|private|protected|parent|throw|null|echo|print|trait|namespace|final|yield|goto|instanceof|finally|try|catch)\b/i,
    'constant': /\b[A-Z0-9_]{2,}\b/,
    'comment': {
        pattern: /(^|[^\\])(?:\/\*[\w\W]*?\*\/|\/\/.*)/,
        lookbehind: true
    }
});

// Shell-like comments are matched after strings, because they are less
// common than strings containing hashes...
Prism.languages.insertBefore('php', 'class-name', {
    'shell-comment': {
        pattern: /(^|[^\\])#.*/,
        lookbehind: true,
        alias: 'comment'
    }
});

Prism.languages.insertBefore('php', 'keyword', {
    'delimiter': /\?>|<\?(?:php)?/i,
    'variable': /\$\w+\b/i,
    'package': {
        pattern: /(\\|namespace\s+|use\s+)[\w\\]+/,
        lookbehind: true,
        inside: {
            punctuation: /\\/
        }
    }
});

// Must be defined after the function pattern
Prism.languages.insertBefore('php', 'operator', {
    'property': {
        pattern: /(->)[\w]+/,
        lookbehind: true
    }
});

// Add HTML support of the markup language exists
if (Prism.languages.markup) {

    // Tokenize all inline PHP blocks that are wrapped in <?php ?>
    // This allows for easy PHP + markup highlighting
    Prism.hooks.add('before-highlight', function(env) {
        if (env.language !== 'php') {
            return;
        }

        env.tokenStack = [];

        env.backupCode = env.code;
        env.code = env.code.replace(/(?:<\?php|<\?)[\w\W]*?(?:\?>)/ig, function(match) {
            env.tokenStack.push(match);

            return '{{{PHP' + env.tokenStack.length + '}}}';
        });
    });

    // Restore env.code for other plugins (e.g. line-numbers)
    Prism.hooks.add('before-insert', function(env) {
        if (env.language === 'php') {
            env.code = env.backupCode;
            delete env.backupCode;
        }
    });

    // Re-insert the tokens after highlighting
    Prism.hooks.add('after-highlight', function(env) {
        if (env.language !== 'php') {
            return;
        }

        for (var i = 0, t; t = env.tokenStack[i]; i++) {
            // The replace prevents $$, $&, $`, $', $n, $nn from being interpreted as special patterns
            env.highlightedCode = env.highlightedCode.replace('{{{PHP' + (i + 1) + '}}}', Prism.highlight(t, env.grammar, 'php').replace(/\$/g, '$$$$'));
        }

        env.element.innerHTML = env.highlightedCode;
    });

    // Wrap tokens in classes that are missing them
    Prism.hooks.add('wrap', function(env) {
        if (env.language === 'php' && env.type === 'markup') {
            env.content = env.content.replace(/(\{\{\{PHP[0-9]+\}\}\})/g, "<span class=\"token php\">$1</span>");
        }
    });

    // Add the rules before all others
    Prism.languages.insertBefore('php', 'comment', {
        'markup': {
            pattern: /<[^?]\/?(.*?)>/,
            inside: Prism.languages.markup
        },
        'php': /\{\{\{PHP[0-9]+\}\}\}/
    });
}
;
Prism.languages.insertBefore('php', 'variable', {
    'this': /\$this\b/,
    'global': /\$(?:_(?:SERVER|GET|POST|FILES|REQUEST|SESSION|ENV|COOKIE)|GLOBALS|HTTP_RAW_POST_DATA|argc|argv|php_errormsg|http_response_header)/,
    'scope': {
        pattern: /\b[\w\\]+::/,
        inside: {
            keyword: /(static|self|parent)/,
            punctuation: /(::|\\)/
        }
    }
});
(function(Prism) {

    var javascript = Prism.util.clone(Prism.languages.javascript);

    Prism.languages.jsx = Prism.languages.extend('markup', javascript);
    Prism.languages.jsx.tag.pattern= /<\/?[\w:-]+\s*(?:\s+[\w:-]+(?:=(?:("|')(\\?[\w\W])*?\1|[^\s'">=]+|(\{[\w\W]*?\})))?\s*)*\/?>/i;

    Prism.languages.jsx.tag.inside['attr-value'].pattern = /=[^\{](?:('|")[\w\W]*?(\1)|[^\s>]+)/i;

    Prism.languages.insertBefore('inside', 'attr-value',{
        'script': {
            // Allow for one level of nesting
            pattern: /=(\{(?:\{[^}]*\}|[^}])+\})/i,
            inside: {
                'function' : Prism.languages.javascript.function,
                'punctuation': /[={}[\];(),.:]/,
                'keyword':  Prism.languages.javascript.keyword,
                'boolean': Prism.languages.javascript.boolean
            },
            'alias': 'language-javascript'
        }
    }, Prism.languages.jsx.tag);

}(Prism));

(function(Prism) {
    Prism.languages.sass = Prism.languages.extend('css', {
        // Sass comments don't need to be closed, only indented
        'comment': {
            pattern: /^([ \t]*)\/[\/*].*(?:(?:\r?\n|\r)\1[ \t]+.+)*/m,
            lookbehind: true
        }
    });

    Prism.languages.insertBefore('sass', 'atrule', {
        // We want to consume the whole line
        'atrule-line': {
            // Includes support for = and + shortcuts
            pattern: /^(?:[ \t]*)[@+=].+/m,
            inside: {
                'atrule': /(?:@[\w-]+|[+=])/m
            }
        }
    });
    delete Prism.languages.sass.atrule;


    var variable = /((\$[-_\w]+)|(#\{\$[-_\w]+\}))/i;
    var operator = [
        /[+*\/%]|[=!]=|<=?|>=?|\b(?:and|or|not)\b/,
        {
            pattern: /(\s+)-(?=\s)/,
            lookbehind: true
        }
    ];

    Prism.languages.insertBefore('sass', 'property', {
        // We want to consume the whole line
        'variable-line': {
            pattern: /^[ \t]*\$.+/m,
            inside: {
                'punctuation': /:/,
                'variable': variable,
                'operator': operator
            }
        },
        // We want to consume the whole line
        'property-line': {
            pattern: /^[ \t]*(?:[^:\s]+ *:.*|:[^:\s]+.*)/m,
            inside: {
                'property': [
                    /[^:\s]+(?=\s*:)/,
                    {
                        pattern: /(:)[^:\s]+/,
                        lookbehind: true
                    }
                ],
                'punctuation': /:/,
                'variable': variable,
                'operator': operator,
                'important': Prism.languages.sass.important
            }
        }
    });
    delete Prism.languages.sass.property;
    delete Prism.languages.sass.important;

    // Now that whole lines for other patterns are consumed,
    // what's left should be selectors
    delete Prism.languages.sass.selector;
    Prism.languages.insertBefore('sass', 'punctuation', {
        'selector': {
            pattern: /([ \t]*)\S(?:,?[^,\r\n]+)*(?:,(?:\r?\n|\r)\1[ \t]+\S(?:,?[^,\r\n]+)*)*/,
            lookbehind: true
        }
    });

}(Prism));
Prism.languages.scss = Prism.languages.extend('css', {
    'comment': {
        pattern: /(^|[^\\])(?:\/\*[\w\W]*?\*\/|\/\/.*)/,
        lookbehind: true
    },
    'atrule': {
        pattern: /@[\w-]+(?:\([^()]+\)|[^(])*?(?=\s+[{;])/,
        inside: {
            'rule': /@[\w-]+/
            // See rest below
        }
    },
    // url, compassified
    'url': /(?:[-a-z]+-)*url(?=\()/i,
    // CSS selector regex is not appropriate for Sass
    // since there can be lot more things (var, @ directive, nesting..)
    // a selector must start at the end of a property or after a brace (end of other rules or nesting)
    // it can contain some characters that aren't used for defining rules or end of selector, & (parent selector), or interpolated variable
    // the end of a selector is found when there is no rules in it ( {} or {\s}) or if there is a property (because an interpolated var
    // can "pass" as a selector- e.g: proper#{$erty})
    // this one was hard to do, so please be careful if you edit this one :)
    'selector': {
        // Initial look-ahead is used to prevent matching of blank selectors
        pattern: /(?=\S)[^@;\{\}\(\)]?([^@;\{\}\(\)]|&|#\{\$[-_\w]+\})+(?=\s*\{(\}|\s|[^\}]+(:|\{)[^\}]+))/m,
        inside: {
            'placeholder': /%[-_\w]+/
        }
    }
});

Prism.languages.insertBefore('scss', 'atrule', {
    'keyword': [
        /@(?:if|else(?: if)?|for|each|while|import|extend|debug|warn|mixin|include|function|return|content)/i,
        {
            pattern: /( +)(?:from|through)(?= )/,
            lookbehind: true
        }
    ]
});

Prism.languages.insertBefore('scss', 'property', {
    // var and interpolated vars
    'variable': /\$[-_\w]+|#\{\$[-_\w]+\}/
});

Prism.languages.insertBefore('scss', 'function', {
    'placeholder': {
        pattern: /%[-_\w]+/,
        alias: 'selector'
    },
    'statement': /\B!(?:default|optional)\b/i,
    'boolean': /\b(?:true|false)\b/,
    'null': /\bnull\b/,
    'operator': {
        pattern: /(\s)(?:[-+*\/%]|[=!]=|<=?|>=?|and|or|not)(?=\s)/,
        lookbehind: true
    }
});

Prism.languages.scss['atrule'].inside.rest = Prism.util.clone(Prism.languages.scss);
Prism.languages.sql= {
    'comment': {
        pattern: /(^|[^\\])(?:\/\*[\w\W]*?\*\/|(?:--|\/\/|#).*)/,
        lookbehind: true
    },
    'string' : {
        pattern: /(^|[^@\\])("|')(?:\\?[\s\S])*?\2/,
        lookbehind: true
    },
    'variable': /@[\w.$]+|@("|'|`)(?:\\?[\s\S])+?\1/,
    'function': /\b(?:COUNT|SUM|AVG|MIN|MAX|FIRST|LAST|UCASE|LCASE|MID|LEN|ROUND|NOW|FORMAT)(?=\s*\()/i, // Should we highlight user defined functions too?
    'keyword': /\b(?:ACTION|ADD|AFTER|ALGORITHM|ALL|ALTER|ANALYZE|ANY|APPLY|AS|ASC|AUTHORIZATION|BACKUP|BDB|BEGIN|BERKELEYDB|BIGINT|BINARY|BIT|BLOB|BOOL|BOOLEAN|BREAK|BROWSE|BTREE|BULK|BY|CALL|CASCADED?|CASE|CHAIN|CHAR VARYING|CHARACTER (?:SET|VARYING)|CHARSET|CHECK|CHECKPOINT|CLOSE|CLUSTERED|COALESCE|COLLATE|COLUMN|COLUMNS|COMMENT|COMMIT|COMMITTED|COMPUTE|CONNECT|CONSISTENT|CONSTRAINT|CONTAINS|CONTAINSTABLE|CONTINUE|CONVERT|CREATE|CROSS|CURRENT(?:_DATE|_TIME|_TIMESTAMP|_USER)?|CURSOR|DATA(?:BASES?)?|DATETIME|DBCC|DEALLOCATE|DEC|DECIMAL|DECLARE|DEFAULT|DEFINER|DELAYED|DELETE|DENY|DESC|DESCRIBE|DETERMINISTIC|DISABLE|DISCARD|DISK|DISTINCT|DISTINCTROW|DISTRIBUTED|DO|DOUBLE(?: PRECISION)?|DROP|DUMMY|DUMP(?:FILE)?|DUPLICATE KEY|ELSE|ENABLE|ENCLOSED BY|END|ENGINE|ENUM|ERRLVL|ERRORS|ESCAPE(?:D BY)?|EXCEPT|EXEC(?:UTE)?|EXISTS|EXIT|EXPLAIN|EXTENDED|FETCH|FIELDS|FILE|FILLFACTOR|FIRST|FIXED|FLOAT|FOLLOWING|FOR(?: EACH ROW)?|FORCE|FOREIGN|FREETEXT(?:TABLE)?|FROM|FULL|FUNCTION|GEOMETRY(?:COLLECTION)?|GLOBAL|GOTO|GRANT|GROUP|HANDLER|HASH|HAVING|HOLDLOCK|IDENTITY(?:_INSERT|COL)?|IF|IGNORE|IMPORT|INDEX|INFILE|INNER|INNODB|INOUT|INSERT|INT|INTEGER|INTERSECT|INTO|INVOKER|ISOLATION LEVEL|JOIN|KEYS?|KILL|LANGUAGE SQL|LAST|LEFT|LIMIT|LINENO|LINES|LINESTRING|LOAD|LOCAL|LOCK|LONG(?:BLOB|TEXT)|MATCH(?:ED)?|MEDIUM(?:BLOB|INT|TEXT)|MERGE|MIDDLEINT|MODIFIES SQL DATA|MODIFY|MULTI(?:LINESTRING|POINT|POLYGON)|NATIONAL(?: CHAR VARYING| CHARACTER(?: VARYING)?| VARCHAR)?|NATURAL|NCHAR(?: VARCHAR)?|NEXT|NO(?: SQL|CHECK|CYCLE)?|NONCLUSTERED|NULLIF|NUMERIC|OFF?|OFFSETS?|ON|OPEN(?:DATASOURCE|QUERY|ROWSET)?|OPTIMIZE|OPTION(?:ALLY)?|ORDER|OUT(?:ER|FILE)?|OVER|PARTIAL|PARTITION|PERCENT|PIVOT|PLAN|POINT|POLYGON|PRECEDING|PRECISION|PREV|PRIMARY|PRINT|PRIVILEGES|PROC(?:EDURE)?|PUBLIC|PURGE|QUICK|RAISERROR|READ(?:S SQL DATA|TEXT)?|REAL|RECONFIGURE|REFERENCES|RELEASE|RENAME|REPEATABLE|REPLICATION|REQUIRE|RESTORE|RESTRICT|RETURNS?|REVOKE|RIGHT|ROLLBACK|ROUTINE|ROW(?:COUNT|GUIDCOL|S)?|RTREE|RULE|SAVE(?:POINT)?|SCHEMA|SELECT|SERIAL(?:IZABLE)?|SESSION(?:_USER)?|SET(?:USER)?|SHARE MODE|SHOW|SHUTDOWN|SIMPLE|SMALLINT|SNAPSHOT|SOME|SONAME|START(?:ING BY)?|STATISTICS|STATUS|STRIPED|SYSTEM_USER|TABLES?|TABLESPACE|TEMP(?:ORARY|TABLE)?|TERMINATED BY|TEXT(?:SIZE)?|THEN|TIMESTAMP|TINY(?:BLOB|INT|TEXT)|TOP?|TRAN(?:SACTIONS?)?|TRIGGER|TRUNCATE|TSEQUAL|TYPES?|UNBOUNDED|UNCOMMITTED|UNDEFINED|UNION|UNIQUE|UNPIVOT|UPDATE(?:TEXT)?|USAGE|USE|USER|USING|VALUES?|VAR(?:BINARY|CHAR|CHARACTER|YING)|VIEW|WAITFOR|WARNINGS|WHEN|WHERE|WHILE|WITH(?: ROLLUP|IN)?|WORK|WRITE(?:TEXT)?)\b/i,
    'boolean': /\b(?:TRUE|FALSE|NULL)\b/i,
    'number': /\b-?(?:0x)?\d*\.?[\da-f]+\b/,
    'operator': /[-+*\/=%^~]|&&?|\|?\||!=?|<(?:=>?|<|>)?|>[>=]?|\b(?:AND|BETWEEN|IN|LIKE|NOT|OR|IS|DIV|REGEXP|RLIKE|SOUNDS LIKE|XOR)\b/i,
    'punctuation': /[;[\]()`,.]/
};
// issues: nested multiline comments
Prism.languages.swift = Prism.languages.extend('clike', {
    'string': {
        pattern: /("|')(\\(?:\((?:[^()]|\([^)]+\))+\)|\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
        inside: {
            'interpolation': {
                pattern: /\\\((?:[^()]|\([^)]+\))+\)/,
                inside: {
                    delimiter: {
                        pattern: /^\\\(|\)$/,
                        alias: 'variable'
                    }
                    // See rest below
                }
            }
        }
    },
    'keyword': /\b(as|associativity|break|case|catch|class|continue|convenience|default|defer|deinit|didSet|do|dynamic(?:Type)?|else|enum|extension|fallthrough|final|for|func|get|guard|if|import|in|infix|init|inout|internal|is|lazy|left|let|mutating|new|none|nonmutating|operator|optional|override|postfix|precedence|prefix|private|Protocol|public|repeat|required|rethrows|return|right|safe|self|Self|set|static|struct|subscript|super|switch|throws?|try|Type|typealias|unowned|unsafe|var|weak|where|while|willSet|__(?:COLUMN__|FILE__|FUNCTION__|LINE__))\b/,
    'number': /\b([\d_]+(\.[\de_]+)?|0x[a-f0-9_]+(\.[a-f0-9p_]+)?|0b[01_]+|0o[0-7_]+)\b/i,
    'constant': /\b(nil|[A-Z_]{2,}|k[A-Z][A-Za-z_]+)\b/,
    'atrule': /@\b(IB(?:Outlet|Designable|Action|Inspectable)|class_protocol|exported|noreturn|NS(?:Copying|Managed)|objc|UIApplicationMain|auto_closure)\b/,
    'builtin': /\b([A-Z]\S+|abs|advance|alignof(?:Value)?|assert|contains|count(?:Elements)?|debugPrint(?:ln)?|distance|drop(?:First|Last)|dump|enumerate|equal|filter|find|first|getVaList|indices|isEmpty|join|last|lexicographicalCompare|map|max(?:Element)?|min(?:Element)?|numericCast|overlaps|partition|print(?:ln)?|reduce|reflect|reverse|sizeof(?:Value)?|sort(?:ed)?|split|startsWith|stride(?:of(?:Value)?)?|suffix|swap|toDebugString|toString|transcode|underestimateCount|unsafeBitCast|with(?:ExtendedLifetime|Unsafe(?:MutablePointers?|Pointers?)|VaList))\b/
});
Prism.languages.swift['string'].inside['interpolation'].inside.rest = Prism.util.clone(Prism.languages.swift);
Prism.languages.typescript = Prism.languages.extend('javascript', {
    'keyword': /\b(break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|false|finally|for|function|get|if|implements|import|in|instanceof|interface|let|new|null|package|private|protected|public|return|set|static|super|switch|this|throw|true|try|typeof|var|void|while|with|yield|module|declare|constructor|string|Function|any|number|boolean|Array|enum)\b/
});

Prism.languages.wiki = Prism.languages.extend('markup', {
    'block-comment': {
        pattern: /(^|[^\\])\/\*[\w\W]*?\*\//,
        lookbehind: true,
        alias: 'comment'
    },
    'heading': {
        pattern: /^(=+).+?\1/m,
        inside: {
            'punctuation': /^=+|=+$/,
            'important': /.+/
        }
    },
    'emphasis': {
        // TODO Multi-line
        pattern: /('{2,5}).+?\1/,
        inside: {
            'bold italic': {
                pattern: /(''''').+?(?=\1)/,
                lookbehind: true
            },
            'bold': {
                pattern: /(''')[^'](?:.*?[^'])?(?=\1)/,
                lookbehind: true
            },
            'italic': {
                pattern: /('')[^'](?:.*?[^'])?(?=\1)/,
                lookbehind: true
            },
            'punctuation': /^''+|''+$/
        }
    },
    'hr': {
        pattern: /^-{4,}/m,
        alias: 'punctuation'
    },
    'url': [
        /ISBN +(?:97[89][ -]?)?(?:\d[ -]?){9}[\dx]\b|(?:RFC|PMID) +\d+/i,
        /\[\[.+?\]\]|\[.+?\]/
    ],
    'variable': [
        /__[A-Z]+__/,
        // FIXME Nested structures should be handled
        // {{formatnum:{{#expr:{{{3}}}}}}}
        /\{{3}.+?\}{3}/,
        /\{\{.+?}}/
    ],
    'symbol': [
        /^#redirect/im,
        /~{3,5}/
    ],
    // Handle table attrs:
    // {|
    // ! style="text-align:left;"| Item
    // |}
    'table-tag': {
        pattern: /((?:^|[|!])[|!])[^|\r\n]+\|(?!\|)/m,
        lookbehind: true,
        inside: {
            'table-bar': {
                pattern: /\|$/,
                alias: 'punctuation'
            },
            rest: Prism.languages.markup['tag'].inside
        }
    },
    'punctuation': /^(?:\{\||\|\}|\|-|[*#:;!|])|\|\||!!/m
});

Prism.languages.insertBefore('wiki', 'tag', {
    // Prevent highlighting inside <nowiki>, <source> and <pre> tags
    'nowiki': {
        pattern: /<(nowiki|pre|source)\b[\w\W]*?>[\w\W]*?<\/\1>/i,
        inside: {
            'tag': {
                pattern: /<(?:nowiki|pre|source)\b[\w\W]*?>|<\/(?:nowiki|pre|source)>/i,
                inside: Prism.languages.markup['tag'].inside
            }
        }
    }
});

(function() {

    if (typeof self === 'undefined' || !self.Prism || !self.document || !Function.prototype.bind) {
        return;
    }

    /**
     * Returns the absolute X, Y offsets for an element
     * @param {HTMLElement} element
     * @returns {{top: number, right: number, bottom: number, left: number}}
     */
    var getOffset = function (element) {
        var left = 0, top = 0, el = element;

        if (el.parentNode) {
            do {
                left += el.offsetLeft;
                top += el.offsetTop;
            } while ((el = el.offsetParent) && el.nodeType < 9);

            el = element;

            do {
                left -= el.scrollLeft;
                top -= el.scrollTop;
            } while ((el = el.parentNode) && !/body/i.test(el.nodeName));
        }

        return {
            top: top,
            right: innerWidth - left - element.offsetWidth,
            bottom: innerHeight - top - element.offsetHeight,
            left: left
        };
    };

    var tokenRegexp = /(?:^|\s)token(?=$|\s)/;
    var activeRegexp = /(?:^|\s)active(?=$|\s)/g;
    var flippedRegexp = /(?:^|\s)flipped(?=$|\s)/g;

    /**
     * Previewer constructor
     * @param {string} type Unique previewer type
     * @param {function} updater Function that will be called on mouseover.
     * @param {string[]|string=} supportedLanguages Aliases of the languages this previewer must be enabled for. Defaults to "*", all languages.
     * @constructor
     */
    var Previewer = function (type, updater, supportedLanguages, initializer) {
        this._elt = null;
        this._type = type;
        this._clsRegexp = RegExp('(?:^|\\s)' + type + '(?=$|\\s)');
        this._token = null;
        this.updater = updater;
        this._mouseout = this.mouseout.bind(this);
        this.initializer = initializer;

        var self = this;

        if (!supportedLanguages) {
            supportedLanguages = ['*'];
        }
        if (Prism.util.type(supportedLanguages) !== 'Array') {
            supportedLanguages = [supportedLanguages];
        }
        supportedLanguages.forEach(function (lang) {
            if (typeof lang !== 'string') {
                lang = lang.lang;
            }
            if (!Previewer.byLanguages[lang]) {
                Previewer.byLanguages[lang] = [];
            }
            if (Previewer.byLanguages[lang].indexOf(self) < 0) {
                Previewer.byLanguages[lang].push(self);
            }
        });
        Previewer.byType[type] = this;
    };

    /**
     * Creates the HTML element for the previewer.
     */
    Previewer.prototype.init = function () {
        if (this._elt) {
            return;
        }
        this._elt = document.createElement('div');
        this._elt.className = 'prism-previewer prism-previewer-' + this._type;
        document.body.appendChild(this._elt);
        if(this.initializer) {
            this.initializer();
        }
    };

    /**
     * Checks the class name of each hovered element
     * @param token
     */
    Previewer.prototype.check = function (token) {
        do {
            if (tokenRegexp.test(token.className) && this._clsRegexp.test(token.className)) {
                break;
            }
        } while(token = token.parentNode);

        if (token && token !== this._token) {
            this._token = token;
            this.show();
        }
    };

    /**
     * Called on mouseout
     */
    Previewer.prototype.mouseout = function() {
        this._token.removeEventListener('mouseout', this._mouseout, false);
        this._token = null;
        this.hide();
    };

    /**
     * Shows the previewer positioned properly for the current token.
     */
    Previewer.prototype.show = function () {
        if (!this._elt) {
            this.init();
        }
        if (!this._token) {
            return;
        }

        if (this.updater.call(this._elt, this._token.textContent)) {
            this._token.addEventListener('mouseout', this._mouseout, false);

            var offset = getOffset(this._token);
            this._elt.className += ' active';

            if (offset.top - this._elt.offsetHeight > 0) {
                this._elt.className = this._elt.className.replace(flippedRegexp, '');
                this._elt.style.top = offset.top + 'px';
                this._elt.style.bottom = '';
            } else {
                this._elt.className +=  ' flipped';
                this._elt.style.bottom = offset.bottom + 'px';
                this._elt.style.top = '';
            }

            this._elt.style.left = offset.left + Math.min(200, this._token.offsetWidth / 2) + 'px';
        } else {
            this.hide();
        }
    };

    /**
     * Hides the previewer.
     */
    Previewer.prototype.hide = function () {
        this._elt.className = this._elt.className.replace(activeRegexp, '');
    };

    /**
     * Map of all registered previewers by language
     * @type {{}}
     */
    Previewer.byLanguages = {};

    /**
     * Map of all registered previewers by type
     * @type {{}}
     */
    Previewer.byType = {};

    /**
     * Initializes the mouseover event on the code block.
     * @param {HTMLElement} elt The code block (env.element)
     * @param {string} lang The language (env.language)
     */
    Previewer.initEvents = function (elt, lang) {
        var previewers = [];
        if (Previewer.byLanguages[lang]) {
            previewers = previewers.concat(Previewer.byLanguages[lang]);
        }
        if (Previewer.byLanguages['*']) {
            previewers = previewers.concat(Previewer.byLanguages['*']);
        }
        elt.addEventListener('mouseover', function (e) {
            var target = e.target;
            previewers.forEach(function (previewer) {
                previewer.check(target);
            });
        }, false);
    };
    Prism.plugins.Previewer = Previewer;

    // Initialize the previewers only when needed
    Prism.hooks.add('after-highlight', function (env) {
        if(Previewer.byLanguages['*'] || Previewer.byLanguages[env.language]) {
            Previewer.initEvents(env.element, env.language);
        }
    });

}());
(function() {

    if (
        typeof self !== 'undefined' && !self.Prism ||
        typeof global !== 'undefined' && !global.Prism
    ) {
        return;
    }

    var languages = {
        'css': true,
        'less': true,
        'markup': {
            lang: 'markup',
            before: 'punctuation',
            inside: 'inside',
            root: Prism.languages.markup && Prism.languages.markup['tag'].inside['attr-value']
        },
        'sass': [
            {
                lang: 'sass',
                before: 'punctuation',
                inside: 'inside',
                root: Prism.languages.sass && Prism.languages.sass['variable-line']
            },
            {
                lang: 'sass',
                inside: 'inside',
                root: Prism.languages.sass && Prism.languages.sass['property-line']
            }
        ],
        'scss': true,
        'stylus': [
            {
                lang: 'stylus',
                before: 'hexcode',
                inside: 'rest',
                root: Prism.languages.stylus && Prism.languages.stylus['property-declaration'].inside
            },
            {
                lang: 'stylus',
                before: 'hexcode',
                inside: 'rest',
                root: Prism.languages.stylus && Prism.languages.stylus['variable-declaration'].inside
            }
        ]
    };

    Prism.hooks.add('before-highlight', function (env) {
        if (env.language && languages[env.language] && !languages[env.language].initialized) {
            var lang = languages[env.language];
            if (Prism.util.type(lang) !== 'Array') {
                lang = [lang];
            }
            lang.forEach(function(lang) {
                var before, inside, root, skip;
                if (lang === true) {
                    before = 'important';
                    inside = env.language;
                    lang = env.language;
                } else {
                    before = lang.before || 'important';
                    inside = lang.inside || lang.lang;
                    root = lang.root || Prism.languages;
                    skip = lang.skip;
                    lang = env.language;
                }

                if (!skip && Prism.languages[lang]) {
                    Prism.languages.insertBefore(inside, before, {
                        'color': /\B#(?:[0-9a-f]{3}){1,2}\b|\b(?:rgb|hsl)\(\s*\d{1,3}\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*\)\B|\b(?:rgb|hsl)a\(\s*\d{1,3}\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*,\s*(?:0|0?\.\d+|1)\s*\)\B|\b(?:AliceBlue|AntiqueWhite|Aqua|Aquamarine|Azure|Beige|Bisque|Black|BlanchedAlmond|Blue|BlueViolet|Brown|BurlyWood|CadetBlue|Chartreuse|Chocolate|Coral|CornflowerBlue|Cornsilk|Crimson|Cyan|DarkBlue|DarkCyan|DarkGoldenRod|DarkGray|DarkGreen|DarkKhaki|DarkMagenta|DarkOliveGreen|DarkOrange|DarkOrchid|DarkRed|DarkSalmon|DarkSeaGreen|DarkSlateBlue|DarkSlateGray|DarkTurquoise|DarkViolet|DeepPink|DeepSkyBlue|DimGray|DodgerBlue|FireBrick|FloralWhite|ForestGreen|Fuchsia|Gainsboro|GhostWhite|Gold|GoldenRod|Gray|Green|GreenYellow|HoneyDew|HotPink|IndianRed|Indigo|Ivory|Khaki|Lavender|LavenderBlush|LawnGreen|LemonChiffon|LightBlue|LightCoral|LightCyan|LightGoldenRodYellow|LightGray|LightGreen|LightPink|LightSalmon|LightSeaGreen|LightSkyBlue|LightSlateGray|LightSteelBlue|LightYellow|Lime|LimeGreen|Linen|Magenta|Maroon|MediumAquaMarine|MediumBlue|MediumOrchid|MediumPurple|MediumSeaGreen|MediumSlateBlue|MediumSpringGreen|MediumTurquoise|MediumVioletRed|MidnightBlue|MintCream|MistyRose|Moccasin|NavajoWhite|Navy|OldLace|Olive|OliveDrab|Orange|OrangeRed|Orchid|PaleGoldenRod|PaleGreen|PaleTurquoise|PaleVioletRed|PapayaWhip|PeachPuff|Peru|Pink|Plum|PowderBlue|Purple|Red|RosyBrown|RoyalBlue|SaddleBrown|Salmon|SandyBrown|SeaGreen|SeaShell|Sienna|Silver|SkyBlue|SlateBlue|SlateGray|Snow|SpringGreen|SteelBlue|Tan|Teal|Thistle|Tomato|Turquoise|Violet|Wheat|White|WhiteSmoke|Yellow|YellowGreen)\b/i
                    }, root);
                    env.grammar = Prism.languages[lang];

                    languages[env.language] = {initialized: true};
                }
            });
        }
    });

    if (Prism.plugins.Previewer) {
        new Prism.plugins.Previewer('color', function(value) {
            this.style.backgroundColor = '';
            this.style.backgroundColor = value;
            return !!this.style.backgroundColor;
        });
    }

}());
(function() {

    if (
        typeof self !== 'undefined' && !self.Prism ||
        typeof global !== 'undefined' && !global.Prism
    ) {
        return;
    }

    var languages = {
        'css': true,
        'less': true,
        'sass': [
            {
                lang: 'sass',
                inside: 'inside',
                before: 'punctuation',
                root: Prism.languages.sass && Prism.languages.sass['variable-line']
            },
            {
                lang: 'sass',
                inside: 'inside',
                root: Prism.languages.sass && Prism.languages.sass['property-line']
            }
        ],
        'scss': true,
        'stylus': [
            {
                lang: 'stylus',
                before: 'hexcode',
                inside: 'rest',
                root: Prism.languages.stylus && Prism.languages.stylus['property-declaration'].inside
            },
            {
                lang: 'stylus',
                before: 'hexcode',
                inside: 'rest',
                root: Prism.languages.stylus && Prism.languages.stylus['variable-declaration'].inside
            }
        ]
    };

    Prism.hooks.add('before-highlight', function (env) {
        if (env.language && languages[env.language] && !languages[env.language].initialized) {
            var lang = languages[env.language];
            if (Prism.util.type(lang) !== 'Array') {
                lang = [lang];
            }
            lang.forEach(function(lang) {
                var before, inside, root, skip;
                if (lang === true) {
                    before = 'important';
                    inside = env.language;
                    lang = env.language;
                } else {
                    before = lang.before || 'important';
                    inside = lang.inside || lang.lang;
                    root = lang.root || Prism.languages;
                    skip = lang.skip;
                    lang = env.language;
                }

                if (!skip && Prism.languages[lang]) {
                    Prism.languages.insertBefore(inside, before, {
                        'easing': /\bcubic-bezier\((?:-?\d*\.?\d+,\s*){3}-?\d*\.?\d+\)\B|\b(?:linear|ease(?:-in)?(?:-out)?)(?=\s|[;}]|$)/i
                    }, root);
                    env.grammar = Prism.languages[lang];

                    languages[env.language] = {initialized: true};
                }
            });
        }
    });

    if (Prism.plugins.Previewer) {
        new Prism.plugins.Previewer('easing', function (value) {

            value = {
                    'linear': '0,0,1,1',
                    'ease': '.25,.1,.25,1',
                    'ease-in': '.42,0,1,1',
                    'ease-out': '0,0,.58,1',
                    'ease-in-out':'.42,0,.58,1'
                }[value] || value;

            var p = value.match(/-?\d*\.?\d+/g);

            if(p.length === 4) {
                p = p.map(function(p, i) { return (i % 2? 1 - p : p) * 100; });

                this.querySelector('path').setAttribute('d', 'M0,100 C' + p[0] + ',' + p[1] + ', ' + p[2] + ',' + p[3] + ', 100,0');

                var lines = this.querySelectorAll('line');
                lines[0].setAttribute('x2', p[0]);
                lines[0].setAttribute('y2', p[1]);
                lines[1].setAttribute('x2', p[2]);
                lines[1].setAttribute('y2', p[3]);

                return true;
            }

            return false;
        }, '*', function () {
            this._elt.innerHTML = '<svg viewBox="-20 -20 140 140" width="100" height="100">' +
                '<defs>' +
                '<marker id="prism-previewer-easing-marker" viewBox="0 0 4 4" refX="2" refY="2" markerUnits="strokeWidth">' +
                '<circle cx="2" cy="2" r="1.5" />' +
                '</marker>' +
                '</defs>' +
                '<path d="M0,100 C20,50, 40,30, 100,0" />' +
                '<line x1="0" y1="100" x2="20" y2="50" marker-start="url(' + location.href + '#prism-previewer-easing-marker)" marker-end="url(' + location.href + '#prism-previewer-easing-marker)" />' +
                '<line x1="100" y1="0" x2="40" y2="30" marker-start="url(' + location.href + '#prism-previewer-easing-marker)" marker-end="url(' + location.href + '#prism-previewer-easing-marker)" />' +
                '</svg>';
        });
    }

}());