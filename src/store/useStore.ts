import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DlcStatus = "Submitted" | "Repository Uploaded" | "Under PDA Verification" | "Approved" | "Rejected";
export type PaymentStatus = "Credited" | "Pending" | "Held – Life Certificate Due" | "Failed";

export interface DlcRecord {
  pramaanId: string;
  generatedOn: string;
  status: DlcStatus;
  rejectionReason: string | null;
  validUntil: string | null;
}

export interface PaymentRecord {
  id: string;
  month: string;
  year: string;
  amount: number;
  status: PaymentStatus;
  creditedOn: string | null;
}

export interface Pensioner {
  name: string;
  photoUrl: string;
  dateOfBirth: string;
  pramaanId: string | null;
  aadhaarMasked: string;
  ppoNumber: string;
  pensionType: string;
  pda: { name: string; type: string; accountMasked: string };
  mobileNumber: string;
  dlcHistory: DlcRecord[];
  pensionPayments: PaymentRecord[];
  nextDlcDueDate: string;
}

const mockPensioner: Pensioner = {
  name: 'Ramesh Kumar',
  photoUrl: 'https://i.pravatar.cc/150?u=ramesh',
  dateOfBirth: '1945-05-12',
  pramaanId: '9876543210',
  aadhaarMasked: 'XXXX XXXX 1234',
  ppoNumber: 'PPO-1234567-OLD',
  pensionType: 'Central Govt',
  pda: { name: 'State Bank of India', type: 'Bank', accountMasked: 'XXXXXX5678' },
  mobileNumber: 'XXXXX X9876',
  dlcHistory: [
    {
      pramaanId: '1234567890',
      generatedOn: '2025-06-10',
      status: 'Approved',
      rejectionReason: null,
      validUntil: '2026-06-30',
    },
    {
      pramaanId: '9876543210',
      generatedOn: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
      status: 'Rejected',
      rejectionReason: 'The PPO number on your certificate doesn\'t match your bank\'s records',
      validUntil: null,
    }
  ],
  pensionPayments: [
    { id: 'TXN108', month: 'August', year: '2026', amount: 31450, status: 'Pending', creditedOn: null },
    { id: 'TXN107', month: 'July', year: '2026', amount: 31450, status: 'Held – Life Certificate Due', creditedOn: null },
    { id: 'TXN106', month: 'June', year: '2026', amount: 31450, status: 'Credited', creditedOn: '2026-06-28' },
    { id: 'TXN105', month: 'May', year: '2026', amount: 31450, status: 'Credited', creditedOn: '2026-05-28' },
  ],
  nextDlcDueDate: '2026-06-30',
};

interface DlcWizardState {
  step: number;
  ppoNumber: string;
  accountMasked: string;
  biometricType: 'fingerprint' | 'iris' | 'face' | null;
  captureAttempts: number;
}

interface StoreState {
  pensioner: Pensioner;
  dlcWizard: DlcWizardState;
  getUser: () => { id: string; name: string };
  getCaseForPensioner: (id: string) => any; 
  updateDlcWizard: (updates: Partial<DlcWizardState>) => void;
  submitDlc: () => void;
  resetDlcWizard: () => void;
  recordDlc: (rec: { pramaanId: string; ppoNumber: string; accountMasked: string; name: string }) => void;
  cases: any[];
  resolveBankException: (id: string) => void;
  approveVerification: (id: string) => void;
  rejectVerification: (id: string, reason: string) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      pensioner: mockPensioner,
      dlcWizard: {
        step: 1,
        ppoNumber: mockPensioner.ppoNumber,
        accountMasked: mockPensioner.pda.accountMasked,
        biometricType: null,
        captureAttempts: 0,
      },
      getUser: () => ({ id: '1', name: get().pensioner.name }),
      getCaseForPensioner: () => null,
      updateDlcWizard: (updates) => set((state) => ({ dlcWizard: { ...state.dlcWizard, ...updates } })),
      submitDlc: () => set((state) => {
        const newDlc: DlcRecord = {
          pramaanId: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
          generatedOn: new Date().toISOString().split('T')[0],
          status: 'Submitted',
          rejectionReason: null,
          validUntil: null,
        };
        return {
          pensioner: {
            ...state.pensioner,
            ppoNumber: state.dlcWizard.ppoNumber,
            dlcHistory: [newDlc, ...state.pensioner.dlcHistory]
          },
          dlcWizard: { ...state.dlcWizard, step: 5 }
        };
      }),
      resetDlcWizard: () => set((state) => ({
        dlcWizard: {
          step: 1,
          ppoNumber: state.pensioner.ppoNumber,
          accountMasked: state.pensioner.pda.accountMasked,
          biometricType: null,
          captureAttempts: 0,
        }
      })),
      recordDlc: (rec) => set((state) => {
        const newDlc: DlcRecord = {
          pramaanId: rec.pramaanId,
          generatedOn: new Date().toISOString().split('T')[0],
          status: 'Submitted',
          rejectionReason: null,
          validUntil: null,
        };
        return {
          pensioner: {
            ...state.pensioner,
            name: rec.name || state.pensioner.name,
            ppoNumber: rec.ppoNumber || state.pensioner.ppoNumber,
            dlcHistory: [newDlc, ...state.pensioner.dlcHistory]
          }
        };
      }),
      cases: [],
      resolveBankException: () => {},
      approveVerification: () => {},
      rejectVerification: () => {},
    }),
    { name: 'updp-pensioner-v4' }
  )
);
