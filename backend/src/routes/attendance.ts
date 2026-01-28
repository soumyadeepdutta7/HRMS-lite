import express from "express";
import { z } from "zod";
import { prisma } from "../prisma";

export const attendanceRouter = express.Router();

const attendanceSchema = z.object({
  employeeId: z.string().uuid("Invalid employee ID"),
  date: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
    message: "Invalid date",
  }),
  status: z.enum(["PRESENT", "ABSENT"]),
});

attendanceRouter.post("/", async (req, res, next) => {
  try {
    const parsed = attendanceSchema.parse(req.body);

    const date = new Date(parsed.date);

    const attendance = await prisma.attendance.create({
      data: {
        employeeId: parsed.employeeId,
        date,
        status: parsed.status,
      },
    });

    res.status(201).json(attendance);
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

attendanceRouter.get("/", async (req, res, next) => {
  try {
    const { employeeId, from, to } = req.query;

    const where: any = {};

    if (employeeId && typeof employeeId === "string") {
      where.employeeId = employeeId;
    }

    if (from || to) {
      where.date = {};
      if (from && typeof from === "string" && !Number.isNaN(Date.parse(from))) {
        where.date.gte = new Date(from);
      }
      if (to && typeof to === "string" && !Number.isNaN(Date.parse(to))) {
        where.date.lte = new Date(to);
      }
    }

    const records = await prisma.attendance.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        employee: true,
      },
    });

    res.json(records);
  } catch (err) {
    next(err);
  }
});

attendanceRouter.get("/summary/by-employee", async (_req, res, next) => {
  try {
    const summaries = await prisma.attendance.groupBy({
      by: ["employeeId", "status"],
      _count: { _all: true },
    });

    const employees = await prisma.employee.findMany();
    const result = employees.map((e: any) => {
      const presentEntry = summaries.find((s: any) => {
        return s.employeeId === e.id && s.status === "PRESENT";
      });
      return {
        employeeId: e.id,
        employeeCode: e.employeeId,
        fullName: e.fullName,
        department: e.department,
        totalPresent: presentEntry?._count._all ?? 0,
      };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

attendanceRouter.get("/dashboard-summary", async (_req, res, next) => {
  try {
    const totalEmployees = await prisma.employee.count();

    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const todayAttendance = await prisma.attendance.groupBy({
      by: ["status"],
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      _count: { _all: true },
    });

    const presentToday =
      todayAttendance.find((a: any) => a.status === "PRESENT")?._count._all ?? 0;
    const absentToday =
      todayAttendance.find((a: any) => a.status === "ABSENT")?._count._all ?? 0;

    res.json({
      totalEmployees,
      presentToday,
      absentToday,
    });
  } catch (err) {
    next(err);
  }
});

