// Your JwtStrategy code - This file is correct.

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }
  // The default strategy name is derived from the Strategy type, which is 'jwt'.
  // However, it's best practice to explicitly pass 'jwt' as the second argument
  // to PassportStrategy for clarity: JwtStrategy extends PassportStrategy(Strategy, 'jwt')
  
  async validate(payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}