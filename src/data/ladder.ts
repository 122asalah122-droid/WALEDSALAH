import { LadderTier } from '../types/game';

export const LADDER_AMOUNTS: number[] = [
  // Stages 1 - 10
  100, 200, 300, 400, 500, 600, 700, 800, 900, 1000,
  // Stages 11 - 20
  1250, 1500, 1750, 2000, 2500, 3000, 3500, 4000, 4500, 5000,
  // Stages 21 - 30
  6000, 7000, 8000, 9000, 10000, 11500, 13000, 14500, 16000, 18000,
  // Stages 31 - 40
  20000, 22500, 25000, 27500, 30000, 33000, 36000, 39000, 42000, 45000,
  // Stages 41 - 50
  50000, 55000, 60000, 65000, 70000, 75000, 80000, 85000, 90000, 100000,
  // Stages 51 - 60
  110000, 120000, 130000, 140000, 150000, 160000, 170000, 180000, 190000, 200000,
  // Stages 61 - 70
  215000, 230000, 245000, 260000, 275000, 290000, 305000, 320000, 335000, 350000,
  // Stages 71 - 80
  370000, 390000, 410000, 430000, 450000, 470000, 490000, 510000, 530000, 550000,
  // Stages 81 - 90
  575000, 600000, 625000, 650000, 675000, 700000, 725000, 750000, 775000, 800000,
  // Stages 91 - 100
  820000, 840000, 860000, 880000, 900000, 920000, 940000, 960000, 980000, 1000000,
];

export const MAX_LADDER_STEP = LADDER_AMOUNTS.length; // 100

export const LADDER: LadderTier[] = LADDER_AMOUNTS.map((amount, idx) => {
  const step = idx + 1;
  return {
    step,
    amount,
    isMilestone: step % 10 === 0,
    label: amount.toLocaleString('en-US'),
  };
});

export const getGuaranteedSafetyAmount = (currentLevel: number): number => {
  let safe = 0;
  for (const tier of LADDER) {
    if (tier.isMilestone && tier.step < currentLevel) {
      safe = tier.amount;
    }
  }
  return safe;
};

export const formatCurrency = (amount: number, lang: 'ar' | 'en'): string => {
  const formatted = amount.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US');
  return lang === 'ar' ? `${formatted} ريال` : `$${formatted}`;
};
