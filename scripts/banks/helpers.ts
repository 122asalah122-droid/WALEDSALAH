import type { Question, QuestionCategory } from '../../src/types/game.ts';

export interface FactPair {
  idHint?: string;
  cat: QuestionCategory;
  topic?: string;
  lvl: number;
  qAr: string;
  qEn: string;
  correctAr: string;
  correctEn: string;
  wrongAr: [string, string, string];
  wrongEn: [string, string, string];
  expAr: string;
  expEn: string;
}

export function deterministicPickWrongs(
  correctIdxInPool: number,
  poolAr: string[],
  poolEn: string[],
  seed: number
): { wrongAr: [string, string, string]; wrongEn: [string, string, string] } {
  const n = poolAr.length;
  const chosenIndices: number[] = [];
  const usedStrings = new Set<string>([poolAr[correctIdxInPool].trim().toLowerCase()]);
  let step = 1;
  let guard = 0;
  while (chosenIndices.length < 3 && guard < n * 4) {
    const candidate = (correctIdxInPool + step + ((seed * (guard + 1)) % Math.max(2, n - 1))) % n;
    const candStr = poolAr[candidate].trim().toLowerCase();
    if (candidate !== correctIdxInPool && !chosenIndices.includes(candidate) && !usedStrings.has(candStr)) {
      chosenIndices.push(candidate);
      usedStrings.add(candStr);
    }
    step += 3;
    guard++;
  }
  for (let i = 0; i < n && chosenIndices.length < 3; i++) {
    const s = poolAr[i].trim().toLowerCase();
    if (i !== correctIdxInPool && !usedStrings.has(s)) {
      chosenIndices.push(i);
      usedStrings.add(s);
    }
  }
  return {
    wrongAr: [poolAr[chosenIndices[0]], poolAr[chosenIndices[1]], poolAr[chosenIndices[2]]],
    wrongEn: [poolEn[chosenIndices[0]], poolEn[chosenIndices[1]], poolEn[chosenIndices[2]]],
  };
}

export function buildQuestion(fact: FactPair, id: string, seedIndex: number): Question {
  const pairs: Array<{ ar: string; en: string; ok: boolean }> = [
    { ar: fact.correctAr, en: fact.correctEn, ok: true },
    { ar: fact.wrongAr[0], en: fact.wrongEn[0], ok: false },
    { ar: fact.wrongAr[1], en: fact.wrongEn[1], ok: false },
    { ar: fact.wrongAr[2], en: fact.wrongEn[2], ok: false },
  ];

  // Deterministic permutation across all 24 permutations based on seedIndex
  const targetSlot = (seedIndex * 7 + fact.qAr.length * 3 + fact.lvl) % 4;
  const wrongs = pairs.slice(1);
  // Rotate wrongs slightly
  const rot = seedIndex % 3;
  const rWrongs = [wrongs[rot], wrongs[(rot + 1) % 3], wrongs[(rot + 2) % 3]];
  const arranged: typeof pairs = [];
  let wIdx = 0;
  for (let i = 0; i < 4; i++) {
    if (i === targetSlot) {
      arranged.push(pairs[0]);
    } else {
      arranged.push(rWrongs[wIdx++]);
    }
  }

  return {
    id,
    level: Math.max(1, Math.min(15, fact.lvl)),
    category: fact.cat,
    ...(fact.topic ? { topic: fact.topic } : {}),
    questionAr: fact.qAr,
    questionEn: fact.qEn,
    optionsAr: [arranged[0].ar, arranged[1].ar, arranged[2].ar, arranged[3].ar],
    optionsEn: [arranged[0].en, arranged[1].en, arranged[2].en, arranged[3].en],
    correctIndex: targetSlot as 0 | 1 | 2 | 3,
    explanationAr: fact.expAr,
    explanationEn: fact.expEn,
  };
}
