import { SeverityLevel } from "@prisma/client";
import { prisma } from "../lib/prisma";

const diseases = [
  {
    nameEn: "Healthy",
    nameAr: "سليمة",
    descriptionEn: "No disease detected on the leaf.",
    descriptionAr: "لا يوجد مرض على الورقة.",
    severityLevel: "Low",
  },
  {
    nameEn: "Common Rust",
    nameAr: "الصدأ الشائع",
    descriptionEn:
      "Caused by Puccinia sorghi. Orange-brown pustules on leaves.",
    descriptionAr: "يسببه فطر Puccinia sorghi. بقع برتقالية بنية على الأوراق.",
    severityLevel: "Medium",
  },
  {
    nameEn: "Gray Leaf Spot",
    nameAr: "بقعة الورقة الرمادية",
    descriptionEn: "Caused by Cercospora zeae-maydis. Rectangular gray spots.",
    descriptionAr: "يسببه فطر Cercospora. بقع مستطيلة رمادية اللون.",
    severityLevel: "High",
  },
  {
    nameEn: "Blight",
    nameAr: "لفحة الأوراق",
    descriptionEn:
      "Northern Corn Leaf Blight (Exserohilum turcicum). Long gray-green lesions.",
    descriptionAr: "لفحة شمال الذرة. آفات طويلة رمادية خضراء.",
    severityLevel: "High",
  },
];

async function main() {
  for (const d of diseases) {
    const level = d.severityLevel.toUpperCase() as SeverityLevel;
    await prisma.disease.upsert({
      where: { nameEn: d.nameEn },
      update: {},
      create: {
        nameEn: d.nameEn,
        nameAr: d.nameAr,
        descriptionEn: d.descriptionEn,
        descriptionAr: d.descriptionAr,
        severityLevel: level,
      },
    });
  }
  console.log("Seeded 4 diseases + Healthy");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
