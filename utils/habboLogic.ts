
import { HabboGameType, Language, WordLength } from '../types';
import { generateWords } from './words';

const PT_VERBS = [
    { inf: "falar", ger: "falando" },
    { inf: "comer", ger: "comendo" },
    { inf: "partir", ger: "partindo" },
    { inf: "andar", ger: "andando" },
    { inf: "beber", ger: "bebendo" },
    { inf: "correr", ger: "correndo" },
    { inf: "sorrir", ger: "sorrindo" },
    { inf: "amar", ger: "amando" },
    { inf: "cantar", ger: "cantando" },
    { inf: "ler", ger: "lendo" },
    { inf: "ver", ger: "vendo" },
    { inf: "pular", ger: "pulando" },
    { inf: "escrever", ger: "escrevendo" },
    { inf: "abrir", ger: "abrindo" },
    { inf: "estudar", ger: "estudando" },
    { inf: "brincar", ger: "brincando" },
    { inf: "dançar", ger: "dançando" },
    { inf: "dormir", ger: "dormindo" },
    { inf: "sonhar", ger: "sonhando" },
    { inf: "viajar", ger: "viajando" },
    { inf: "pensar", ger: "pensando" },
    { inf: "achar", ger: "achando" },
    { inf: "ganhar", ger: "ganhando" },
    { inf: "perder", ger: "perdendo" },
    { inf: "subir", ger: "subindo" },
    { inf: "descer", ger: "descendo" }
];

const PLURAL_PAIRS_PT = [
    { s: "amor", p: "amores" }, { s: "casa", p: "casas" }, { s: "cavalo", p: "cavalos" },
    { s: "luz", p: "luzes" }, { s: "sol", p: "sóis" }, { s: "mão", p: "mãos" },
    { s: "pão", p: "pães" }, { s: "cão", p: "cães" }, { s: "fogo", p: "fogos" },
    { s: "água", p: "águas" }, { s: "flor", p: "flores" }, { s: "jardim", p: "jardins" },
    { s: "homem", p: "homens" }, { s: "mulher", p: "mulheres" }, { s: "livro", p: "livros" },
    { s: "papel", p: "papéis" }, { s: "azul", p: "azuis" }, { s: "feliz", p: "felizes" },
    { s: "fácil", p: "fáceis" }, { s: "difícil", p: "difíceis" }, { s: "animal", p: "animais" },
    { s: "capital", p: "capitais" }, { s: "dor", p: "dores" }, { s: "mar", p: "mares" },
    { s: "colher", p: "colheres" }
];

const PLURAL_PAIRS_EN = [
    { s: "love", p: "loves" }, { s: "house", p: "houses" }, { s: "horse", p: "horses" },
    { s: "light", p: "lights" }, { s: "sun", p: "suns" }, { s: "hand", p: "hands" },
    { s: "bread", p: "breads" }, { s: "dog", p: "dogs" }, { s: "fire", p: "fires" },
    { s: "water", p: "waters" }, { s: "flower", p: "flowers" }, { s: "garden", p: "gardens" },
    { s: "man", p: "men" }, { s: "woman", p: "women" }, { s: "book", p: "books" },
    { s: "paper", p: "papers" }, { s: "blue", p: "blues" }, { s: "happy", p: "happies" },
    { s: "easy", p: "easies" }, { s: "hard", p: "hards" }, { s: "animal", p: "animals" },
    { s: "child", p: "children" }, { s: "tooth", p: "teeth" }, { s: "foot", p: "feet" },
    { s: "mouse", p: "mice" }
];

const SENTENCES_PT = [
    { text: "O rato roeu a roupa do rei de Roma.", len: "short", diff: "hard" },
    { text: "A vida é bela e curta.", len: "short", diff: "normal" },
    { text: "Quem canta seus males espanta.", len: "short", diff: "normal" },
    { text: "Mais vale um pássaro na mão do que dois voando.", len: "long", diff: "hard" },
    { text: "Água mole em pedra dura tanto bate até que fura.", len: "long", diff: "hard" },
    { text: "Programar é a arte de transformar café em código.", len: "long", diff: "hard" },
    { text: "o sol brilha para todos", len: "short", diff: "normal" },
    { text: "a pratica leva a perfeição", len: "short", diff: "normal" },
    { text: "tempo é dinheiro", len: "short", diff: "normal" },
    { text: "aprender a digitar rápido é uma habilidade essencial hoje em dia.", len: "long", diff: "hard" },
    { text: "desenvolver aplicações web requer paciencia e estudo.", len: "long", diff: "normal" },
    { text: "A persistência é o caminho do êxito.", len: "short", diff: "hard" },
];

