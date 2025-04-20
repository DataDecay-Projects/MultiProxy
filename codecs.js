const codecRegistry = new Map();

function registerCodec(name, codec) {
    if (!codec.encode || !codec.decode) {
        throw new Error(`Codec ${name} must have encode and decode functions`);
    }
    codecRegistry.set(name, codec);
}

// Register the none codec
registerCodec('none', {
    encode: (str) => str,
    decode: (str) => str
});

// Register the plain codec
registerCodec('plain', {
    encode(str) {
        if (!str) return str;
        return encodeURIComponent(str);
    },
    decode(str) {
        if (!str) return str;
        return decodeURIComponent(str);
    }
});

// Register the xor codec
registerCodec('xor', {
    encode(str) {
        if (!str) return str;
        let result = "";
        let len = str.length;
        for (let i = 0; i < len; i++) {
            const char = str[i];
            result += i % 2 ? String.fromCharCode(char.charCodeAt(0) ^ 2) : char;
        }
        return encodeURIComponent(result);
    },
    decode(str) {
        if (!str) return str;
        str = decodeURIComponent(str);
        let result = "";
        let len = str.length;
        for (let i = 0; i < len; i++) {
            const char = str[i];
            result += i % 2 ? String.fromCharCode(char.charCodeAt(0) ^ 2) : char;
        }
        return result;
    }
});

// Register the base64 codec
registerCodec('base64', {
    encode(str) {
        if (!str) return str;
        str = str.toString();
        return btoa(encodeURIComponent(str));
    },
    decode(str) {
        if (!str) return str;
        str = str.toString();
        return decodeURIComponent(atob(str));
    }
});

// Register the incog codec
registerCodec('incog', {
    encode(str) {
        if (!str) return str;
        return encodeURIComponent(
            str
                .toString()
                .split('')
                .map((char, ind) => (ind % 2 ? String.fromCharCode(char.charCodeAt() ^ 3) : char))
                .join('')
        );
    },
    decode(str) {
        if (!str) return str;
        let [input, ...search] = str.split('?');
        return (
            decodeURIComponent(input)
                .split('')
                .map((char, ind) => (ind % 2 ? String.fromCharCode(char.charCodeAt(0) ^ 3) : char))
                .join('') + (search.length ? '?' + search.join('?') : '')
        );
    }
});

// Export functions to get and list codecs
export function getCodec(name) {
    return codecRegistry.get(name);
}

export function listCodecs() {
    return Array.from(codecRegistry.keys());
}

// Export individual codecs for backwards compatibility
export const none = codecRegistry.get('none');
export const plain = codecRegistry.get('plain');
export const xor = codecRegistry.get('xor');
export const base64 = codecRegistry.get('base64');
export const incog = codecRegistry.get('incog');