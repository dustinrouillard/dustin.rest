import { Client } from 'minio';

import { MinioStorage } from 'modules/config';

const minio = new Client({
  endPoint: MinioStorage.Config.endpoint,
  useSSL: MinioStorage.Config.ssl,
  port: MinioStorage.Config.port,
  accessKey: MinioStorage.Config.accessKey,
  secretKey: MinioStorage.Config.secretKey
});

export type UploadType = 'image' | 'file';
export const AlllowedTypes = ['image/gif', 'image/png', 'image/svg', 'image/webp', 'image/jpeg'];
export const AlllowedFileTypes = [...AlllowedTypes, 'application/zip'];

interface UploadOptions {
  path: string;
  file: Buffer;
  public: boolean;
  type: string;
}

export async function UploadFile(options: UploadOptions): Promise<boolean> {
  return new Promise((resolve, reject) => {
    // Metadata and content dispostion
    const metadata: { [key: string]: string | object } = { 'content-type': options.type };
    if (!(options.type.startsWith('image/') && !options.type.includes('svg')) && !options.type.startsWith('video/') && !options.type.startsWith('text/')) metadata.contentDisposition = 'attachment';

    minio.putObject(MinioStorage.Bucket, options.path, options.file, options.file.length, metadata, (error, test) => {
      if (error) return reject(error);

      return resolve(true);
    });
  });
}
