
import { AppFont, Theme, WordLength, TextSize } from '../types';

export interface AchievementGuide {
  title: string;
  steps: string[];
  tips?: string[];
}

export const getAchievementGuide = (achId: string): AchievementGuide | null => {
  
  // 1. Level Achievements
  if (achId.startsWith('level_')) {
    const level = achId.split('_')[1];
    return {
      title: `Alcance o Nível ${level}`,
      steps: [
        "Jogue partidas para ganhar XP.",
        "Acumule XP suficiente para preencher a barra de nível."
      ],
      tips: [
        "Modos mais longos (60s) e Morte Súbita dão mais XP.",
        "A precisão alta garante bônus multiplicadores de velocidade."
      ]
    };
  }

  // 2. Speed Achievements (WPM)
  if (achId.startsWith('speed_')) {
    const parts = achId.split('_'); // ['speed', '100', 'en'?]
    const speed = parts[1];
    const lang = parts[2]; // 'en', 'pt' or undefined

    const steps: string[] = [];
    
    if (lang) {
        steps.push(`No topo direito da página (cabeçalho), clique no botão de idioma 'PT' ou 'EN' para trocar para: ${lang === 'en' ? 'Inglês (EN)' : 'Português (PT)'}.`);
    } else {
        steps.push("Certifique-se de estar em um modo de Digitação (15s, 30s, etc).");
    }
    
    steps.push(`Complete um teste atingindo ${speed} PPM ou mais.`);

    return {
      title: `Velocidade: ${speed} PPM${lang ? ` (${lang.toUpperCase()})` : ''}`,
      steps,
      tips: [
        "Recomendamos usar o modo 15 segundos para facilitar o pico de velocidade.",
        "Erros reduzem drasticamente seu PPM final. Foque em não errar."
      ]
    };
  }

  // 3. Repetition Modes
  if (achId.startsWith('mode_')) {
      const parts = achId.split('_');
      const mode = parts[1];
      const count = parts[2];
      
      let modeName = "";
      if (mode === 'sd') modeName = "Morte Súbita";
      else modeName = `Tempo ${mode}s`;

      return {
          title: `Maratona ${modeName}`,
          steps: [
              `Selecione o modo de jogo: ${modeName}.`,
              `Complete este modo ${count} vezes.`
          ],
          tips: [
              "Use Shift+Enter para reiniciar rapidamente após cada partida.",
              "Você precisa chegar à tela de resultados para contar."
          ]
      };
  }

  // 4. Sudden Death Streaks
  if (achId.startsWith('sd_streak_')) {
      const count = achId.split('_')[2];
      return {
          title: `Sobrevivente: ${count} Palavras`,
          steps: [
              "Selecione o modo: Morte Súbita (💀).",
              `Digite ${count} palavras seguidas sem errar nenhuma letra.`
          ],
          tips: [
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
      const lenName = len === 'short' ? 'Curto' : len === 'medium' ? 'Médio' : 'Longo';
      
      return {
          title: `Desafio ${time}s - ${lenName}`,
          steps: [
              `Selecione o modo: Tempo ${time}s.`,
              `No menu abaixo do cronômetro, mude 'Tamanho Aleatório' para: ${lenName}.`,
              "Complete o teste."
          ]
      }
  }

  // 6. Text Size
  if (achId.startsWith('ach_size_')) {
      const size = achId.split('_')[2]; 
      const sizeName = size === 'small' ? 'Pequeno' : size === 'medium' ? 'Médio' : 'Grande';
      return {
          title: `Tamanho: ${sizeName}`,
          steps: [
              `No menu abaixo do cronômetro, clique no botão de Tamanho até ficar: ${sizeName}.`,
              "Complete um teste de digitação."
          ]
      }
  }

  // 7. Specific Unique Achievements
  switch (achId) {
    case 'first_steps':
        return {
            title: "Primeiros Passos",
            steps: [
                "Vá para a aba de Digitação.",
                "Complete qualquer teste até o final."
            ]
        };
    case 'custom_play':
        return {
            title: "Modo Customizado",
            steps: [
                "No menu de modos de jogo, clique no ícone de Lápis (Custom).",
                "Cole ou digite um texto personalizado.",
                "Clique em 'Iniciar Teste' e jogue até o fim."
            ]
        };
    case 'ach_mode_play':
        return {
            title: "Missão Aceita",
            steps: [
                "Vá para a aba Modo Conquista (Botão 🏆).",
                "Selecione qualquer missão bloqueada e clique em 'Iniciar Missão'.",
                "Complete os objetivos da missão selecionada."
            ],
            tips: [
                "Você já está com esta missão ativa!"
            ]
        };
    case 'new_look':
        return {
            title: "Nova Identidade",
            steps: [
                "Navegue até a aba PERFIL.",
                "Clique no círculo do seu Avatar.",
                "Selecione uma nova cor de fundo ou ícone."
            ]
        };
    case 'theme_master':
        return {
            title: "Mestre dos Temas",
            steps: [
                "Abra as Configurações (⚙️) no canto superior direito.",
                "Troque o Tema para um que você nunca usou.",
                "Complete um teste com este tema.",
                "Repita com 5 temas diferentes."
            ]
        };
    case 'font_master':
        return {
            title: "Tipógrafo",
            steps: [
                "Abra Configurações (⚙️).",
                "Ative a opção 'Aplicar Fonte ao Jogo'.",
                "Mude a Fonte (ex: Press Start 2P) e complete um teste.",
                "Repita o processo com todas as fontes disponíveis."
            ]
        };
    case 'perfectionist':
        return {
            title: "Perfeccionista",
            steps: [
                "Escolha o modo 30s ou 60s.",
                "Complete o teste com 100% de precisão."
            ],
            tips: [
                "Você não pode errar e corrigir. O backspace conta como falha de precisão perfeita."
            ]
        };
    case 'marathon':
        return {
            title: "Maratonista",
            steps: [
                "Acumule 1 hora (3600 segundos) de tempo total jogado em testes."
            ],
            tips: [
                "Consulte seu tempo total na aba Perfil."
            ]
        };
    case 'dedication_100':
        return {
            title: "Dedicado",
            steps: [
                "Complete 100 testes de digitação no total."
            ]
        };
    case 'ach_focus_user':
        return {
            title: "Focado",
            steps: [
                "Clique no botão 'Modo Foco' (👁️) abaixo da área de digitação.",
                "Complete um teste enquanto o modo foco está ativo."
            ]
        };
    case 'ach_history_viewer':
        return {
            title: "Analista",
            steps: [
                "Vá para a aba PERFIL.",
                "Role até a lista de Histórico.",
                "Clique no botão 'Ver' em qualquer item da lista."
            ]
        };
    case 'ach_curious_mind':
        return {
            title: "Mente Curiosa",
            steps: [
                "Vá para a aba PERFIL.",
                "Na área de Conquistas, clique na aba 'Bloqueadas'.",
                "Use a paginação para ver todas as páginas de conquistas bloqueadas."
            ]
        };
  }

  return null;
};
