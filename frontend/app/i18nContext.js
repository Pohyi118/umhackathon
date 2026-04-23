'use client';
import { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    dashboard: 'Overview Dashboard',
    runPayroll: 'Run Payroll',
    nextPayout: 'Next Payout',
    headcount: 'Headcount & Location',
    teamEnergy: 'Team Energy',
    attendance: 'Attendance Heatmap',
    pipeline: 'Workforce Pipeline',
    costProductivity: 'Cost-Productivity Matrix',
    predictiveSim: 'Predictive Simulation',
    simulate: 'Simulate Impact'
  },
  bm: {
    dashboard: 'Papan Pemuka',
    runPayroll: 'Jalankan Penggajian',
    nextPayout: 'Bayaran Seterusnya',
    headcount: 'Bilangan Pekerja & Lokasi',
    teamEnergy: 'Tenaga Pasukan',
    attendance: 'Peta Haba Kehadiran',
    pipeline: 'Saluran Tenaga Kerja',
    costProductivity: 'Matriks Kos-Produktiviti',
    predictiveSim: 'Simulasi Ramalan',
    simulate: 'Simulasi Kesan'
  },
  zh: {
    dashboard: '概览仪表板',
    runPayroll: '运行工资单',
    nextPayout: '下次付款',
    headcount: '员工人数和位置',
    teamEnergy: '团队活力',
    attendance: '出勤热图',
    pipeline: '劳动力管道',
    costProductivity: '成本效益矩阵',
    predictiveSim: '预测模拟',
    simulate: '模拟影响'
  }
};

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [lang, setLang] = useState('en');

  const t = (key) => {
    return translations[lang][key] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