const SENTENCES_EN = [
    { text: "The quick brown fox jumps over the lazy dog.", len: "long", diff: "normal" },
    { text: "To be or not to be, that is the question.", len: "long", diff: "hard" },
    { text: "Hello world.", len: "short", diff: "normal" },
    { text: "Practice makes perfect.", len: "short", diff: "normal" },
    { text: "Time is money.", len: "short", diff: "normal" },
    { text: "Actions speak louder than words.", len: "short", diff: "normal" },
    { text: "A picture is worth a thousand words.", len: "long", diff: "normal" },
    { text: "Coding is like poetry for computers.", len: "long", diff: "normal" },
    { text: "I love programming in React.", len: "short", diff: "hard" },
    { text: "JavaScript is versatile.", len: "short", diff: "hard" },
];

export interface GameChallenge {
    display: string;
    expected: string;
    instructionKey: string;
    gameType: HabboGameType;
}

export const getHabboGamesList = (lang: Language) => {
    // Alphabetical Order Sorting Helper
    const sortByName = (a: any, b: any) => a.id.localeCompare(b.id);

    const all = [
        { id: HabboGameType.REPITA },
        { id: HabboGameType.SOLETRANDO },
        { id: HabboGameType.SOLEPLICANDO },
        { id: HabboGameType.DUPLICANDO },
        { id: HabboGameType.CONTRARIO },
        { id: HabboGameType.CONSOANTES },
        { id: HabboGameType.VOGAIS },
        { id: HabboGameType.SINGULAR },
        { id: HabboGameType.PLURAL },
        { id: HabboGameType.SOMATORIA },
        { id: HabboGameType.LINGUA_I },
        { id: HabboGameType.FINAL_INICIAL },
        { id: HabboGameType.INICIAL_FINAL },
        { id: HabboGameType.EXTENSO },
    ];

    if (lang === 'pt') {
        all.push({ id: HabboGameType.GERUNDIO });
        all.push({ id: HabboGameType.INFINITIVO });
    }

    return all.sort(sortByName);
};

