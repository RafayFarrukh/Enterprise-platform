import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class RbacService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all roles for a user or agency
   */
  async getRoles(userId: string, accountType: 'user' | 'agency'): Promise<string[]> {
    const roles = await this.getRolesWithDetails(userId, accountType);
    return roles.map(role => role.role.name);
  }

  /**
   * Get roles with details for a user or agency
   */
  async getRolesWithDetails(userId: string, accountType: 'user' | 'agency') {
    if (accountType === 'user') {
      return this.prisma.userRole.findMany({
        where: {
          userId,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });
    } else {
      return this.prisma.agencyRole.findMany({
        where: {
          agencyId: userId,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });
    }
  }

  /**
   * Get all permissions for a user or agency (through their roles)
   */
  async getPermissions(userId: string, accountType: 'user' | 'agency'): Promise<string[]> {
    const roles = await this.getRolesWithDetails(userId, accountType);
    const permissionsSet = new Set<string>();

    for (const userRole of roles) {
      for (const rolePermission of userRole.role.permissions) {
        permissionsSet.add(rolePermission.permission.name);
      }
    }

    return Array.from(permissionsSet);
  }

  /**
   * Check if user/agency has a specific permission
   */
  async hasPermission(
    userId: string,
    accountType: 'user' | 'agency',
    permission: string,
  ): Promise<boolean> {
    const permissions = await this.getPermissions(userId, accountType);
    return permissions.includes(permission);
  }

  /**
   * Check if user/agency has any of the specified permissions
   */
  async hasAnyPermission(
    userId: string,
    accountType: 'user' | 'agency',
    permissions: string[],
  ): Promise<boolean> {
    const userPermissions = await this.getPermissions(userId, accountType);
    return permissions.some(permission => userPermissions.includes(permission));
  }

  /**
   * Check if user/agency has all of the specified permissions
   */
  async hasAllPermissions(
    userId: string,
    accountType: 'user' | 'agency',
    permissions: string[],
  ): Promise<boolean> {
    const userPermissions = await this.getPermissions(userId, accountType);
    return permissions.every(permission => userPermissions.includes(permission));
  }

  /**
   * Check if user/agency has a specific role
   */
  async hasRole(
    userId: string,
    accountType: 'user' | 'agency',
    roleName: string,
  ): Promise<boolean> {
    const roles = await this.getRoles(userId, accountType);
    return roles.includes(roleName);
  }

  /**
   * Assign a role to a user or agency
   */
  async assignRole(
    userId: string,
    accountType: 'user' | 'agency',
    roleName: string,
    assignedBy?: string,
    expiresAt?: Date,
  ): Promise<void> {
    const role = await this.prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      throw new NotFoundException(`Role '${roleName}' not found`);
    }

    if (accountType === 'user') {
      await this.prisma.userRole.upsert({
        where: {
          userId_roleId: {
            userId,
            roleId: role.id,
          },
        },
        update: {
          assignedBy,
          expiresAt,
        },
        create: {
          userId,
          roleId: role.id,
          assignedBy,
          expiresAt,
        },
      });
    } else {
      await this.prisma.agencyRole.upsert({
        where: {
          agencyId_roleId: {
            agencyId: userId,
            roleId: role.id,
          },
        },
        update: {
          assignedBy,
          expiresAt,
        },
        create: {
          agencyId: userId,
          roleId: role.id,
          assignedBy,
          expiresAt,
        },
      });
    }
  }

  /**
   * Remove a role from a user or agency
   */
  async removeRole(
    userId: string,
    accountType: 'user' | 'agency',
    roleName: string,
  ): Promise<void> {
    const role = await this.prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      throw new NotFoundException(`Role '${roleName}' not found`);
    }

    if (accountType === 'user') {
      await this.prisma.userRole.deleteMany({
        where: {
          userId,
          roleId: role.id,
        },
      });
    } else {
      await this.prisma.agencyRole.deleteMany({
        where: {
          agencyId: userId,
          roleId: role.id,
        },
      });
    }
  }

  /**
   * Create a new role
   */
  async createRole(name: string, description?: string, isSystemRole: boolean = false) {
    return this.prisma.role.create({
      data: {
        name,
        description,
        isSystemRole,
      },
    });
  }

  /**
   * Create a new permission
   */
  async createPermission(name: string, resource: string, action: string, description?: string) {
    return this.prisma.permission.create({
      data: {
        name,
        resource,
        action,
        description,
      },
    });
  }

  /**
   * Assign a permission to a role
   */
  async assignPermissionToRole(roleName: string, permissionName: string) {
    const role = await this.prisma.role.findUnique({
      where: { name: roleName },
    });

    const permission = await this.prisma.permission.findUnique({
      where: { name: permissionName },
    });

    if (!role) {
      throw new NotFoundException(`Role '${roleName}' not found`);
    }

    if (!permission) {
      throw new NotFoundException(`Permission '${permissionName}' not found`);
    }

    return this.prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: role.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: role.id,
        permissionId: permission.id,
      },
    });
  }
}

