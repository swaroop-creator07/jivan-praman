import { PensionCase, PensionState, HealthStatus, Role, User } from '../types';

export const mockUsers: Record<Role, User> = {
  [Role.PENSIONER]: { id: 'u1', name: 'Ramesh Kumar', role: Role.PENSIONER },
  [Role.FAMILY]: { id: 'u2', name: 'Priya Sharma', role: Role.FAMILY },
  [Role.PDA]: { id: 'u3', name: 'State Bank PDA Agent', role: Role.PDA },
  [Role.PSA]: { id: 'u4', name: 'CG Authority', role: Role.PSA },
  [Role.BANK]: { id: 'u5', name: 'SBI CPPC Operator', role: Role.BANK },
  [Role.GOV_ADMIN]: { id: 'u6', name: 'National Ops Admin', role: Role.GOV_ADMIN },
  [Role.CONCIERGE]: { id: 'u7', name: 'UPDP Support', role: Role.CONCIERGE },
  [Role.AUDITOR]: { id: 'u8', name: 'Oversight Auditor', role: Role.AUDITOR }
};

export const initialCases: PensionCase[] = [
  {
    id: 'pc1',
    pensionerId: 'u1',
    pensionerName: 'Ramesh Kumar',
    ppoReference: 'CG/DEL/2018/004281',
    pensionType: 'Central Civil Pension',
    pensionAuthority: 'Central Government',
    disbursingAgency: 'State Bank of India',
    bankName: 'State Bank of India',
    bankAccountMasked: 'XXXXXX4821',
    entitlement: 31450,
    currentState: PensionState.ACTIVE,
    health: HealthStatus.GREEN,
    currentOwner: Role.PENSIONER,
    nextPaymentDate: '2026-08-28',
    lastVerificationDate: '2025-11-15',
    exceptions: []
  },
  {
    id: 'pc2',
    pensionerId: 'p2',
    pensionerName: 'Aarti Devi',
    ppoReference: 'CG/MUM/2015/001122',
    pensionType: 'Family Pension',
    pensionAuthority: 'Railway Board',
    disbursingAgency: 'Punjab National Bank',
    bankName: 'PNB',
    bankAccountMasked: 'XXXXXX9912',
    entitlement: 18200,
    currentState: PensionState.VERIFICATION_DUE,
    health: HealthStatus.AMBER,
    currentOwner: Role.PENSIONER,
    nextPaymentDate: '2026-08-28',
    lastVerificationDate: '2024-11-01',
    exceptions: []
  },
  {
    id: 'pc3',
    pensionerId: 'p3',
    pensionerName: 'Suresh Menon',
    ppoReference: 'DEF/CHN/2010/881923',
    pensionType: 'Defence Pension',
    pensionAuthority: 'PCDA Prayagraj',
    disbursingAgency: 'HDFC Bank',
    bankName: 'HDFC Bank',
    bankAccountMasked: 'XXXXXX3344',
    entitlement: 45000,
    currentState: PensionState.BANK_EXCEPTION,
    health: HealthStatus.RED,
    currentOwner: Role.BANK,
    nextPaymentDate: '2026-07-28',
    lastVerificationDate: '2025-10-20',
    exceptions: [
      {
        id: 'ex1',
        type: 'ACCOUNT_VALIDATION_FAILED',
        severity: 'HIGH',
        pensionCaseId: 'pc3',
        detectedAt: '2026-07-25T10:00:00Z',
        owner: Role.BANK,
        responsibleOrganization: 'HDFC Bank CPPC',
        slaHours: 24,
        recommendedAction: 'Verify IFSC code and account activity status',
        status: 'ESCALATED'
      }
    ]
  },
  {
    id: 'pc4',
    pensionerId: 'p4',
    pensionerName: 'Kamala Rao',
    ppoReference: 'STATE/AP/2020/554433',
    pensionType: 'State Govt Pension',
    pensionAuthority: 'Govt of AP',
    disbursingAgency: 'Union Bank',
    bankName: 'Union Bank of India',
    bankAccountMasked: 'XXXXXX1122',
    entitlement: 26500,
    currentState: PensionState.PAYMENT_AUTHORIZED,
    health: HealthStatus.GREEN,
    currentOwner: Role.BANK,
    nextPaymentDate: '2026-08-28',
    lastVerificationDate: '2025-11-05',
    exceptions: []
  }
];