export const getDemoExamples = (type: HabboGameType, lang: Language) => {
    const isPt = lang === 'pt';
    
    switch (type) {
        case HabboGameType.ALEATORIO: return [{f: 'Random', t: '?'}, {f: 'Mix', t: '!'}, {f: 'Fun', t: ':)'}];
        case HabboGameType.GERUNDIO: return [{f: 'amar', t: 'amando'}, {f: 'comer', t: 'comendo'}, {f: 'partir', t: 'partindo'}];
        case HabboGameType.INFINITIVO: return [{f: 'falando', t: 'falar'}, {f: 'bebendo', t: 'beber'}, {f: 'lendo', t: 'ler'}];
        case HabboGameType.REPITA: 
            return isPt 
                ? [{f: 'Olá Mundo', t: 'Olá Mundo'}, {f: 'Digitar', t: 'Digitar'}, {f: 'Rápido', t: 'Rápido'}]
                : [{f: 'Hello World', t: 'Hello World'}, {f: 'Typing', t: 'Typing'}, {f: 'Fast', t: 'Fast'}];
        case HabboGameType.SOLETRANDO: 
            return isPt 
                ? [{f: 'amor', t: 'a m o r'}, {f: 'casa', t: 'c a s a'}, {f: 'sol', t: 's o l'}]
                : [{f: 'love', t: 'l o v e'}, {f: 'house', t: 'h o u s e'}, {f: 'sun', t: 's u n'}];
        case HabboGameType.SOLEPLICANDO: 
            return isPt
                ? [{f: 'amor', t: 'aa mm oo rr'}, {f: 'oi', t: 'oo ii'}, {f: 'lua', t: 'll uu aa'}]
                : [{f: 'love', t: 'll oo vv ee'}, {f: 'hi', t: 'hh ii'}, {f: 'sun', t: 'ss uu nn'}];
        case HabboGameType.DUPLICANDO: 
            return isPt
                ? [{f: 'amor', t: 'aammoorr'}, {f: 'oi', t: 'ooii'}, {f: 'lua', t: 'lluuaa'}]
                : [{f: 'love', t: 'lloovvee'}, {f: 'hi', t: 'hhii'}, {f: 'sun', t: 'ssuunn'}];
        case HabboGameType.CONTRARIO: 
            return isPt
                ? [{f: 'amor', t: 'roma'}, {f: 'bola', t: 'alob'}, {f: 'dia', t: 'aid'}]
                : [{f: 'love', t: 'evol'}, {f: 'ball', t: 'llab'}, {f: 'day', t: 'yad'}];
        case HabboGameType.CONSOANTES: 
            return isPt
                ? [{f: 'amor', t: 'mr'}, {f: 'casa', t: 'cs'}, {f: 'teste', t: 'tst'}]
                : [{f: 'love', t: 'lv'}, {f: 'house', t: 'hs'}, {f: 'test', t: 'tst'}];
        case HabboGameType.VOGAIS: 
            return isPt
                ? [{f: 'amor', t: 'ao'}, {f: 'casa', t: 'aa'}, {f: 'teste', t: 'ee'}]
                : [{f: 'love', t: 'oe'}, {f: 'house', t: 'oue'}, {f: 'test', t: 'e'}];
        case HabboGameType.SINGULAR:
            return isPt
                ? [{f: 'Amores', t: 'Amor'}, {f: 'Casas', t: 'Casa'}, {f: 'Luzes', t: 'Luz'}]
                : [{f: 'Loves', t: 'Love'}, {f: 'Houses', t: 'House'}, {f: 'Lights', t: 'Light'}];
        case HabboGameType.PLURAL:
            return isPt
                ? [{f: 'Amor', t: 'Amores'}, {f: 'Casa', t: 'Casas'}, {f: 'Luz', t: 'Luzes'}]
                : [{f: 'Love', t: 'Loves'}, {f: 'House', t: 'Houses'}, {f: 'Light', t: 'Lights'}];
        case HabboGameType.SOMATORIA:
            return [{f: '2+2', t: '4'}, {f: '10+5', t: '15'}, {f: '20-5', t: '15'}];
        case HabboGameType.LINGUA_I:
            return isPt
                ? [{f: 'Futebol', t: 'Fitibil'}, {f: 'Bola', t: 'Bili'}, {f: 'Gato', t: 'Giti'}]
                : [{f: 'Football', t: 'Fiitbiill'}, {f: 'Cat', t: 'Cit'}, {f: 'Dog', t: 'Dig'}];
        case HabboGameType.FINAL_INICIAL:
            return isPt
                ? [{f: 'Cavalo', t: 'oc'}, {f: 'Amor', t: 'ra'}, {f: 'Sol', t: 'ls'}]
                : [{f: 'Horse', t: 'eh'}, {f: 'Love', t: 'el'}, {f: 'Sun', t: 'ns'}];
        case HabboGameType.INICIAL_FINAL:
            return isPt
                ? [{f: 'Cavalo', t: 'co'}, {f: 'Amor', t: 'ar'}, {f: 'Sol', t: 'sl'}]
                : [{f: 'Horse', t: 'he'}, {f: 'Love', t: 'le'}, {f: 'Sun', t: 'sn'}];
        case HabboGameType.EXTENSO:
            return isPt
                ? [{f: '10', t: 'dez'}, {f: '100', t: 'cem'}, {f: '123', t: 'cento e vinte e três'}]
                : [{f: '10', t: 'ten'}, {f: '100', t: 'one hundred'}, {f: '123', t: 'one hundred twenty three'}];
        default: return [];
    }
};

export const gameUsesSpace = (type: HabboGameType) => {
    return [HabboGameType.REPITA, HabboGameType.SOLETRANDO, HabboGameType.SOLEPLICANDO, HabboGameType.EXTENSO].includes(type);
}

