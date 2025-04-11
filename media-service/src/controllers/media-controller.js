const Media = require('../models/Media');
const { uploadMediaToCloudinary } = require('../utils/cloudinary');
const logger = require('../utils/logger');

const uploadMedia = async (req, res) => {
    logger.info("Starting media upload");
    try {
        if (!req.file) {
            logger.error('No file found. Please try adding a file again.');
            return res.status(400).json({
                success: false,
                message: "No file found. Please try adding a file again."
            });
        }

        const { originalname, mimetype, buffer } = req.file; // Fix: `originalName` → `originalname`, `mimeType` → `mimetype`
        const userId = req.user.userId;

        logger.info(`File details: name=${originalname}, type=${mimetype}`);
        logger.info('Uploading to Cloudinary...');

        const cloudinaryUploadResult = await uploadMediaToCloudinary(req.file);
        logger.info(`Cloudinary upload successful. Public ID: ${cloudinaryUploadResult.public_id}`);

        const newlyCreatedMedia = new Media({
            publicId: cloudinaryUploadResult.public_id,
            originalName: originalname, // Fix: Ensure consistency with `originalname`
            mimeType: mimetype, // Fix: Ensure consistency with `mimetype`
            url: cloudinaryUploadResult.secure_url,
            userId
        });

        await newlyCreatedMedia.save();

        res.status(201).json({
            success: true,
            mediaId: newlyCreatedMedia._id,
            url: newlyCreatedMedia.url,
            message: "Media upload was successful." 
        });

    } catch (error) {
        logger.error("Error uploading media", error);
        res.status(500).json({
            success: false,
            message: "Error uploading media.",
        });
    }
};

const getAllMedias = async(req,res) => {
    try {
        const results = await Media.find({})
        res.json({results})
    } catch (error) {
        logger.error("Error fetching media", error);
        res.status(500).json({
            success: false,
            message: "Error fetching media.",
        });
    }
}

module.exports = { uploadMedia,getAllMedias };
