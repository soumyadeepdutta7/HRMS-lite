import express from "express";
import { z } from "zod";
import { prisma } from "../prisma";

export const employeeRouter = express.Router();

const employeeSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  department: z.string().min(1, "Department is required"),
});

employeeRouter.post("/", async (req, res, next) => {
  try {
    const parsed = employeeSchema.parse(req.body);

    try {
      const employee = await prisma.employee.create({
        data: parsed,
      });
      res.status(201).json(employee);
    } catch (err: any) {
      if (err.code === "P2002") {
        // Unique constraint failed
        const target = (err.meta?.target as string[]) || [];
        if (target.includes("employeeId")) {
          return res.status(409).json({ message: "Employee ID already exists" });
        }
        if (target.includes("email")) {
          return res.status(409).json({ message: "Email already exists" });
        }
      }
      throw err;
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: err.flatten(),
      });
    }
    next(err);
  }
});

employeeRouter.get("/", async (_req, res, next) => {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(employees);
  } catch (err) {
    next(err);
  }
});

employeeRouter.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.employee.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (err: any) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Employee not found" });
    }
    next(err);
  }
});

