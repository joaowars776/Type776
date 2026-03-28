
import { AppFont, Theme, WordLength, TextSize } from '../types';

export interface AchievementGuide {
  title: string;
  steps: string[];
  tips?: string[];
}

export const getAchievementGuide = (achId: string, lang: 'en' | 'pt' = 'pt'): AchievementGuide | null => {
  const isEn = lang === 'en';
  
  // 1. Level Achievements
  if (achId.startsWith('level_')) {
    const level = achId.split('_')[1];
    return {
      title: isEn ? `Reach Level ${level}` : `Alcance o Nível ${level}`,
      steps: isEn ? [
        "Play matches to earn XP.",
        "Accumulate enough XP to fill the level bar."
      ] : [
        "Jogue partidas para ganhar XP.",
        "Acumule XP suficiente para preencher a barra de nível."
      ],
      tips: isEn ? [
        "Longer modes (60s) and Sudden Death give more XP.",
        "High accuracy ensures speed multiplier bonuses."
      ] : [
        "Modos mais longos (60s) e Morte Súbita dão mais XP.",
        "A precisão alta garante bônus multiplicadores de velocidade."
      ]
    };
  }

  // 2. Speed Achievements (WPM)
  if (achId.startsWith('speed_')) {
    const parts = achId.split('_'); // ['speed', '100', 'en'? / 'pt'?]
    const speed = parts[1];
    const targetLang = parts[2]; // 'en', 'pt' or undefined

    const steps: string[] = [];
    
    if (targetLang) {
        if (isEn) {
            steps.push(`In the top right header, click the language button ('PT' or 'EN') to switch to: ${targetLang === 'en' ? 'English (EN)' : 'Portuguese (PT)'}.`);
        } else {
            steps.push(`No topo direito da página (cabeçalho), clique no botão de idioma 'PT' ou 'EN' para trocar para: ${targetLang === 'en' ? 'Inglês (EN)' : 'Português (PT)'}.`);
        }
    } else {
        steps.push(isEn ? "Make sure you are in a Typing mode (15s, 30s, etc)." : "Certifique-se de estar em um modo de Digitação (15s, 30s, etc).");
    }
    
    steps.push(isEn ? `Complete a test reaching ${speed} WPM or more.` : `Complete um teste atingindo ${speed} PPM ou mais.`);

    return {
      title: isEn ? `Speed: ${speed} WPM${targetLang ? ` (${targetLang.toUpperCase()})` : ''}` : `Velocidade: ${speed} PPM${targetLang ? ` (${targetLang.toUpperCase()})` : ''}`,
      steps,
      tips: isEn ? [
        "We recommend using the 15 seconds mode for easier speed peaks.",
        "Errors drastically reduce your final WPM. Focus on not making mistakes."
      ] : [
        "Recomendamos usar o modo 15 segundos para facilitar o pico de velocidade.",
        "Erros reduzem drasticamente seu PPM final. Foque em não errar."
      ]
    };
  }

  // 3. Repetition Modes
  if (achId.match(/^(mode_15|mode_30|mode_60|mode_sd)_\d+$/)) {
      const parts = achId.split('_');
      const mode = parts[1];
      const count = parts[2];
      
      let modeName = "";
      if (mode === 'sd') modeName = isEn ? "Sudden Death" : "Morte Súbita";
      else modeName = isEn ? `Time ${mode}s` : `Tempo ${mode}s`;

      return {
          title: isEn ? `${modeName} Marathon` : `Maratona ${modeName}`,
          steps: isEn ? [
              `Select the game mode: ${modeName}.`,
              `Complete this mode ${count} times.`
          ] : [
              `Selecione o modo de jogo: ${modeName}.`,
              `Complete este modo ${count} vezes.`
          ],
          tips: isEn ? [
              "Use Shift+Enter to quickly restart after each match.",
              "You need to reach the result screen for it to count."
          ] : [
              "Use Shift+Enter para reiniciar rapidamente após cada partida.",
              "Você precisa chegar à tela de resultados para contar."
          ]
      };
  }

  // 4. Sudden Death Streaks
  if (achId.startsWith('sd_streak_')) {
      const count = achId.split('_')[2];
      return {
          title: isEn ? `Survivor: ${count} Words` : `Sobrevivente: ${count} Palavras`,
          steps: isEn ? [
              "Select mode: Sudden Death (💀).",
              `Type ${count} words in a row without missing a single letter.`
          ] : [
              "Selecione o modo: Morte Súbita (💀).",
              `Digite ${count} palavras seguidas sem errar nenhuma letra.`
          ],
          tips: isEn ? [
              "The game ends on the first mistake.",
              "Speed doesn't matter, type slowly and calmly."
          ] : [
              "O jogo acaba no primeiro erro.",
              "A velocidade não importa, digite devagar e com calma."
          ]
      };
  }

  // 5. Word Length + Time
  if (achId.match(/^ach_\d+_(short|medium|long)$/)) {
      const parts = achId.split('_');
      const time = parts[1];
      const len = parts[2];
      const lenName = len === 'short' ? (isEn ? 'Short' : 'Curto') : len === 'medium' ? (isEn ? 'Medium' : 'Médio') : (isEn ? 'Long' : 'Longo');
      
      return {
          title: isEn ? `${time}s Challenge - ${lenName}` : `Desafio ${time}s - ${lenName}`,
          steps: isEn ? [
              `Select mode: Time ${time}s.`,
              `In the menu below the timer, change 'Random Length' to: ${lenName}.`,
              "Complete the test."
          ] : [
              `Selecione o modo: Tempo ${time}s.`,
              `No menu abaixo do cronômetro, mude 'Tamanho Aleatório' para: ${lenName}.`,
              "Complete o teste."
          ]
      }
  }

  // 6. Text Size
  if (achId.startsWith('ach_size_')) {
      const size = achId.split('_')[2]; 
      const sizeName = size === 'small' ? (isEn ? 'Small' : 'Pequeno') : size === 'medium' ? (isEn ? 'Medium' : 'Médio') : (isEn ? 'Large' : 'Grande');
      return {
          title: isEn ? `Size: ${sizeName}` : `Tamanho: ${sizeName}`,
          steps: isEn ? [
              `In the menu below the timer, click the Size button until it says: ${sizeName}.`,
              "Complete a typing test."
          ] : [
              `No menu abaixo do cronômetro, clique no botão de Tamanho até ficar: ${sizeName}.`,
              "Complete um teste de digitação."
          ]
      }
  }

  // 7. Habbo Game Achievements (Played Once/Ten/Hundred)
  if (achId.startsWith('ach_') && (achId.endsWith('_1') || achId.endsWith('_10') || achId.endsWith('_100'))) {
      const parts = achId.split('_');
      const gameType = parts.slice(1, -1).join('_');
      const count = parts[parts.length - 1];
      
      const gameNames: Record<string, {en: string, pt: string}> = {
          'gerundio': { en: 'Gerunds', pt: 'Gerúndio' },
          'infinitivo': { en: 'Infinitives', pt: 'Infinitivo' },
          'repita': { en: 'Repeat With Me', pt: 'Repita Comigo' },
          'soletrando': { en: 'Spelling', pt: 'Soletrando' },
          'soleplicando': { en: 'Spell & Duplicate', pt: 'Soleplicando' },
          'duplicando': { en: 'Duplicating', pt: 'Duplicando' },
          'contrario': { en: 'Reverse', pt: 'Contrário' },
          'consoantes': { en: 'Consonants', pt: 'Consoantes' },
          'vogais': { en: 'Vowels', pt: 'Vogais' },
          'singular': { en: 'Singular', pt: 'Singular' },
          'plural': { en: 'Plural', pt: 'Plural' },
          'somatoria': { en: 'Summation', pt: 'Somatória' },
          'lingua_i': { en: 'I Language', pt: 'Língua do i' },
          'final_inicial': { en: 'Last/First', pt: 'Final/Inicial' },
          'inicial_final': { en: 'First/Last', pt: 'Inicial/Final' },
          'extenso': { en: 'Full Number', pt: 'Por Extenso' }
      };

      const game = gameNames[gameType] || { en: gameType, pt: gameType };
      const gameName = isEn ? game.en : game.pt;

      return {
          title: isEn ? `${gameName} Master` : `${gameName} Mestre`,
          steps: isEn ? [
              "Go to the HABBO tab.",
              `Select the game: ${gameName}.`,
              `Complete this game ${count} times.`
          ] : [
              "Vá para a aba HABBO.",
              `Selecione o jogo: ${gameName}.`,
              `Complete este jogo ${count} vezes.`
          ]
      };
  }

  // 8. Specific Unique Achievements
  switch (achId) {
    case 'first_steps':
        return {
            title: isEn ? "First Steps" : "Primeiros Passos",
            steps: isEn ? [
                "Go to the Typing tab.",
                "Complete any test to the end."
            ] : [
                "Vá para a aba de Digitação.",
                "Complete qualquer teste até o final."
            ]
        };
    case 'custom_play':
        return {
            title: isEn ? "Custom Mode" : "Modo Customizado",
            steps: isEn ? [
                "In the game modes menu, click the Pencil icon (Custom).",
                "Paste or type a custom text.",
                "Click 'Start Test' and play until the end."
            ] : [
                "No menu de modos de jogo, clique no ícone de Lápis (Custom).",
                "Cole ou digite um texto personalizado.",
                "Clique em 'Iniciar Teste' e jogue até o fim."
            ]
        };
    case 'ach_mode_play':
        return {
            title: isEn ? "Mission Accepted" : "Missão Aceita",
            steps: isEn ? [
                "Go to the Achievement Mode tab (🏆 Button).",
                "Select any locked mission and click 'Start Mission'.",
                "Complete the objectives of the selected mission."
            ] : [
                "Vá para a aba Modo Conquista (Botão 🏆).",
                "Selecione qualquer missão bloqueada e clique em 'Iniciar Missão'.",
                "Complete os objetivos da missão selecionada."
            ],
            tips: isEn ? [
                "You already have this mission active!"
            ] : [
                "Você já está com esta missão ativa!"
            ]
        };
    case 'new_look':
        return {
            title: isEn ? "New Identity" : "Nova Identidade",
            steps: isEn ? [
                "Navigate to the PROFILE tab.",
                "Click on your Avatar circle.",
                "Select a new background color or icon."
            ] : [
                "Navegue até a aba PERFIL.",
                "Clique no círculo do seu Avatar.",
                "Selecione uma nova cor de fundo ou ícone."
            ]
        };
    case 'theme_master':
        return {
            title: isEn ? "Theme Master" : "Mestre dos Temas",
            steps: isEn ? [
                "Open Settings (⚙️) in the top right corner.",
                "Change the Theme to one you've never used.",
                "Complete a test with this theme.",
                "Repeat with 5 different themes."
            ] : [
                "Abra as Configurações (⚙️) no canto superior direito.",
                "Troque o Tema para um que você nunca usou.",
                "Complete um teste com este tema.",
                "Repita com 5 temas diferentes."
            ]
        };
    case 'font_master':
        return {
            title: isEn ? "Typographer" : "Tipógrafo",
            steps: isEn ? [
                "Open Settings (⚙️).",
                "Enable 'Apply Font to Game' option.",
                "Change the Font (e.g., Press Start 2P) and complete a test.",
                "Repeat the process with all available fonts."
            ] : [
                "Abra Configurações (⚙️).",
                "Ative a opção 'Aplicar Fonte ao Jogo'.",
                "Mude a Fonte (ex: Press Start 2P) e complete um teste.",
                "Repita o processo com todas as fontes disponíveis."
            ]
        };
    case 'perfectionist':
        return {
            title: isEn ? "Perfectionist" : "Perfeccionista",
            steps: isEn ? [
                "Choose 30s or 60s mode.",
                "Complete the test with 100% accuracy."
            ] : [
                "Escolha o modo 30s ou 60s.",
                "Complete o teste com 100% de precisão."
            ],
            tips: isEn ? [
                "You cannot make a mistake and correct it. Backspace counts as a failure for perfect accuracy."
            ] : [
                "Você não pode errar e corrigir. O backspace conta como falha de precisão perfeita."
            ]
        };
    case 'marathon':
        return {
            title: isEn ? "Marathoner" : "Maratonista",
            steps: isEn ? [
                "Accumulate 1 hour (3600 seconds) of total time played in tests."
            ] : [
                "Acumule 1 hora (3600 segundos) de tempo total jogado em testes."
            ],
            tips: isEn ? [
                "Check your total time in the Profile tab."
            ] : [
                "Consulte seu tempo total na aba Perfil."
            ]
        };
    case 'dedication_100':
        return {
            title: isEn ? "Dedicated" : "Dedicado",
            steps: isEn ? [
                "Complete 100 typing tests in total."
            ] : [
                "Complete 100 testes de digitação no total."
            ]
        };
    case 'ach_focus_user':
        return {
            title: isEn ? "Focused" : "Focado",
            steps: isEn ? [
                "Click the 'Focus Mode' button (👁️) below the typing area.",
                "Complete a test while focus mode is active."
            ] : [
                "Clique no botão 'Modo Foco' (👁️) abaixo da área de digitação.",
                "Complete um teste enquanto o modo foco está ativo."
            ]
        };
    case 'ach_history_viewer':
        return {
            title: isEn ? "Analyst" : "Analista",
            steps: isEn ? [
                "Go to the PROFILE tab.",
                "Scroll to the History list.",
                "Click the 'View' button on any item in the list."
            ] : [
                "Vá para a aba PERFIL.",
                "Role até a lista de Histórico.",
                "Clique no botão 'Ver' em qualquer item da lista."
            ]
        };
    case 'ach_curious_mind':
        return {
            title: isEn ? "Curious Mind" : "Mente Curiosa",
            steps: isEn ? [
                "Go to the PROFILE tab.",
                "In the Achievements area, click the 'Locked' tab.",
                "Use pagination to see all pages of locked achievements."
            ] : [
                "Vá para a aba PERFIL.",
                "Na área de Conquistas, clique na aba 'Bloqueadas'.",
                "Use a paginação para ver todas as páginas de conquistas bloqueadas."
            ]
        };
  }

  return null;
};
