import { UserRole } from '@prisma/client';

export class User {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: UserRole;
  isVerified: boolean;
  mfaSecret?: string;
  mfaEnabled: boolean;
  avatar?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPayload {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
  isVerified: boolean;
  mfaEnabled: boolean;
}
