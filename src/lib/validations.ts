import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "الاسم قصير جداً").max(80, "الاسم طويل جداً"),
  email: z.string().trim().email("البريد الإلكتروني غير صالح").optional(),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{8,15}$/, "رقم الجوال غير صالح")
    .optional(),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل").max(100),
}).refine((v) => v.email || v.phone, {
  message: "أدخل بريداً إلكترونياً أو رقم جوال",
  path: ["email"],
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "أدخل بريدك الإلكتروني أو رقم جوالك"),
  password: z.string().min(1, "أدخل كلمة المرور"),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1, "اسم التصنيف مطلوب").max(60),
  nameEn: z.string().trim().max(60).optional().or(z.literal("")),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "لون غير صالح").default("#22c55e"),
  icon: z.string().trim().max(30).default("dumbbell"),
});

export const exerciseSchema = z.object({
  name: z.string().trim().min(1, "اسم التمرين مطلوب").max(120),
  nameEn: z.string().trim().max(120).optional().or(z.literal("")),
  categoryId: z.string().uuid().optional().or(z.literal("").transform(() => null)),
  imageUrl: z.string().url().max(500).optional().or(z.literal("").transform(() => null)),
  notes: z.string().trim().max(500).optional().or(z.literal("").transform(() => null)),
});

export const logSchema = z.object({
  exerciseId: z.string().uuid("التمرين غير صالح"),
  weightKg: z.coerce
    .number({ invalid_type_error: "الوزن يجب أن يكون رقماً" })
    .positive("الوزن يجب أن يكون أكبر من صفر")
    .max(600, "الوزن كبير جداً"),
  reps: z.coerce
    .number({ invalid_type_error: "التكرارات يجب أن تكون رقماً" })
    .int("التكرارات يجب أن تكون عدداً صحيحاً")
    .positive("التكرارات يجب أن تكون أكبر من صفر")
    .max(100, "التكرارات كبيرة جداً"),
  note: z.string().trim().max(300).optional().or(z.literal("").transform(() => null)),
  loggedAt: z.coerce.date(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type ExerciseInput = z.infer<typeof exerciseSchema>;
export type LogInput = z.infer<typeof logSchema>;
