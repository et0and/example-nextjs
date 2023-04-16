// /api/upload.js
const B2 = require('b2-sdk');

const b2 = new B2({
  applicationKeyId: process.env.B2_APPLICATION_KEY_ID,
  applicationKey: process.env.B2_APPLICATION_KEY
});

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const fileName = req.body.filename;
    const fileContent = req.body.file;

    // Authorize and get the URL to upload the file
    await b2.authorize();
    const uploadURL = await b2.getUploadUrl(process.env.B2_BUCKET_ID);

    // Upload the file
    const uploadFileResponse = await b2.uploadFile({
      uploadUrl: uploadURL.data.uploadUrl,
      uploadAuthToken: uploadURL.data.authorizationToken,
      filename: fileName,
      data: Buffer.from(fileContent, 'binary')
    });

    res.status(200).json({ success: true, message: 'File uploaded successfully.' });
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed.' });
  }
};
