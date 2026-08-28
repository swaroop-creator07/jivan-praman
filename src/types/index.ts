export enum Role {
  PENSIONER = 'PENSIONER',
  FAMILY = 'FAMILY',
  PSA = 'PSA', // Pension Sanctioning Authority
  PDA = 'PDA', // Pension Disbursing Agency
  BANK = 'BANK',
  CONCIERGE = 'CONCIERGE',
  GOV_ADMIN = 'GOV_ADMIN',
  AUDITOR = 'AUDITOR'
}

export enum PensionState {
  CREATED = 'CREATED',
  ACTIVE = 'ACTIVE',
  VERIFICATION_DUE = 'VERIFICATION_DUE',
  VERIFICATION_IN_PROGRESS = 'VERIFICATION_IN_PROGRESS',
  VERIFIED = 'VERIFIED',
  ENTITLEMENT_VALIDATED = 'ENTITLEMENT_VALIDATED',
  PAYMENT_READY = 'PAYMENT_READY',
  PAYMENT_AUTHORIZED = 'PAYMENT_AUTHORIZED',
  PAYMENT_SENT = 'PAYMENT_SENT',
  BANK_RECEIVED = 'BANK_RECEIVED',
  CREDITED = 'CREDITED',
  RECONCILIATION_PENDING = 'RECONCILIATION_PENDING',
  RECONCILED = 'RECONCILED',
  PENSION_SAFE = 'PENSION_SAFE',
  
  // Failure States
  VERIFICATION_FAILED = 'VERIFICATION_FAILED',
  RECORD_MISMATCH = 'RECORD_MISMATCH',
  PAYMENT_BLOCKED = 'PAYMENT_BLOCKED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  BANK_EXCEPTION = 'BANK_EXCEPTION',
  PROCESSING_DELAY = 'PROCESSING_DELAY',
  SYSTEM_EXCEPTION = 'SYSTEM_EXCEPTION'
}

export enum HealthStatus {
  GREEN = 'GREEN',
  AMBER = 'AMBER',
  RED = 'RED',
  GREY = 'GREY'
}

export interface User {
  id: string;
  name: string;
  role: Role;
  avatarUrl?: string;
}

export interface Exception {
  id: string;
  type: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  pensionCaseId: string;
  detectedAt: string;
  owner: Role;
  responsibleOrganization: string;
  slaHours: number;
  recommendedAction: string;
  status: 'DETECTED' | 'CLASSIFIED' | 'OWNER_ASSIGNED' | 'NOTIFIED' | 'REMEDIATION' | 'RESOLVED' | 'ESCALATED';
}

export interface PensionCase {
  id: string;
  pensionerId: string;
  pensionerName: string;
  ppoReference: string;
  pensionType: string;
  pensionAuthority: string;
  disbursingAgency: string;
  bankName: string;
  bankAccountMasked: string;
  entitlement: number;
  currentState: PensionState;
  health: HealthStatus;
  currentOwner: Role;
  nextPaymentDate: string;
  lastVerificationDate: string;
  exceptions: Exception[];
}

export interface SystemEvent {
  eventId: string;
  eventType: string;
  timestamp: string;
  actor: Role | string;
  entityId: string;
  payload: any;
}
