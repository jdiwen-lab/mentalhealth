export const roles = {
  harbor: {
    id: "harbor",
    name: "港灣型",
    englishName: "Harbor",
    tagline: "先穩住，再前進",
    core: "安定",
    color: "#2f7777",
    colorDark: "#174f55",
    colorSoft: "#dff2ef",
    keywords: ["沉著", "安全感", "穩定步調"],
    summary: "你擅長先穩定自己與周遭氛圍，再一步一步面對眼前的事情。",
    strength: "面對急迫或混亂時，你能降低刺激、整理節奏，讓自己與身邊的人重新感到踏實。",
    reminder: "穩定不等於把所有壓力都留給自己；需要時，讓別人知道你也想被接住。",
    practice: "下一次感到忙亂時，先做一次深呼吸，寫下現在最需要完成的一小步。",
    cardLine: "你用安定與沉著，為自己和他人留出重新前進的空間。"
  },
  lighthouse: {
    id: "lighthouse",
    name: "燈塔型",
    englishName: "Lighthouse",
    tagline: "看清方向，開始行動",
    core: "方向",
    color: "#c4841d",
    colorDark: "#7d5010",
    colorSoft: "#fff0cf",
    keywords: ["清晰", "方法", "行動力"],
    summary: "你擅長釐清目標、找到方法，讓壓力中的事情重新變得可掌握。",
    strength: "當局勢複雜時，你會抓住重點、整合資源並推動下一步，為自己與團隊建立方向。",
    reminder: "方向很重要，但不必每一次都立刻找到最佳答案；為感受與變化留一點空間。",
    practice: "把目前最困難的事改寫成一句可回答的問題，再列出一個今天能採取的行動。",
    cardLine: "你用清晰與行動，把複雜的壓力轉化成可以前進的方向。"
  },
  breeze: {
    id: "breeze",
    name: "海風型",
    englishName: "Sea Breeze",
    tagline: "換個角度，找到出口",
    core: "彈性",
    color: "#2e86a5",
    colorDark: "#17566f",
    colorSoft: "#def1f7",
    keywords: ["轉換", "適應", "新觀點"],
    summary: "你擅長因應變化、調整做法，從不同角度找到新的可能。",
    strength: "面對卡關或變動時，你不容易被單一路徑困住，能藉由轉換環境與思考方式恢復動能。",
    reminder: "保持彈性不代表總要配合所有變化；也可以先確認自己真正想守住的是什麼。",
    practice: "遇到卡關時問自己：如果不沿用原本的方法，還有哪兩種小規模嘗試？",
    cardLine: "你用彈性與轉換，讓變動成為重新找到可能性的契機。"
  },
  coral: {
    id: "coral",
    name: "珊瑚型",
    englishName: "Coral",
    tagline: "彼此連結，一起承接",
    core: "連結",
    color: "#c96557",
    colorDark: "#7f3c34",
    colorSoft: "#fae7e3",
    keywords: ["支持", "合作", "陪伴"],
    summary: "你擅長透過連結、合作與支持，和身邊的人一起面對壓力。",
    strength: "你能看見關係中的需要，主動搭起溝通與互助的橋，讓困難不再由一個人承擔。",
    reminder: "照顧關係時，也別忘了確認自己的界線；支持別人不必以耗盡自己為代價。",
    practice: "想一位你信任的人，用一句具體的話說明你現在需要哪一種協助。",
    cardLine: "你用連結與支持，讓彼此在壓力裡仍能一起站穩。"
  },
  wave: {
    id: "wave",
    name: "浪花型",
    englishName: "Wave",
    tagline: "理解感受，溫柔調節",
    core: "覺察",
    color: "#7467a5",
    colorDark: "#473d76",
    colorSoft: "#eee9f8",
    keywords: ["理解", "接納", "情緒覺察"],
    summary: "你擅長留意感受、理解情緒，從內在覺察中找回合適的步調。",
    strength: "你能辨認自己與他人的狀態，不急著壓下感受，而是透過理解與接納降低衝動。",
    reminder: "理解情緒之後，也可以選擇一個具體行動；覺察是起點，不必停在原地。",
    practice: "用三個詞寫下此刻的感受，再補上一句：我現在最需要的是……。",
    cardLine: "你用覺察與理解，為情緒留出被看見與安放的位置。"
  }
};

