import consentDocuments from '@/data/consentDocuments.json';
import type { ConsentDocument, ConsentRecord, ConsentType } from '@/types/consent';

const STORAGE_KEY = 'zona-pt-consents-v1';

function readAll(): Record<string, ConsentRecord[]> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Record<string, ConsentRecord[]>;
  } catch {
    return {};
  }
}

function writeAll(records: Record<string, ConsentRecord[]>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  window.dispatchEvent(new Event('zona-consent-change'));
}

export const ConsentManager = {
  documents: consentDocuments as ConsentDocument[],

  getDocument(type: ConsentType) {
    return this.documents.find((document) => document.type === type);
  },

  getRecords(userId: string) {
    return readAll()[userId] ?? [];
  },

  getLatest(userId: string, type: ConsentType) {
    return this.getRecords(userId)
      .filter((record) => record.consentType === type)
      .sort((a, b) => b.signedAt.localeCompare(a.signedAt))[0];
  },

  getCurrent(userId: string, type: ConsentType) {
    const document = this.getDocument(type);
    return this.getRecords(userId).find(
      (record) => record.consentType === type && record.version === document?.version && !record.revokedAt,
    );
  },

  isAccepted(userId: string, type: ConsentType) {
    return this.getCurrent(userId, type)?.accepted === true;
  },

  save(userId: string, record: ConsentRecord) {
    const all = readAll();
    const records = all[userId] ?? [];
    all[userId] = [
      ...records.filter(
        (item) => !(item.consentType === record.consentType && item.version === record.version),
      ),
      record,
    ];
    writeAll(all);
  },

  revoke(userId: string, type: ConsentType) {
    const all = readAll();
    all[userId] = (all[userId] ?? []).map((record) =>
      record.consentType === type && !record.revokedAt
        ? { ...record, accepted: false, revokedAt: new Date().toISOString() }
        : record,
    );
    writeAll(all);
  },

  missing(userId: string, dryNeedlingAssigned: boolean) {
    const required: ConsentType[] = ['consent-to-treat'];
    if (dryNeedlingAssigned) required.push('dry-needling');
    return required.filter((type) => !this.isAccepted(userId, type));
  },
};
