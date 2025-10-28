import { Strategy } from 'passport-github2';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('oauth.github.clientId'),
      clientSecret: configService.get<string>('oauth.github.clientSecret'),
      callbackURL: configService.get<string>('oauth.github.callbackUrl'),
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<any> {
    const { id, username, displayName, emails, photos } = profile;
    const user = {
      id,
      email: emails?.[0]?.value || `${username}@github.com`,
      firstName: displayName?.split(' ')[0] || username,
      lastName: displayName?.split(' ').slice(1).join(' ') || '',
      profilePhoto: photos?.[0]?.value,
      accessToken,
      refreshToken,
    };
    done(null, user);
  }
}
