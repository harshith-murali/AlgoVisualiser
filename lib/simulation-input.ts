import { z } from "zod";

const common = {
  moduleType: z.enum(["cpu", "page", "disk", "deadlock"]),
  algorithm: z.string().trim().min(1).max(80),
  inputData: z.record(z.unknown()).default({}),
};

export const projectInput = z.object({
  ...common,
  title: z.string().trim().min(1).max(120).default("Untitled simulation"),
});

export const runInput = z.object({
  ...common,
  resultData: z.record(z.unknown()).default({}),
});

export const presetInput = z.object({
  moduleType: common.moduleType,
  algorithm: common.algorithm,
  name: z.string().trim().min(1).max(120).default("Untitled preset"),
  presetData: z.record(z.unknown()).default({}),
  isPublic: z.boolean().default(false),
});
