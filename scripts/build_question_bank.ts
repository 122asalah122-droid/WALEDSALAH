import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type { Question, QuestionCategory } from '../src/types/game.ts';
import { buildQuestion, FactPair } from './banks/helpers.ts';
import { buildIslamicFacts } from './banks/islamic.ts';
import { buildEntertainmentFacts } from './banks/entertainment.ts';
import { buildGeneralFacts } from './banks/general.ts';

type SectionKey = 'general' | 'islamic' | 'entertainment';

const SECTION_TARGETS: Record<SectionKey, number> = {
  general: 100,
  islamic: 100,
  entertainment: 100,
};

function mapCatToSection(cat: QuestionCategory): SectionKey {
  switch (cat) {
    case 'islamic':
      return 'islamic';
    case 'sports':
    case 'cinema':
      return 'entertainment';
    case 'general':
    default:
      return 'general';
  }
}

function normalizeStem(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[«»"'؟?.,!()\-–—:؛]/g, ' ')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasFourDistinctOptions(opts: [string, string, string, string]): boolean {
  if (!Array.isArray(opts) || opts.length !== 4) return false;
  const seen = new Set<string>();
  for (const o of opts) {
    if (typeof o !== 'string') return false;
    const trimmed = o.trim().toLowerCase();
    if (!trimmed) return false;
    if (seen.has(trimmed)) return false;
    seen.add(trimmed);
  }
  return seen.size === 4;
}

function main() {
  const basePath = path.resolve('scripts/base_questions.json');
  const baseQuestions = JSON.parse(fs.readFileSync(basePath, 'utf8')) as Question[];

  const seenAr = new Set<string>();
  const seenEn = new Set<string>();
  const usedIds = new Set<string>();

  const sections: Record<SectionKey, Question[]> = {
    general: [],
    islamic: [],
    entertainment: [],
  };

  // 1. Ingest the base verified questions first
  for (const q of baseQuestions) {
    const nAr = normalizeStem(q.questionAr);
    const nEn = normalizeStem(q.questionEn);
    if (!nAr || !nEn) continue;
    if (seenAr.has(nAr) || seenEn.has(nEn)) continue;
    if (!hasFourDistinctOptions(q.optionsAr) || !hasFourDistinctOptions(q.optionsEn)) continue;

    seenAr.add(nAr);
    seenEn.add(nEn);
    usedIds.add(q.id);
    const sec = mapCatToSection(q.category);
    sections[sec].push({
      ...q,
      level: Math.max(1, Math.min(15, Math.round(q.level || 1))),
    });
  }

  const bankBuilders: Array<{ key: SectionKey; prefix: string; facts: FactPair[] }> = [
    { key: 'general', prefix: 'gen', facts: buildGeneralFacts() },
    { key: 'islamic', prefix: 'isl', facts: buildIslamicFacts() },
    { key: 'entertainment', prefix: 'ent', facts: buildEntertainmentFacts() },
  ];

  // Track raw generated vs accepted counts per section
  for (const { key, prefix, facts } of bankBuilders) {
    let seq = 1;
    let skippedDup = 0;
    let skippedInvalid = 0;
    for (let i = 0; i < facts.length; i++) {
      if (sections[key].length >= SECTION_TARGETS[key]) break;
      const fact = facts[i];
      const nAr = normalizeStem(fact.qAr);
      const nEn = normalizeStem(fact.qEn);
      if (!nAr || !nEn) {
        skippedInvalid++;
        continue;
      }
      if (seenAr.has(nAr) || seenEn.has(nEn)) {
        skippedDup++;
        continue;
      }
      let id = `q_${prefix}_${seq}`;
      while (usedIds.has(id)) {
        seq++;
        id = `q_${prefix}_${seq}`;
      }
      const q = buildQuestion(fact, id, seq + i * 13);
      if (!hasFourDistinctOptions(q.optionsAr) || !hasFourDistinctOptions(q.optionsEn)) {
        skippedInvalid++;
        continue;
      }
      seenAr.add(nAr);
      seenEn.add(nEn);
      usedIds.add(id);
      sections[key].push(q);
      seq++;
    }
    console.log(
      `Section [${key}]: rawFacts=${facts.length}, skippedDup=${skippedDup}, skippedInvalid=${skippedInvalid}, finalCount=${sections[key].length}`
    );
  }

  // Ensure every section hits its exact target count & healthy difficulty distribution
  let shortage = false;
  for (const key of Object.keys(sections) as SectionKey[]) {
    const arr = sections[key];
    const target = SECTION_TARGETS[key];
    if (arr.length !== target) {
      console.error(`ERROR: Section "${key}" has ${arr.length} questions instead of ${target}!`);
      shortage = true;
    }
    const levelCounts = new Map<number, number>();
    for (let l = 1; l <= 15; l++) levelCounts.set(l, 0);
    for (const q of arr) levelCounts.set(q.level, (levelCounts.get(q.level) || 0) + 1);
    const minPerLvl = target >= 500 ? 15 : 0;
    const missingLevels = minPerLvl > 0 ? [...levelCounts.entries()].filter(([, c]) => c < minPerLvl).map(([l]) => l) : [];
    if (missingLevels.length > 0) {
      let mlIdx = 0;
      for (let i = arr.length - 1; i >= 0 && mlIdx < missingLevels.length; i--) {
        if (!arr[i].id.startsWith('q_')) continue;
        const targetL = missingLevels[mlIdx];
        const curL = arr[i].level;
        if ((levelCounts.get(curL) || 0) > 25) {
          levelCounts.set(curL, (levelCounts.get(curL) || 0) - 1);
          arr[i].level = targetL;
          levelCounts.set(targetL, (levelCounts.get(targetL) || 0) + 1);
          if ((levelCounts.get(targetL) || 0) >= minPerLvl) mlIdx++;
        }
      }
    }
    const finalDist = Array.from({ length: 15 }, (_, idx) => levelCounts.get(idx + 1) || 0);
    console.log(`  Levels 1..15 for [${key}]: [${finalDist.join(', ')}]`);
  }

  if (shortage) {
    process.exit(1);
  }

  const allQuestions: Question[] = [
    ...sections.general,
    ...sections.islamic,
    ...sections.entertainment,
  ];

  // Final global invariant assertions
  const checkIds = new Set<string>();
  const checkAr = new Set<string>();
  const checkEn = new Set<string>();
  for (const q of allQuestions) {
    if (checkIds.has(q.id)) throw new Error(`Duplicate ID ${q.id}`);
    checkIds.add(q.id);
    const nAr = normalizeStem(q.questionAr);
    const nEn = normalizeStem(q.questionEn);
    if (checkAr.has(nAr)) throw new Error(`Duplicate Arabic stem: ${q.questionAr}`);
    if (checkEn.has(nEn)) throw new Error(`Duplicate English stem: ${q.questionEn}`);
    checkAr.add(nAr);
    checkEn.add(nEn);
    if (!hasFourDistinctOptions(q.optionsAr)) throw new Error(`Bad Ar options in ${q.id}`);
    if (!hasFourDistinctOptions(q.optionsEn)) throw new Error(`Bad En options in ${q.id}`);
    if (q.correctIndex < 0 || q.correctIndex > 3) throw new Error(`Bad correctIndex in ${q.id}`);
  }

  const chunkSize = 100;
  const chunkDefs: string[] = [];
  const chunkNames: string[] = [];
  for (let i = 0; i < allQuestions.length; i += chunkSize) {
    const idx = Math.floor(i / chunkSize);
    const name = `Q_CHUNK_${idx}`;
    chunkNames.push(`...${name}`);
    const slice = allQuestions.slice(i, i + chunkSize);
    chunkDefs.push(`const ${name}: Question[] = ${JSON.stringify(slice, null, 2)};`);
  }

  const bankSignature = crypto
    .createHash('sha1')
    .update(JSON.stringify(allQuestions.map((q) => `${q.id}|${q.questionAr}|${q.level}`)))
    .digest('hex')
    .slice(0, 12);

  const output = `import type { Question } from '../types/game.ts';

// 300 verified bilingual unique questions:
// (general: 100 comprehensive general knowledge questions,
//  islamic: 100 comprehensive Prophets/Quran/Wives questions,
//  cinema [Egyptian & Turkish movies & TV series]: 100)
export const QUESTIONS_BANK_SIGNATURE = '${bankSignature}';

${chunkDefs.join('\n\n')}

export const QUESTIONS_BANK: Question[] = [
  ${chunkNames.join(',\n  ')}
];

export const getRandomQuestionByLevel = (level: number, excludeIds: string[] = []): Question => {
  const exactPool = QUESTIONS_BANK.filter((q) => q.level === level && !excludeIds.includes(q.id));
  if (exactPool.length > 0) {
    return exactPool[Math.floor(Math.random() * exactPool.length)];
  }
  const nearPool = QUESTIONS_BANK.filter((q) => Math.abs(q.level - level) <= 2 && !excludeIds.includes(q.id));
  if (nearPool.length > 0) {
    return nearPool[Math.floor(Math.random() * nearPool.length)];
  }
  const remainingPool = QUESTIONS_BANK.filter((q) => !excludeIds.includes(q.id));
  if (remainingPool.length === 0) return QUESTIONS_BANK[0];
  return remainingPool[Math.floor(Math.random() * remainingPool.length)];
};

export const getQuestionsCount = (): number => QUESTIONS_BANK.length;
`;

  const targetPath = path.resolve('src/data/questions.ts');
  fs.writeFileSync(targetPath, output, 'utf8');
  console.log(`SUCCESS: Wrote ${allQuestions.length} unique questions to src/data/questions.ts!`);
}

main();
