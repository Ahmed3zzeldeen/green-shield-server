import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_DEFAULT_REGION!,
  endpoint: process.env.AWS_ENDPOINT_URL,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});

export const uploadToS3 = async (
  file: Express.Multer.File,
  folder: string = "scans"
): Promise<{ url: string; key: string }> => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const ext = file.originalname.split(".").pop()?.toLowerCase() || "jpg";
  const key = `${folder}/${timestamp}_${random}.${ext}`;

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
      Body: file.buffer || file.stream,
      ContentType: file.mimetype,
    },
  });

  await upload.done();

  const url = `${process.env.AWS_ENDPOINT_URL!.replace(
    "https://",
    "https://"
  )}/${process.env.AWS_S3_BUCKET_NAME}/${key}`;

  return { url, key };
};

export const deleteFromS3 = async (key: string) => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
  });
  await s3Client.send(command);
};

export const getPresignedUrl = async (key: string, expiresIn = 3600) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
  });
  return await getSignedUrl(s3Client, command, { expiresIn });
};

export { s3Client };