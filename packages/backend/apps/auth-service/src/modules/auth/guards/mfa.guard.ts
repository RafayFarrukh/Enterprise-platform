import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class MfaGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Check if user has MFA enabled
    const userRecord = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { mfaEnabled: true },
    });

    if (!userRecord?.mfaEnabled) {
      return true; // MFA not enabled, allow access
    }

    // Check if MFA is verified in the current session
    const mfaVerified = request.session?.mfaVerified;
    if (!mfaVerified) {
      throw new ForbiddenException('MFA verification required');
    }

    return true;
  }
}
