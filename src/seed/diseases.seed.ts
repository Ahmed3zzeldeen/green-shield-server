import { SeverityLevel } from "@prisma/client";
import { prisma } from "../lib/prisma";

const diseases = [
  {
    nameEn: "Healthy",
    nameAr: "سليمة",
    descriptionEn: "No disease detected on the leaf.",
    descriptionAr: "لا يوجد مرض على الورقة.",
    severityLevel: SeverityLevel.LOW,
    treatments: [
      {
        titleEn: "No treatment required",
        titleAr: "لا يلزم علاج",
        descriptionEn: "The plant is healthy. Continue regular care and monitoring.",
        descriptionAr: "النبات سليم. استمر في العناية الروتينية والمراقبة.",
        isChemical: false,
      },
    ],
  },
  {
    nameEn: "Common Rust",
    nameAr: "الصدأ الشائع",
    descriptionEn:
      "Caused by Puccinia sorghi. Orange-brown pustules on leaves.",
    descriptionAr: "يسببه فطر Puccinia sorghi. بقع برتقالية بنية على الأوراق.",
    severityLevel: SeverityLevel.MEDIUM,
    treatments: [
      {
        titleEn: "Apply Fungicide (Mancozeb or Propiconazole)",
        titleAr: "استخدم مبيد فطري (مانكوزيب أو بروبيكونازول)",
        descriptionEn: "Apply early when symptoms appear. Repeat every 7-14 days.",
        descriptionAr: "رش عند ظهور الأعراض مبكرًا. كرر كل 7-14 يوم.",
        isChemical: true,
      },
      {
        titleEn: "Remove and destroy infected leaves",
        titleAr: "إزالة وحرق الأوراق المصابة",
        descriptionEn: "Reduces fungal spores for next season.",
        descriptionAr: "يقلل من جراثيم الفطر للموسم القادم.",
        isChemical: false,
      },
      {
        titleEn: "Plant resistant varieties",
        titleAr: "زراعة أصناف مقاومة",
        descriptionEn: "Best long-term solution.",
        descriptionAr: "أفضل حل على المدى الطويل.",
        isChemical: false,
      },
    ],
  },
  {
    nameEn: "Gray Leaf Spot",
    nameAr: "بقعة الورقة الرمادية",
    descriptionEn: "Caused by Cercospora zeae-maydis. Rectangular gray spots.",
    descriptionAr: "يسببه فطر Cercospora. بقع مستطيلة رمادية اللون.",
    severityLevel: SeverityLevel.HIGH,
    treatments: [
      {
        titleEn: "Apply Strobilurin fungicides (Azoxystrobin)",
        titleAr: "استخدم مبيدات الستروبيلورين (أزوكسي ستروبين)",
        descriptionEn: "Most effective. Apply at first sign of disease.",
        descriptionAr: "الأكثر فعالية. رش عند أول علامة.",
        isChemical: true,
      },
      {
        titleEn: "Improve air circulation",
        titleAr: "تحسين التهوية بين النباتات",
        descriptionEn: "Wider spacing and weed control reduces humidity.",
        descriptionAr: "المسافات الأوسع ومكافحة الحشائش تقلل الرطوبة.",
        isChemical: false,
      },
      {
        titleEn: "Crop rotation (avoid continuous corn)",
        titleAr: "تناوب المحاصيل (تجنب زراعة الذرة متتالية)",
        descriptionEn: "Breaks disease cycle.",
        descriptionAr: "يكسر دورة المرض.",
        isChemical: false,
      },
    ],
  },
  {
    nameEn: "Blight",
    nameAr: "لفحة الأوراق",
    descriptionEn:
      "Northern Corn Leaf Blight (Exserohilum turcicum). Long gray-green lesions.",
    descriptionAr: "لفحة شمال الذرة. آفات طويلة رمادية خضراء.",
    severityLevel: SeverityLevel.HIGH,
    treatments: [
      {
        titleEn: "Apply fungicide (Chlorothalonil or QoI)",
        titleAr: "رش مبيد فطري (كلوروثالونيل أو QoI)",
        descriptionEn: "Start preventive spraying in humid conditions.",
        descriptionAr: "ابدأ الرذاذ الوقائي في الجو الرطب.",
        isChemical: true,
      },
      {
        titleEn: "Use resistant hybrids",
        titleAr: "استخدام هجين مقاوم لللفحة",
        descriptionEn: "Most effective long-term control.",
        descriptionAr: "أفضل تحكم طويل الأمد.",
        isChemical: false,
      },
      {
        titleEn: "Bury or remove crop residue",
        titleAr: "دفن أو إزالة بقايا المحصول",
        descriptionEn: "Reduces overwintering fungus.",
        descriptionAr: "يقلل من الفطر الشتوي.",
        isChemical: false,
      },
      {
        titleEn: "Early planting",
        titleAr: "الزراعة المبكرة",
        descriptionEn: "Helps plant escape peak infection period.",
        descriptionAr: "يساعد النبات على تجنب ذروة الإصابة.",
        isChemical: false,
      },
    ],
  },
];

async function main() {
  console.log("Starting seeding diseases + treatments...");

  for (const diseaseData of diseases) {
    const disease = await prisma.disease.upsert({
      where: { nameEn: diseaseData.nameEn },
      update: {},
      create: {
        nameEn: diseaseData.nameEn,
        nameAr: diseaseData.nameAr,
        descriptionEn: diseaseData.descriptionEn,
        descriptionAr: diseaseData.descriptionAr,
        severityLevel: diseaseData.severityLevel,
      },
    });

    await prisma.treatment.deleteMany({
      where: { diseaseId: disease.id },
    });

    for (const treatment of diseaseData.treatments) {
      await prisma.treatment.create({
        data: {
          diseaseId: disease.id,
          titleEn: treatment.titleEn,
          titleAr: treatment.titleAr,
          descriptionEn: treatment.descriptionEn,
          descriptionAr: treatment.descriptionAr,
          isChemical: treatment.isChemical,
        },
      });
    }

    console.log(`Seeded: ${disease.nameEn} (${diseaseData.treatments.length} treatments)`);
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => console.error("Seeding failed:", e))
  .finally(async () => await prisma.$disconnect());
