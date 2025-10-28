import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);

export const Public = () => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    Reflect.defineMetadata('isPublic', true, target, propertyKey);
  };
};

export const Roles = (...roles: string[]) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    Reflect.defineMetadata('roles', roles, target, propertyKey);
  };
};

export const RequireMFA = () => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    Reflect.defineMetadata('requireMFA', true, target, propertyKey);
  };
};

export const RateLimit = (limit: number, windowMs: number) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    Reflect.defineMetadata('rateLimit', { limit, windowMs }, target, propertyKey);
  };
};

export const Cache = (ttl: number) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    Reflect.defineMetadata('cache', { ttl }, target, propertyKey);
  };
};

export const Validate = (schema: any) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    Reflect.defineMetadata('validation', schema, target, propertyKey);
  };
};

export const Audit = (action: string) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    Reflect.defineMetadata('audit', { action }, target, propertyKey);
  };
};
