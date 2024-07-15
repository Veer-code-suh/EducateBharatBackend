const s3 = require('aws-sdk/clients/s3')
const fs = require('fs')
require('dotenv').config()


const AWS_BUCKET_NAME= process.env.AWS_BUCKET_NAME
const AWS_REGION= process.env.AWS_REGION
const AWS_ACCESS_KEY_ID= process.env.AWS_ACCESS_KEY_ID
const AWS_SECRET_ACCESS_KEY= process.env.AWS_SECRET_ACCESS_KEY


const s3Client = new s3({
    region: AWS_REGION,
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
})


function uploadFile(file){
    const fileStream = fs.createReadStream(file.path)

    const uploadParams = {
        Bucket: AWS_BUCKET_NAME,
        Body: fileStream,
        Key: file.filename
    }

    return s3Client.upload(uploadParams).promise()
}

module.exports = {
    uploadFile
}