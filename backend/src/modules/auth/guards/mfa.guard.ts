import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { MfaService } from '../services/mfa.service';

@Injectable()
export class MfaGuard implements CanActivate {
  constructor(private readonly mfaService: MfaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const mfaToken = request.headers['x-mfa-token'];

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // If MFA is not enabled for the user, allow access
    if (!user.mfaEnabled) {
      return true;
    }

    // If MFA is enabled but no token provided, deny access
    if (!mfaToken) {
      throw new UnauthorizedException('MFA token required');
    }

    // Verify MFA token
    const isValid = await this.mfaService.verifyMfaToken(user.sub, mfaToken);
    
    if (!isValid) {
      throw new UnauthorizedException('Invalid MFA token');
    }

    return true;
  }
}
