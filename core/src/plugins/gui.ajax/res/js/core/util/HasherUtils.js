'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var HasherUtils = (function () {

    /*
     * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
     * Digest Algorithm, as defined in RFC 1321.
     * Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
     * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
     * Distributed under the BSD License
     * See http://pajhome.org.uk/crypt/md5 for more info.
     */

    function HasherUtils() {
        _classCallCheck(this, HasherUtils);
    }

    _createClass(HasherUtils, null, [{
        key: 'hex_md5',

        /*
         * These are the functions you'll usually want to call
         * They take string arguments and return either hex or base-64 encoded strings
         */
        value: function hex_md5(s) {
            return HasherUtils.binl2hex(HasherUtils.core_md5(HasherUtils.str2binl(s), s.length * HasherUtils.chrsz));
        }
    }, {
        key: 'b64_md5',
        value: function b64_md5(s) {
            return HasherUtils.binl2b64(HasherUtils.core_md5(HasherUtils.str2binl(s), s.length * HasherUtils.chrsz));
        }
    }, {
        key: 'str_md5',
        value: function str_md5(s) {
            return HasherUtils.binl2str(HasherUtils.core_md5(HasherUtils.str2binl(s), s.length * HasherUtils.chrsz));
        }
    }, {
        key: 'hex_hmac_md5',
        value: function hex_hmac_md5(key, data) {
            return HasherUtils.binl2hex(HasherUtils.core_hmac_md5(key, data));
        }
    }, {
        key: 'b64_hmac_md5',
        value: function b64_hmac_md5(key, data) {
            return HasherUtils.binl2b64(HasherUtils.core_hmac_md5(key, data));
        }
    }, {
        key: 'str_hmac_md5',
        value: function str_hmac_md5(key, data) {
            return HasherUtils.binl2str(HasherUtils.core_hmac_md5(key, data));
        }
    }, {
        key: 'base64_encode',
        value: function base64_encode(data) {
            // http://kevin.vanzonneveld.net
            // +   original by: Tyler Akins (http://rumkin.com)
            // +   improved by: Bayron Guevara
            // +   improved by: Thunder.m
            // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // +   bugfixed by: Pellentesque Malesuada
            // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // -    depends on: utf8_encode
            // *     example 1: base64_encode('Kevin van Zonneveld');
            // *     returns 1: 'S2V2aW4gdmFuIFpvbm5ldmVsZA=='

            // mozilla has this native
            // - but breaks in 2.0.0.12!
            //if (typeof window['atob'] == 'function') {
            //    return atob(data);
            //}

            var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
            var o1,
                o2,
                o3,
                h1,
                h2,
                h3,
                h4,
                bits,
                i = 0,
                ac = 0,
                enc,
                tmp_arr = [];

            if (!data) {
                return data;
            }

            data = HasherUtils.utf8_encode(data + '');

            do {
                // pack three octets into four hexets
                o1 = data.charCodeAt(i++);
                o2 = data.charCodeAt(i++);
                o3 = data.charCodeAt(i++);

                bits = o1 << 16 | o2 << 8 | o3;

                h1 = bits >> 18 & 63;
                h2 = bits >> 12 & 63;
                h3 = bits >> 6 & 63;
                h4 = bits & 63;

                // use hexets to index into b64, and append result to encoded string
                tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
            } while (i < data.length);

            enc = tmp_arr.join('');

            switch (data.length % 3) {
                case 1:
                    enc = enc.slice(0, -2) + '==';
                    break;
                case 2:
                    enc = enc.slice(0, -1) + '=';
                    break;
            }

            return enc;
        }
    }, {
        key: 'utf8_encode',
        value: function utf8_encode(string) {
            // http://kevin.vanzonneveld.net
            // +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
            // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // +   improved by: sowberry
            // +    tweaked by: Jack
            // +   bugfixed by: Onno Marsman
            // +   improved by: Yves Sucaet
            // +   bugfixed by: Onno Marsman
            // *     example 1: utf8_encode('Kevin van Zonneveld');
            // *     returns 1: 'Kevin van Zonneveld'

            string = (string + '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

            var utftext = '';
            var start, end;
            var stringl;

            start = end = 0;
            stringl = string.length;
            for (var n = 0; n < stringl; n++) {
                var c1 = string.charCodeAt(n);
                var enc = null;

                if (c1 < 128) {
                    end++;
                } else if (c1 > 127 && c1 < 2048) {
                    enc = String.fromCharCode(c1 >> 6 | 192) + String.fromCharCode(c1 & 63 | 128);
                } else {
                    enc = String.fromCharCode(c1 >> 12 | 224) + String.fromCharCode(c1 >> 6 & 63 | 128) + String.fromCharCode(c1 & 63 | 128);
                }
                if (enc != null) {
                    if (end > start) {
                        utftext += string.substring(start, end);
                    }
                    utftext += enc;
                    start = end = n + 1;
                }
            }

            if (end > start) {
                utftext += string.substring(start, string.length);
            }

            return utftext;
        }
    }, {
        key: 'md5_vm_test',

        /*
         * Perform a simple self-test to see if the VM is working
         */
        value: function md5_vm_test() {
            return HasherUtils.hex_md5('abc') == '900150983cd24fb0d6963f7d28e17f72';
        }
    }, {
        key: 'core_md5',

        /*
         * Calculate the MD5 of an array of little-endian words, and a bit length
         */
        value: function core_md5(x, len) {
            /* append padding */
            x[len >> 5] |= 128 << len % 32;
            x[(len + 64 >>> 9 << 4) + 14] = len;

            var a = 1732584193;
            var b = -271733879;
            var c = -1732584194;
            var d = 271733878;

            for (var i = 0; i < x.length; i += 16) {
                var olda = a;
                var oldb = b;
                var oldc = c;
                var oldd = d;

                a = HasherUtils.md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
                d = HasherUtils.md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
                c = HasherUtils.md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
                b = HasherUtils.md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
                a = HasherUtils.md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
                d = HasherUtils.md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
                c = HasherUtils.md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
                b = HasherUtils.md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
                a = HasherUtils.md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
                d = HasherUtils.md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
                c = HasherUtils.md5_ff(c, d, a, b, x[i + 10], 17, -42063);
                b = HasherUtils.md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
                a = HasherUtils.md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
                d = HasherUtils.md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
                c = HasherUtils.md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
                b = HasherUtils.md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);

                a = HasherUtils.md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
                d = HasherUtils.md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
                c = HasherUtils.md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
                b = HasherUtils.md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
                a = HasherUtils.md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
                d = HasherUtils.md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
                c = HasherUtils.md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
                b = HasherUtils.md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
                a = HasherUtils.md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
                d = HasherUtils.md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
                c = HasherUtils.md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
                b = HasherUtils.md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
                a = HasherUtils.md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
                d = HasherUtils.md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
                c = HasherUtils.md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
                b = HasherUtils.md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

                a = HasherUtils.md5_hh(a, b, c, d, x[i + 5], 4, -378558);
                d = HasherUtils.md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
                c = HasherUtils.md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
                b = HasherUtils.md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
                a = HasherUtils.md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
                d = HasherUtils.md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
                c = HasherUtils.md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
                b = HasherUtils.md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
                a = HasherUtils.md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
                d = HasherUtils.md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
                c = HasherUtils.md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
                b = HasherUtils.md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
                a = HasherUtils.md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
                d = HasherUtils.md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
                c = HasherUtils.md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
                b = HasherUtils.md5_hh(b, c, d, a, x[i + 2], 23, -995338651);

                a = HasherUtils.md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
                d = HasherUtils.md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
                c = HasherUtils.md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
                b = HasherUtils.md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
                a = HasherUtils.md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
                d = HasherUtils.md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
                c = HasherUtils.md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
                b = HasherUtils.md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
                a = HasherUtils.md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
                d = HasherUtils.md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
                c = HasherUtils.md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
                b = HasherUtils.md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
                a = HasherUtils.md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
                d = HasherUtils.md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
                c = HasherUtils.md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
                b = HasherUtils.md5_ii(b, c, d, a, x[i + 9], 21, -343485551);

                a = HasherUtils.safe_add(a, olda);
                b = HasherUtils.safe_add(b, oldb);
                c = HasherUtils.safe_add(c, oldc);
                d = HasherUtils.safe_add(d, oldd);
            }
            return [a, b, c, d];
        }
    }, {
        key: 'md5_cmn',

        /*
         * These functions implement the four basic operations the algorithm uses.
         */
        value: function md5_cmn(q, a, b, x, s, t) {
            return HasherUtils.safe_add(HasherUtils.bit_rol(HasherUtils.safe_add(HasherUtils.safe_add(a, q), HasherUtils.safe_add(x, t)), s), b);
        }
    }, {
        key: 'md5_ff',
        value: function md5_ff(a, b, c, d, x, s, t) {
            return HasherUtils.md5_cmn(b & c | ~b & d, a, b, x, s, t);
        }
    }, {
        key: 'md5_gg',
        value: function md5_gg(a, b, c, d, x, s, t) {
            return HasherUtils.md5_cmn(b & d | c & ~d, a, b, x, s, t);
        }
    }, {
        key: 'md5_hh',
        value: function md5_hh(a, b, c, d, x, s, t) {
            return HasherUtils.md5_cmn(b ^ c ^ d, a, b, x, s, t);
        }
    }, {
        key: 'md5_ii',
        value: function md5_ii(a, b, c, d, x, s, t) {
            return HasherUtils.md5_cmn(c ^ (b | ~d), a, b, x, s, t);
        }
    }, {
        key: 'core_hmac_md5',

        /*
         * Calculate the HMAC-MD5, of a key and some data
         */
        value: function core_hmac_md5(key, data) {
            var bkey = HasherUtils.str2binl(key);
            if (bkey.length > 16) bkey = HasherUtils.core_md5(bkey, key.length * HasherUtils.chrsz);

            var ipad = new Array(16),
                opad = new Array(16);
            for (var i = 0; i < 16; i++) {
                ipad[i] = bkey[i] ^ 909522486;
                opad[i] = bkey[i] ^ 1549556828;
            }

            var hash = HasherUtils.core_md5(ipad.concat(HasherUtils.str2binl(data)), 512 + data.length * HasherUtils.chrsz);
            return HasherUtils.core_md5(opad.concat(hash), 512 + 128);
        }
    }, {
        key: 'safe_add',

        /*
         * Add integers, wrapping at 2^32. This uses 16-bit operations internally
         * to work around bugs in some JS interpreters.
         */
        value: function safe_add(x, y) {
            var lsw = (x & 65535) + (y & 65535);
            var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
            return msw << 16 | lsw & 65535;
        }
    }, {
        key: 'bit_rol',

        /*
         * Bitwise rotate a 32-bit number to the left.
         */
        value: function bit_rol(num, cnt) {
            return num << cnt | num >>> 32 - cnt;
        }
    }, {
        key: 'str2binl',

        /*
         * Convert a string to an array of little-endian words
         * If HasherUtils.chrsz is ASCII, characters >255 have their hi-byte silently ignored.
         */
        value: function str2binl(str) {
            var bin = [];
            var mask = (1 << HasherUtils.chrsz) - 1;
            for (var i = 0; i < str.length * HasherUtils.chrsz; i += HasherUtils.chrsz) bin[i >> 5] |= (str.charCodeAt(i / HasherUtils.chrsz) & mask) << i % 32;
            return bin;
        }
    }, {
        key: 'binl2str',

        /*
         * Convert an array of little-endian words to a string
         */
        value: function binl2str(bin) {
            var str = '';
            var mask = (1 << HasherUtils.chrsz) - 1;
            for (var i = 0; i < bin.length * 32; i += HasherUtils.chrsz) str += String.fromCharCode(bin[i >> 5] >>> i % 32 & mask);
            return str;
        }
    }, {
        key: 'binl2hex',

        /*
         * Convert an array of little-endian words to a hex string.
         */
        value: function binl2hex(binarray) {
            var hex_tab = HasherUtils.hexcase ? '0123456789ABCDEF' : '0123456789abcdef';
            var str = '';
            for (var i = 0; i < binarray.length * 4; i++) {
                str += hex_tab.charAt(binarray[i >> 2] >> i % 4 * 8 + 4 & 15) + hex_tab.charAt(binarray[i >> 2] >> i % 4 * 8 & 15);
            }
            return str;
        }
    }, {
        key: 'binl2b64',

        /*
         * Convert an array of little-endian words to a base-64 string
         */
        value: function binl2b64(binarray) {
            var tab = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
            var str = '';
            for (var i = 0; i < binarray.length * 4; i += 3) {
                var triplet = (binarray[i >> 2] >> 8 * (i % 4) & 255) << 16 | (binarray[i + 1 >> 2] >> 8 * ((i + 1) % 4) & 255) << 8 | binarray[i + 2 >> 2] >> 8 * ((i + 2) % 4) & 255;
                for (var j = 0; j < 4; j++) {
                    if (i * 8 + j * 6 > binarray.length * 32) str += HasherUtils.b64pad;else str += tab.charAt(triplet >> 6 * (3 - j) & 63);
                }
            }
            return str;
        }
    }]);

    return HasherUtils;
})();

/*
 * Configurable variables. You may need to tweak these to be compatible with
 * the server-side, but the defaults work in most cases.
 */
HasherUtils.hexcase = 0; /* hex output format. 0 - lowercase; 1 - uppercase        */
HasherUtils.b64pad = ''; /* base-64 pad character. "=" for strict RFC compliance   */
HasherUtils.chrsz = 8; /* bits per input character. 8 - ASCII; 16 - Unicode      */