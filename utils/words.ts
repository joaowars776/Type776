import { Language, WordLength } from '../types';

const COMMON_WORDS_EN = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him", "know", "take", "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", "also", "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these", "give", "day", "most", "us", "is", "are", "was", "were", "been", "has", "had", "world", "life", "hand", "part", "child", "eye", "woman", "place", "work", "week", "case", "point", "government", "company", "number", "group", "problem", "fact", "algorithm", "database", "function", "variable", "interface", "component", "development", "application", "browser", "network", "system", "structure", "programming", "language", "framework",
  "apple", "banana", "cherry", "date", "elderberry", "fig", "grape", "honeydew", "kiwi", "lemon", "mango", "nectarine", "orange", "papaya", "quince", "raspberry", "strawberry", "tangerine", "ugli", "vanilla", "watermelon", "xylophone", "yellow", "zebra",
  "house", "mouse", "cat", "dog", "bird", "fish", "tree", "flower", "grass", "sky", "cloud", "sun", "moon", "star", "planet", "galaxy", "universe", "physics", "chemistry", "biology", "math", "history", "art", "music", "dance", "sport", "game", "code", "bug", "feature",
  "keyboard", "mouse", "monitor", "screen", "laptop", "tablet", "phone", "watch", "camera", "microphone", "speaker", "headphone", "cable", "battery", "charger", "power", "energy", "light", "dark", "fast", "slow", "hard", "soft", "loud", "quiet", "happy", "sad",
  "angry", "fear", "love", "hate", "friend", "enemy", "family", "school", "teacher", "student", "class", "book", "pen", "pencil", "paper", "notebook", "desk", "chair", "table", "door", "window", "wall", "floor", "ceiling", "roof", "garden", "yard", "street", "road",
  "city", "town", "village", "country", "continent", "ocean", "sea", "river", "lake", "mountain", "hill", "valley", "forest", "jungle", "desert", "island", "beach", "sand", "rock", "stone", "metal", "wood", "plastic", "glass", "water", "fire", "air", "earth",
  "north", "south", "east", "west", "left", "right", "up", "down", "forward", "backward", "start", "stop", "pause", "play", "record", "save", "load", "delete", "create", "read", "update", "write", "search", "find", "replace", "copy", "paste", "cut", "undo", "redo",
  "select", "click", "drag", "drop", "scroll", "swipe", "tap", "press", "hold", "release", "move", "jump", "run", "walk", "fly", "swim", "drive", "ride", "climb", "fall", "stand", "sit", "lie", "sleep", "dream", "wake", "eat", "drink", "cook", "bake", "boil"
];

const COMMON_WORDS_PT = [
  "que", "de", "o", "a", "e", "do", "da", "em", "um", "para", "com", "na", "no", "se", "por", "mais", "as", "dos", "como", "mas", "ao", "ele", "das", "tem", "foi", "seu", "sua", "ou", "ser", "quando", "muito", "nos", "já", "eu", "também", "só", "pelo", "pela", "até", "isso", "ela", "entre", "depois", "sem", "mesmo", "aos", "ter", "seus", "quem", "nas", "me", "esse", "eles", "estão", "você", "tinha", "foram", "essa", "num", "nem", "suas", "meu", "as", "minha", "tem", "numa", "pelos", "elas", "qual", "nós", "lhe", "deles", "essas", "esses", "pelas", "este", "dele", "tu", "te", "vocês", "vos", "lhes", "meus", "minhas", "teu", "tua", "teus", "tuas", "nosso", "nossa", "nossos", "nossas", "dela", "delas", "esta", "estes", "estas", "aquele", "aquela", "aqueles", "aquelas", "isto", "aquilo", "estou", "está", "estamos", "estão", "estive", "esteve", "estivemos", "estiveram", "estava", "estávamos", "estavam", "estivera", "estivéramos", "esteja", "estejamos", "estejam", "estivesse", "estivéssemos", "estivessem", "estiver", "estivermos", "estiverem", 
  "programação", "desenvolvimento", "interface", "sistema", "computador", "teclado", "algoritmo", "variável", "função", "banco", "dados", "rede", "estrutura", "aplicação", "navegador",
  "amor", "vida", "casa", "carro", "trabalho", "escola", "família", "amigo", "tempo", "mundo", "dia", "noite", "sol", "lua", "estrela", "céu", "mar", "rio", "lago", "montanha", "floresta", "árvore", "flor", "animal", "gato", "cachorro", "pássaro", "peixe",
  "cidade", "rua", "estrada", "viagem", "feriado", "férias", "dinheiro", "pagamento", "compra", "venda", "loja", "mercado", "comida", "bebida", "água", "fogo", "terra", "ar", "vento", "chuva", "neve", "gelo", "calor", "frio", "quente", "fresco", "seco", "molhado",
  "novo", "velho", "jovem", "adulto", "criança", "bebê", "homem", "mulher", "menino", "menina", "pai", "mãe", "filho", "filha", "irmão", "irmã", "avô", "avó", "tio", "tia", "primo", "prima", "sobrinho", "sobrinha", "marido", "esposa", "namorado", "namorada",
  "livro", "caderno", "caneta", "lápis", "papel", "mesa", "cadeira", "porta", "janela", "parede", "teto", "chão", "quarto", "sala", "cozinha", "banheiro", "jardim", "quintal", "parque", "praça", "praia", "campo", "sítio", "fazenda", "chácara",
  "feliz", "triste", "bravo", "calmo", "rápido", "devagar", "forte", "fraco", "alto", "baixo", "grande", "pequeno", "gordo", "magro", "bonito", "feio", "rico", "pobre", "inteligente", "burro", "sábio", "ignorante", "bom", "mau", "bem", "mal",
  "pensar", "falar", "ouvir", "ver", "sentir", "gostar", "amar", "odiar", "querer", "poder", "dever", "precisar", "fazer", "criar", "construir", "destruir", "começar", "terminar", "abrir", "fechar", "entrar", "sair", "subir", "descer", "cair", "levantar",
  "azul", "vermelho", "amarelo", "verde", "laranja", "roxo", "rosa", "marrom", "preto", "branco", "cinza", "dourado", "prateado", "colorido", "escuro", "claro", "brilhante", "fosco", "transparente", "opaco",
  "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "vinte", "trinta", "quarenta", "cinquenta", "cem", "mil", "milhão", "bilhão", "primeiro", "segundo", "terceiro", "último", "metade", "dobro", "triplo"
];

const removeAccents = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export const generateWords = (count: number, lang: Language, lengthMode: WordLength = WordLength.ALL, useAccents: boolean = true): string[] => {
  let source = lang === 'pt' ? COMMON_WORDS_PT : COMMON_WORDS_EN;
  
  // Filter by length
  if (lengthMode === WordLength.SHORT) {
    source = source.filter(w => w.length < 5);
  } else if (lengthMode === WordLength.MEDIUM) {
    source = source.filter(w => w.length >= 5 && w.length <= 8);
  } else if (lengthMode === WordLength.LONG) {
    source = source.filter(w => w.length > 8);
  }

  // Fallback if filter is too aggressive
  if (source.length === 0) source = lang === 'pt' ? COMMON_WORDS_PT : COMMON_WORDS_EN;

  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * source.length);
    let word = source[randomIndex];
    
    if (!useAccents) {
      word = removeAccents(word);
    }
    
    words.push(word);
  }
  return words;
};
