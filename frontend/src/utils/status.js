// src/utils/status.js

const STATUS_CLASSES = {
  // Forfaits
  CODE_SEUL: '', // Bleu 
  CODE_CONDUITE: 'ok', // Vert
  A_L_HEURE: 'wa', // Orange

  // ✅ OK (vert)
  CONFIRMEE: 'ok',
  REUSSI: 'ok',
  DISPONIBLE: 'ok',
  PRET_EXAMEN: 'ok',

  // ⚠️ Attention (orange)
  PLANIFIEE: '',
  EN_COURS: 'wa',
  EN_ATTENTE: 'wa',
  ENTRETIEN: 'wa',

  // ❌ Erreur (rouge)
  REFUSEE: 'ko',
  ECHOUE: 'ko',
  PANNE: 'ko',
  ANNULEE: 'ko',

  // Neutre
  TERMINEE: '',
};

export function getStatusClass(status) {
  if (!status) return '';
  return STATUS_CLASSES[status] || '';
}

export function formatStatusLabel(status) {
  if (!status) return '—';
  return status.replace(/_/g, ' ');
}