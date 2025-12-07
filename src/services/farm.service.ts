import { prisma } from "../lib/prisma";

export const createFarm = async (data: {
  name: string;
  address?: string;
  state?: string;
  city?: string;
  longitude?: number;
  latitude?: number;
  userId: string;
}) => {
  return prisma.farm.create({ data });
};

export const findFarmsByUser = async (userId: string) => {
  return prisma.farm.findMany({ where: { userId } });
};

export const findFarmById = async (id: string) => {
  return prisma.farm.findUnique({ where: { id } });
};

export const updateFarmById = async (
  id: string,
  data: Partial<{
    name: string;
    address?: string;
    state?: string;
    city?: string;
    longitude?: number;
    latitude?: number;
  }>
) => {
  return prisma.farm.update({ where: { id }, data });
};

export const deleteFarmById = async (id: string) => {
  return prisma.farm.delete({ where: { id } });
};