export const roleOrder = ["harbor", "lighthouse", "breeze", "coral", "wave"];

export const questions = [
  {
    id: "q1",
    number: 1,
    context: "壓力突然發生",
    prompt: "當臨時被交辦一件急件時，你通常會？",
    options: [
      { key: "A", roleId: "harbor", text: "先告訴自己別慌，把事情拆成步驟，按順序處理。" },
      { key: "B", roleId: "lighthouse", text: "先確認目標和期限，快速找出最有效率的做法。" },
      { key: "C", roleId: "breeze", text: "先調整原本的工作順序，邊做邊修正處理方式。" },
      { key: "D", roleId: "coral", text: "找可以討論的人，一起釐清分工和做法。" },
      { key: "E", roleId: "wave", text: "先留意自己當下的感受，提醒自己不用過度慌張。" }
    ]
  },
  {
    id: "q2",
    number: 2,
    context: "壓力累積之後",
    prompt: "如果最近工作讓你覺得很累，你最可能用哪種方式幫自己恢復元氣？",
    options: [
      { key: "A", roleId: "harbor", text: "暫時放下工作，找個安靜的空間休息，讓身心慢慢安定。" },
      { key: "B", roleId: "lighthouse", text: "整理手邊的事情，先完成最重要的一項，重新找回掌握感。" },
      { key: "C", roleId: "breeze", text: "換個環境走一走，轉換一下心情和生活節奏。" },
      { key: "D", roleId: "coral", text: "找信任的人聊聊，從陪伴與支持中補充力量。" },
      { key: "E", roleId: "wave", text: "整理自己的感受，釐清讓自己感到疲累的原因。" }
    ]
  },
  {
    id: "q3",
    number: 3,
    context: "支持身邊的人",
    prompt: "同仁看起來心情低落時，你比較可能怎麼做？",
    options: [
      { key: "A", roleId: "harbor", text: "安靜陪在他身邊，讓他知道有人在。" },
      { key: "B", roleId: "lighthouse", text: "陪他釐清問題，一起找方法或可用資源。" },
      { key: "C", roleId: "breeze", text: "視情況邀他走一走或換個環境，幫助轉換心情。" },
      { key: "D", roleId: "coral", text: "主動詢問他需要什麼，並提供適合的協助。" },
      { key: "E", roleId: "wave", text: "專心聽他說，先理解他的感受，不急著給建議。" }
    ]
  },
  {
    id: "q4",
    number: 4,
    context: "核心自我認定",
    prompt: "面對困難時，什麼最能幫助你繼續前進？",
    options: [
      { key: "A", roleId: "harbor", text: "讓自己冷靜下來，一步一步處理眼前的問題。" },
      { key: "B", roleId: "lighthouse", text: "找到清楚的方向和可行的方法。" },
      { key: "C", roleId: "breeze", text: "保持彈性，適時調整想法或做法。" },
      { key: "D", roleId: "coral", text: "有人願意陪伴，和我一起面對。" },
      { key: "E", roleId: "wave", text: "理解並接納自己當下的情緒。" }
    ]
  },
  {
    id: "q5",
    number: 5,
    context: "壓力正在互動中",
    prompt: "面對職場中的不同意見或衝突時，你通常會怎麼做？",
    options: [
      { key: "A", roleId: "harbor", text: "先緩和氣氛，等彼此冷靜後再慢慢溝通。" },
      { key: "B", roleId: "lighthouse", text: "回到事實與共同目標，找出可行的解決方案。" },
      { key: "C", roleId: "breeze", text: "換個角度思考，試著找出不同的可能性。" },
      { key: "D", roleId: "coral", text: "了解彼此的立場，讓雙方都有表達的機會。" },
      { key: "E", roleId: "wave", text: "留意自己和對方的情緒，避免在衝動下說出傷人的話。" }
    ]
  }
];

export const strengthCopy = {
  strong: (role) => `你的核心韌力明顯偏向${role.name}。`,
  clear: (role) => `你目前較常展現${role.name}的力量。`,
  slight: (role) => `綜合不同情境，你目前較偏向${role.name}。`
};