// Extenso Helpers
const UNITS = ["zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
const TENS = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
const HUNDREDS = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

const numberToWordsPT = (num: number): string => {
    if (num < 20) return UNITS[num];
    if (num < 100) return TENS[Math.floor(num / 10)] + (num % 10 !== 0 ? " e " + UNITS[num % 10] : "");
    if (num === 100) return "cem";
    if (num < 1000) return HUNDREDS[Math.floor(num / 100)] + (num % 100 !== 0 ? " e " + numberToWordsPT(num % 100) : "");
    if (num < 2000) return "mil" + (num % 1000 !== 0 ? (num % 1000 < 100 || (num % 1000) % 100 === 0 ? " e " : " ") + numberToWordsPT(num % 1000) : "");
    if (num < 1000000) return numberToWordsPT(Math.floor(num / 1000)) + " mil" + (num % 1000 !== 0 ? (num % 1000 < 100 || (num % 1000) % 100 === 0 ? " e " : " ") + numberToWordsPT(num % 1000) : "");
    return num.toString();
};

const UNITS_EN = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS_EN = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

const numberToWordsEN = (num: number): string => {
    if (num < 20) return UNITS_EN[num];
    if (num < 100) return TENS_EN[Math.floor(num / 10)] + (num % 10 !== 0 ? " " + UNITS_EN[num % 10] : "");
    if (num < 1000) return UNITS_EN[Math.floor(num / 100)] + " hundred" + (num % 100 !== 0 ? " " + numberToWordsEN(num % 100) : "");
    if (num < 1000000) return numberToWordsEN(Math.floor(num / 1000)) + " thousand" + (num % 1000 !== 0 ? " " + numberToWordsEN(num % 1000) : "");
    return num.toString();
};

interface RepitaConfig {
    difficulty: 'normal' | 'hard';
    length: 'short' | 'long';
}

export const generateHabboChallenges = (type: HabboGameType, lang: Language, count: number, repitaConfig?: RepitaConfig): GameChallenge[] => {
    const challenges: GameChallenge[] = [];
    const r = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
    const w = () => generateWords(1, lang, WordLength.ALL, true)[0];

    const availableGames = getHabboGamesList(lang).map(g => g.id).filter(id => id !== HabboGameType.ALEATORIO);

    // For infinite generation or batch generation
    for (let i = 0; i < count; i++) {
        const currentType = type === HabboGameType.ALEATORIO ? r(availableGames) : type;

        switch (currentType) {
            case HabboGameType.GERUNDIO: {
                const verb = r(PT_VERBS);
                challenges.push({ display: verb.inf, expected: verb.ger, instructionKey: 'game_gerundio_desc', gameType: HabboGameType.GERUNDIO });
                break;
            }
            case HabboGameType.INFINITIVO: {
                const verb = r(PT_VERBS);
                challenges.push({ display: verb.ger, expected: verb.inf, instructionKey: 'game_infinitivo_desc', gameType: HabboGameType.INFINITIVO });
                break;
            }
            case HabboGameType.REPITA: {
                let source = lang === 'pt' ? SENTENCES_PT : SENTENCES_EN;
                
                if (repitaConfig) {
                    source = source.filter(s => {
                        let matchesDiff = false;
                        if (repitaConfig.difficulty === 'hard') matchesDiff = true; 
                        else matchesDiff = s.diff === 'normal';

                        if (repitaConfig.difficulty === 'hard') matchesDiff = s.diff === 'hard';

                        const matchesLen = s.len === repitaConfig.length;
                        return matchesDiff && matchesLen;
                    });
                    
                    if (source.length === 0) source = lang === 'pt' ? SENTENCES_PT : SENTENCES_EN; // Fallback
                }

                const s = r(source);
                let text = s.text;
                if (repitaConfig && repitaConfig.difficulty === 'normal') {
                    // Normalize for normal difficulty if mixed
                    text = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                }

                challenges.push({ display: text, expected: text, instructionKey: 'game_repita_desc', gameType: HabboGameType.REPITA });
                break;
            }
            case HabboGameType.SOLETRANDO: {
                const word = w();
                const expected = word.split('').join(' ');
                challenges.push({ display: word, expected: expected, instructionKey: 'game_soletrando_desc', gameType: HabboGameType.SOLETRANDO });
                break;
            }
            case HabboGameType.SOLEPLICANDO: {
                const word = w();
                // "amor" -> "aa mm oo rr"
                const expected = word.split('').map((c: string) => c + c).join(' ');
                challenges.push({ display: word, expected: expected, instructionKey: 'game_soleplicando_desc', gameType: HabboGameType.SOLEPLICANDO });
                break;
            }
            case HabboGameType.DUPLICANDO: {
                const word = w();
                // "amor" -> "aammoorr"
                const expected = word.split('').map((c: string) => c + c).join('');
                challenges.push({ display: word, expected: expected, instructionKey: 'game_duplicando_desc', gameType: HabboGameType.DUPLICANDO });
                break;
            }
            case HabboGameType.CONTRARIO: {
                 const word = w();
                 // "amor" -> "roma"
                 const expected = word.split('').reverse().join('');
                 challenges.push({ display: word, expected: expected, instructionKey: 'game_contrario_desc', gameType: HabboGameType.CONTRARIO });
                 break;
            }
            case HabboGameType.CONSOANTES: {
                const word = w();
                const expected = word.replace(/[aeiouà-ú]/gi, '');
                challenges.push({ display: word, expected: expected.length === 0 ? '-' : expected, instructionKey: 'game_consoantes_desc', gameType: HabboGameType.CONSOANTES });
                break;
            }
            case HabboGameType.VOGAIS: {
                const word = w();
                const expected = word.replace(/[^aeiouà-ú]/gi, '');
                challenges.push({ display: word, expected: expected.length === 0 ? '-' : expected, instructionKey: 'game_vogais_desc', gameType: HabboGameType.VOGAIS });
                break;
            }
            case HabboGameType.SINGULAR: {
                const src = lang === 'pt' ? PLURAL_PAIRS_PT : PLURAL_PAIRS_EN;
                const pair = r(src);
                challenges.push({ display: pair.p, expected: pair.s, instructionKey: 'game_singular_desc', gameType: HabboGameType.SINGULAR });
                break;
            }
            case HabboGameType.PLURAL: {
                const src = lang === 'pt' ? PLURAL_PAIRS_PT : PLURAL_PAIRS_EN;
                const pair = r(src);
                challenges.push({ display: pair.s, expected: pair.p, instructionKey: 'game_plural_desc', gameType: HabboGameType.PLURAL });
                break;
            }
            case HabboGameType.SOMATORIA: {
                const a = Math.floor(Math.random() * 50) + 1;
                const b = Math.floor(Math.random() * 50) + 1;
                const op = Math.random() > 0.5 ? '+' : '-';
                let valA = a;
                let valB = b;
                if (op === '-' && valA < valB) { [valA, valB] = [valB, valA]; } // Ensure positive result
                const res = op === '+' ? valA + valB : valA - valB;
                challenges.push({ display: `${valA}${op}${valB}`, expected: res.toString(), instructionKey: 'game_somatoria_desc', gameType: HabboGameType.SOMATORIA });
                break;
            }
            case HabboGameType.LINGUA_I: {
                const word = w();
                const expected = word.replace(/[aeiouà-ú]/gi, 'i');
                challenges.push({ display: word, expected: expected, instructionKey: 'game_lingua_i_desc', gameType: HabboGameType.LINGUA_I });
                break;
            }
            case HabboGameType.FINAL_INICIAL: {
                const word = w();
                if (word.length < 2) { 
                    i--; continue; 
                }
                const expected = word.slice(-1) + word.slice(0, 1);
                challenges.push({ display: word, expected: expected, instructionKey: 'game_final_inicial_desc', gameType: HabboGameType.FINAL_INICIAL });
                break;
            }
            case HabboGameType.INICIAL_FINAL: {
                const word = w();
                if (word.length < 2) { 
                    i--; continue; 
                }
                const expected = word.slice(0, 1) + word.slice(-1);
                challenges.push({ display: word, expected: expected, instructionKey: 'game_inicial_final_desc', gameType: HabboGameType.INICIAL_FINAL });
                break;
            }
            case HabboGameType.EXTENSO: {
                const num = Math.floor(Math.random() * 999) + 1;
                const expected = lang === 'pt' ? numberToWordsPT(num) : numberToWordsEN(num);
                challenges.push({ display: num.toString(), expected: expected, instructionKey: 'game_extenso_desc', gameType: HabboGameType.EXTENSO });
                break;
            }
        }
    }
    return challenges;
};
