// api/upload.js
import { createError } from 'micro';
import { uploader } from 'micro-upload';
import fetch from 'node-fetch';
import FormData from 'form-data';

const upload = uploader({});

export default async function handler(req, res) {
  try {
    const files = await upload(req, res);

    if (!files) {
      throw createError(400, 'No file received');
    }

    req.files = files;

    // Add the rest of your handler code here (Backblaze B2 upload logic)
    const apiUrl = "https://api.backblazeb2.com/b2api/v2/";
    const authorizationToken = process.env.ACCOUNT_AUTH_TOKEN;
    const accountId = process.env.ACCOUNT_ID;
    const bucketId = process.env.BUCKET_ID;
    const bucketName = process.env.BUCKET_NAME;

    const glbFile = req.files?.glbFile;

    if (!glbFile) {
      return res.status(400).json({ message: "File not found" });
    }

    // Get the upload URL and authorization token
    const uploadUrlRes = await fetch(`${apiUrl}b2_get_upload_url`, {
      method: "POST",
      headers: {
        "Authorization": authorizationToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accountId: accountId,
        bucketId: bucketId,
      }),
    });
    const uploadUrlData = await uploadUrlRes.json();

    // Prepare the .glb file for uploading
    const fileFormData = new FormData();
    fileFormData.append("file", glbFile.data, {
      filename: glbFile.name,
      contentType: glbFile.mimetype,
    });

    // Upload the .glb file to the Backblaze B2 bucket
    const fileRes = await fetch(uploadUrlData.uploadUrl, {
      method: "POST",
      headers: {
        "Authorization": uploadUrlData.authorizationToken,
        "X-Bz-File-Name": encodeURIComponent(glbFile.name),
        "Content-Type": glbFile.mimetype,
        "X-Bz-Content-Sha1": "do_not_verify",
      },
      body: fileFormData,
    });

    if (fileRes.status === 200) {
      // Generate the public URL for the uploaded .glb file
      const fileUrl = `https://cdn.tewahi.me/${encodeURIComponent(glbFile.name)}`;
      return res.status(200).json({ fileUrl });
    } else {
      return res.status(500).json({ message: "Error uploading file" });
    }
  } catch (err) {
    res.statusCode = err.statusCode || 500;
    res.end(err.message);
  }
}
